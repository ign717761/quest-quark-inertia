import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import { Separator } from '@/components/ui/separator';
import boardsRoute from '@/routes/boards';
import boardsUsersRoute from '@/routes/boards/users';
import columnsRoute from '@/routes/columns';
import { BoardSettingsData, BoardRole, Column, SharedData, User } from '@/types';
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
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, GripVertical, Plus, Shield, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ColumnDraft = Pick<Column, 'id' | 'title' | 'type' | 'position'>;

const columnTypeOptions: Array<{ value: Column['type']; label: string }> = [
    { value: 'backlog', label: 'Бэклог' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'done', label: 'Готово' },
];

const roleLabels: Record<BoardRole, string> = {
    admin: 'Администратор',
    editor: 'Редактор',
    viewer: 'Читатель',
};

function normalizeColumns(columns: Column[]): ColumnDraft[] {
    return [...columns].sort((a, b) => a.position - b.position);
}

export function BoardGeneralSettingsSection({
    board,
    optimisticTitle,
    onOptimisticTitleChange,
}: {
    board: BoardSettingsData;
    optimisticTitle: string;
    onOptimisticTitleChange: (title: string) => void;
}) {
    const { auth } = usePage<SharedData>().props;
    const currentUser = board.users.find((user) => user.id === auth.user.id);
    const currentRole = currentUser?.pivot?.role;
    const canEditBoard = currentRole === 'admin' || currentRole === 'editor';
    const isAdmin = currentRole === 'admin';

    const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

    const generalForm = useForm({
        title: optimisticTitle,
    });

    useEffect(() => {
        generalForm.setData('title', optimisticTitle);
    }, [optimisticTitle]);

    const submitGeneral = (event: React.FormEvent) => {
        event.preventDefault();
        const previousTitle = board.title;

        generalForm.patch(boardsRoute.update(board.id).url, {
            preserveScroll: true,
            onError: () => {
                onOptimisticTitleChange(previousTitle);
                generalForm.setData('title', previousTitle);
            },
        });
    };

    return (
        <>
            <div className="space-y-6">
                <HeadingSmall
                    title="Основная информация"
                    description="Измените название доски. Основной рабочий экран останется сфокусированным только на задачах."
                />

                {!canEditBoard && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Только просмотр</AlertTitle>
                        <AlertDescription>
                            У вас нет прав на изменение основной информации этой
                            доски.
                        </AlertDescription>
                    </Alert>
                )}

                <form className="space-y-6" onSubmit={submitGeneral}>
                    <div className="grid gap-2">
                        <Label htmlFor="board-title">Название доски</Label>
                        <Input
                            id="board-title"
                            value={generalForm.data.title}
                            disabled={!canEditBoard || generalForm.processing}
                            onChange={(event) => {
                                generalForm.setData('title', event.target.value);
                                onOptimisticTitleChange(event.target.value);
                            }}
                        />
                        <InputError message={generalForm.errors.title} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={!canEditBoard || generalForm.processing}
                        >
                            Сохранить
                        </Button>
                    </div>
                </form>
            </div>

            <BoardDeleteSection
                board={board}
                isAdmin={isAdmin}
                open={isDeleteBoardOpen}
                onOpenChange={setIsDeleteBoardOpen}
            />
        </>
    );
}

function SortableColumnItem({
    column,
    disabled,
    processing,
    error,
    onChange,
    onSave,
    onDelete,
}: {
    column: ColumnDraft;
    disabled: boolean;
    processing: boolean;
    error?: string;
    onChange: (columnId: number, patch: Partial<ColumnDraft>) => void;
    onSave: (columnId: number) => void;
    onDelete: (column: ColumnDraft) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.6 : 1,
            }}
        >
            <Card className="py-4">
                <CardContent className="space-y-4 px-4">
                    <div className="flex items-start gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-7 h-9 w-9 shrink-0 cursor-grab active:cursor-grabbing"
                            disabled={disabled}
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-4 w-4" />
                        </Button>

                        <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                            <div className="space-y-2">
                                <Label htmlFor={`column-title-${column.id}`}>
                                    Название
                                </Label>
                                <Input
                                    id={`column-title-${column.id}`}
                                    value={column.title}
                                    disabled={disabled}
                                    onChange={(event) =>
                                        onChange(column.id, {
                                            title: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Тип</Label>
                                <Select
                                    value={column.type}
                                    disabled={disabled}
                                    onValueChange={(value: Column['type']) =>
                                        onChange(column.id, { type: value })
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
                            </div>

                        </div>
                    </div>

                    {error && <InputError message={error} />}

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={disabled}
                            onClick={() => onDelete(column)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Удалить
                        </Button>
                        <Button
                            type="button"
                            disabled={disabled || processing}
                            onClick={() => onSave(column.id)}
                        >
                            Сохранить
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function BoardColumnsSettingsSection({
    board,
}: {
    board: BoardSettingsData;
}) {
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

    const submitCreateColumn = (event: React.FormEvent) => {
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
                tasks_count: 0,
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
                        <CardDescription>
                            Добавление колонок вынесено из основной доски.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="grid gap-4" onSubmit={submitCreateColumn}>
                            <div className="grid gap-2">
                                <Label htmlFor="new-column-title">
                                    Название
                                </Label>
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
                    <HeadingSmall
                        title="Порядок и параметры колонок"
                        description="Перетаскивайте колонки за ручку. Новый порядок сохраняется в `position`."
                    />

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

                    {movingColumnId && (
                        <p className="text-sm text-muted-foreground">
                            Сохраняется новый порядок колонки #{movingColumnId}.
                        </p>
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
                            onClick={() => {
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

                                router.delete(
                                    columnsRoute.destroy(columnToDelete.id).url,
                                    {
                                        preserveScroll: true,
                                        onError: () => {
                                            setColumns(previousColumns);
                                        },
                                    },
                                );
                            }}
                        >
                            Удалить колонку
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function BoardMembersSettingsSection({
    board,
}: {
    board: BoardSettingsData;
}) {
    const { auth } = usePage<SharedData>().props;

    const [memberToRemove, setMemberToRemove] = useState<User | null>(null);
    const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);
    const [users, setUsers] = useState<User[]>(board.users);

    const inviteForm = useForm({
        email: '',
    });

    const currentUser = useMemo(
        () => users.find((user) => user.id === auth.user.id),
        [auth.user.id, users],
    );
    const currentRole = currentUser?.pivot?.role;
    const canEditBoard = currentRole === 'admin' || currentRole === 'editor';
    const isAdmin = currentRole === 'admin';

    useEffect(() => {
        setUsers(board.users);
    }, [board.users]);

    const submitInvite = (event: React.FormEvent) => {
        event.preventDefault();
        const previousUsers = users;
        const previousEmail = inviteForm.data.email;
        const tempUserId = -Date.now();

        setUsers((current) => [
            ...current,
            {
                id: tempUserId,
                name:
                    inviteForm.data.email.split('@')[0] || inviteForm.data.email,
                email: inviteForm.data.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                pivot: {
                    id: tempUserId,
                    board_id: board.id,
                    user_id: tempUserId,
                    role: 'editor',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        ]);
        inviteForm.reset();

        inviteForm.post(boardsRoute.invite(board.id).url, {
            preserveScroll: true,
            onError: () => {
                setUsers(previousUsers);
                inviteForm.setData('email', previousEmail);
            },
        });
    };

    const updateMemberRole = (userId: number, role: 'editor' | 'viewer') => {
        const previousUsers = users;
        setUpdatingMemberId(userId);
        setUsers((current) =>
            current.map((user) =>
                user.id === userId
                    ? {
                          ...user,
                          pivot: user.pivot ? { ...user.pivot, role } : user.pivot,
                      }
                    : user,
            ),
        );
        router.patch(
            boardsUsersRoute.update({ board: board.id, user: userId }).url,
            { role },
            {
                preserveScroll: true,
                onError: () => {
                    setUsers(previousUsers);
                },
                onFinish: () => setUpdatingMemberId(null),
            },
        );
    };

    const removeMember = () => {
        if (!memberToRemove) {
            return;
        }
        const previousUsers = users;

        setUsers((current) =>
            current.filter((user) => user.id !== memberToRemove.id),
        );
        setMemberToRemove(null);

        router.delete(
            boardsUsersRoute.remove({
                board: board.id,
                user: memberToRemove.id,
            }).url,
            {
                preserveScroll: true,
                onError: () => {
                    setUsers(previousUsers);
                },
            },
        );
    };

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Приглашение участника"
                        description="Отправьте письмо с приглашением. Пользователь сможет открыть ссылку и присоединиться к доске под этим email."
                    />

                    <form className="space-y-6" onSubmit={submitInvite}>
                        <div className="grid gap-2">
                            <Label htmlFor="invite-email">Email</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                value={inviteForm.data.email}
                                disabled={!canEditBoard || inviteForm.processing}
                                onChange={(event) =>
                                    inviteForm.setData('email', event.target.value)
                                }
                                placeholder="user@example.com"
                            />
                            <InputError message={inviteForm.errors.email} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={!canEditBoard || inviteForm.processing}
                            >
                                <Users className="h-4 w-4" />
                                Пригласить
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <HeadingSmall
                        title="Участники доски"
                        description={`${users.length} участников подключено к этой доске.`}
                    />

                    <div className="space-y-4">
                        {users.map((user) => {
                            const role = user.pivot?.role;
                            const isCurrentUser = user.id === auth.user.id;
                            const isRoleEditable = isAdmin && role !== 'admin';

                            return (
                                <div
                                    key={user.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                {role && (
                                                    <Badge
                                                        variant={
                                                            role === 'admin'
                                                                ? 'default'
                                                                : role === 'editor'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {roleLabels[role]}
                                                    </Badge>
                                                )}
                                                {isCurrentUser && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Вы
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>

                                        {role === 'admin' ? (
                                            <div className="flex items-center gap-2 text-sm text-primary">
                                                <Shield className="h-4 w-4" />
                                                Администратор
                                            </div>
                                        ) : isRoleEditable ? (
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                <Select
                                                    value={role}
                                                    disabled={updatingMemberId === user.id}
                                                    onValueChange={(
                                                        value: 'editor' | 'viewer',
                                                    ) =>
                                                        updateMemberRole(
                                                            user.id,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="editor">
                                                            Редактор
                                                        </SelectItem>
                                                        <SelectItem value="viewer">
                                                            Читатель
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setMemberToRemove(user)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Удалить
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {!isAdmin
                                                    ? 'Изменение ролей доступно только администратору.'
                                                    : 'Роль администратора нельзя изменить отсюда.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Dialog
                open={memberToRemove !== null}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить участника?</DialogTitle>
                        <DialogDescription>
                            Пользователь {memberToRemove?.name} потеряет доступ к
                            этой доске.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMemberToRemove(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={removeMember}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function BoardDeleteSection({
    board,
    isAdmin,
    open,
    onOpenChange,
}: {
    board: BoardSettingsData;
    isAdmin: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [isDeletingOptimistically, setIsDeletingOptimistically] =
        useState(false);

    const deleteBoard = () => {
        setIsDeletingOptimistically(true);
        onOpenChange(false);

        router.delete(boardsRoute.destroy(board.id).url, {
            onError: () => {
                setIsDeletingOptimistically(false);
            },
        });
    };

    return (
        <>
            <div className="space-y-6">
                <HeadingSmall
                    title="Красная зона"
                    description="Необратимые действия для всей доски."
                />
                <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                    <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                        <p className="font-medium">Внимание</p>
                        <p className="text-sm">
                            {isDeletingOptimistically
                                ? 'Удаляем доску...'
                                : 'Пожалуйста, действуйте осторожно, это непоправимо.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-red-600 dark:text-red-100">
                            Будут удалены доска, ее колонки, задачи и участники.
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!isAdmin || isDeletingOptimistically}
                            onClick={() => onOpenChange(true)}
                        >
                            Удалить доску
                        </Button>
                    </div>

                    {!isAdmin && (
                        <p className="text-sm text-muted-foreground">
                            Удалять доску может только администратор.
                        </p>
                    )}
                </div>
            </div>

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить доску?</DialogTitle>
                        <DialogDescription>
                            Доска «{board.title}» и все связанные данные будут
                            удалены безвозвратно.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={deleteBoard}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
