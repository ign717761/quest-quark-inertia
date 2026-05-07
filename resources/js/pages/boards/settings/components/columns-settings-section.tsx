import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import columnsRoute from '@/routes/columns';
import { BoardSettingsData, Column, SharedData } from '@/types';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Plus } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { columnTypeOptions } from './constants';
import SortableColumnItem from './sortable-column-item';
import { ColumnDraft, normalizeColumns } from './types';

type BoardColumnsSettingsSectionProps = {
    board: BoardSettingsData;
};

export function BoardColumnsSettingsSection({
    board,
}: BoardColumnsSettingsSectionProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUser = useMemo(
        () => board.users.find((user) => user.id === auth.user.id),
        [auth.user.id, board.users],
    );
    const currentRole = currentUser?.pivot?.role;
    const canEditBoard = currentRole === 'admin' || currentRole === 'editor';

    const [columns, setColumns] = useState<ColumnDraft[]>(() =>
        normalizeColumns(board.columns),
    );
    const [columnErrors, setColumnErrors] = useState<Record<number, string>>({});
    const [savingColumnId, setSavingColumnId] = useState<number | null>(null);
    const [movingColumnId, setMovingColumnId] = useState<number | null>(null);
    const [columnToDelete, setColumnToDelete] = useState<ColumnDraft | null>(null);

    const createColumnForm = useForm({
        title: '',
        type: 'in_progress' as Column['type'],
    });

    useEffect(() => {
        setColumns(normalizeColumns(board.columns));
        setColumnErrors({});
    }, [board.columns]);

    const changeColumnDraft = (
        columnId: number,
        patch: Partial<ColumnDraft>,
    ) => {
        setColumns((current) =>
            current.map((column) =>
                column.id === columnId ? { ...column, ...patch } : column,
            ),
        );
        setColumnErrors((current) => {
            if (!(columnId in current)) {
                return current;
            }

            const next = { ...current };
            delete next[columnId];
            return next;
        });
    };

    const submitCreateColumn = (event: FormEvent) => {
        event.preventDefault();
        const previousColumns = columns;
        const previousFormData = { ...createColumnForm.data };
        const tempColumnId = -Date.now();

        setColumns((current) => [
            ...current,
            {
                id: tempColumnId,
                title: createColumnForm.data.title,
                type: createColumnForm.data.type,
                position: current.length,
            },
        ]);
        createColumnForm.reset();
        createColumnForm.setData('type', 'in_progress');

        createColumnForm.post(columnsRoute.store(board.id).url, {
            preserveScroll: true,
            onError: () => {
                setColumns(previousColumns);
                createColumnForm.setData(previousFormData);
            },
        });
    };

    const saveColumn = (columnId: number) => {
        const column = columns.find((item) => item.id === columnId);
        if (!column) {
            return;
        }
        const previousColumns = columns;

        if (column.title.trim() === '') {
            setColumnErrors((current) => ({
                ...current,
                [columnId]: 'Название колонки обязательно.',
            }));
            return;
        }

        setSavingColumnId(columnId);
        router.patch(
            columnsRoute.update(columnId).url,
            {
                title: column.title.trim(),
                type: column.type,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setColumns(previousColumns);
                    setColumnErrors((current) => ({
                        ...current,
                        [columnId]:
                            errors.title ||
                            errors.type ||
                            'Не удалось сохранить колонку.',
                    }));
                },
                onFinish: () => setSavingColumnId(null),
            },
        );
    };

    const handleColumnDragEnd = (event: DragEndEvent) => {
        if (!canEditBoard) {
            return;
        }

        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = columns.findIndex((column) => column.id === active.id);
        const newIndex = columns.findIndex((column) => column.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const previousColumns = columns;
        const nextColumns = arrayMove(columns, oldIndex, newIndex).map(
            (column, index) => ({
                ...column,
                position: index,
            }),
        );
        const movedColumn = previousColumns[oldIndex];

        setColumns(nextColumns);
        setMovingColumnId(movedColumn.id);

        router.patch(
            columnsRoute.move(movedColumn.id).url,
            { position: newIndex },
            {
                preserveScroll: true,
                onError: () => setColumns(previousColumns),
                onFinish: () => setMovingColumnId(null),
            },
        );
    };

    const confirmDeleteColumn = () => {
        if (!columnToDelete) {
            return;
        }

        const previousColumns = columns;

        setColumns((current) =>
            current
                .filter((column) => column.id !== columnToDelete.id)
                .map((column, index) => ({
                    ...column,
                    position: index,
                })),
        );
        setColumnToDelete(null);

        router.delete(columnsRoute.destroy(columnToDelete.id).url, {
            preserveScroll: true,
            onError: () => {
                setColumns(previousColumns);
            },
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
    );

    return (
        <>
            <div className="space-y-6">
                <HeadingSmall
                    title="Колонки"
                    description="Создавайте, переименовывайте и сортируйте колонки только из настроек."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Новая колонка</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={submitCreateColumn}>
                            <div className="grid gap-2">
                                <Label htmlFor="new-column-title">Название</Label>
                                <Input
                                    id="new-column-title"
                                    value={createColumnForm.data.title}
                                    disabled={!canEditBoard || createColumnForm.processing}
                                    onChange={(event) =>
                                        createColumnForm.setData(
                                            'title',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Например: На проверке"
                                />
                                <InputError
                                    message={createColumnForm.errors.title}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Тип</Label>
                                <Select
                                    value={createColumnForm.data.type}
                                    disabled={!canEditBoard || createColumnForm.processing}
                                    onValueChange={(value: Column['type']) =>
                                        createColumnForm.setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columnTypeOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={createColumnForm.errors.type}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={!canEditBoard || createColumnForm.processing}
                                >
                                    <Plus className="h-4 w-4" />
                                    Добавить
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <HeadingSmall title="Порядок и параметры колонок" />

                    {!canEditBoard && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Редактирование недоступно</AlertTitle>
                            <AlertDescription>
                                У вас есть доступ только к просмотру списка
                                колонок.
                            </AlertDescription>
                        </Alert>
                    )}

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleColumnDragEnd}
                    >
                        <SortableContext
                            items={columns.map((column) => column.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {columns.map((column) => (
                                    <SortableColumnItem
                                        key={column.id}
                                        column={column}
                                        disabled={!canEditBoard}
                                        processing={savingColumnId === column.id}
                                        error={columnErrors[column.id]}
                                        onChange={changeColumnDraft}
                                        onSave={saveColumn}
                                        onDelete={setColumnToDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <Dialog
                open={columnToDelete !== null}
                onOpenChange={(open) => !open && setColumnToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить колонку?</DialogTitle>
                        <DialogDescription>
                            Колонка «{columnToDelete?.title}» будет удалена, а ее
                            задачи автоматически перенесутся в другую колонку.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setColumnToDelete(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteColumn}
                        >
                            Удалить колонку
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
