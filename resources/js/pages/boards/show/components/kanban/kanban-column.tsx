import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useBoardStore } from '@/stores/use-board-store';
import { Column, SharedData, Task } from '@/types';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router, usePage } from '@inertiajs/react';
import { Check, GripVertical, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import KanbanTask from './kanban-task';

interface KanbanColumnProps {
    column: Column;
    tasks: Task[];
    isTaskDragging: boolean;
    dropPreviewIndex: number | null;
    getTaskDndId: (id: number) => string;
    getTaskSlotDndId: (columnId: number, index: number) => string;
    onAddTask: () => void;
}

function DropSlot({
    id,
    active,
}: {
    id: string;
    active: boolean;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'task-slot' },
    });

    return (
        <div
            ref={setNodeRef}
            className={`transition-all ${
                active || isOver ? 'py-1.5' : 'py-0.5'
            }`}
        />
    );
}

function DropPreview({
    compact = false,
    label = 'Задача будет добавлена сюда',
}: {
    compact?: boolean;
    label?: string;
}) {
    return (
        <div
            className={`rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 text-primary transition-all ${
                compact ? 'px-3 py-2 text-xs font-medium' : 'px-3 py-3 text-xs'
            }`}
        >
            <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-primary/40" />
                <span className="shrink-0 font-medium">{label}</span>
                <div className="h-px flex-1 bg-primary/40" />
            </div>
        </div>
    );
}

export default function KanbanColumn({
    column,
    tasks,
    isTaskDragging,
    dropPreviewIndex,
    getTaskDndId,
    getTaskSlotDndId,
    onAddTask,
}: KanbanColumnProps) {
    const { auth } = usePage<SharedData>().props;
    const { board, updateColumnTitle } = useBoardStore();

    const isAdmin =
        board?.users?.find((u) => u.id === auth.user.id)?.pivot?.role ===
        'admin';
    const canCreateTask =
        board?.users?.find((u) => u.id === auth.user.id)?.pivot?.role !==
        'viewer';

    const [title, setTitle] = useState(column.title);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `column-${column.id}`,
        data: { type: 'column' },
    });

    const handleSave = () => {
        if (title.trim() === '' || title === column.title) {
            setIsEditing(false);
            setTitle(column.title);
            return;
        }

        updateColumnTitle(column.id, title);
        setIsEditing(false);

        router.patch(
            `/columns/${column.id}`,
            { title },
            {
                preserveScroll: true,
                onError: () => {
                    updateColumnTitle(column.id, column.title);
                    setTitle(column.title);
                },
            },
        );
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition:
            transition ?? (isDragging ? undefined : 'transform 220ms ease'),
        opacity: isDragging ? 0.5 : 1,
    };

    const renderedTasks = tasks.flatMap((task, index) => {
        const items: ReactNode[] = [];

        if (isTaskDragging) {
            items.push(
                <DropSlot
                    key={`drop-slot-${column.id}-${index}`}
                    id={getTaskSlotDndId(column.id, index)}
                    active={dropPreviewIndex === index}
                />,
            );
        }

        if (dropPreviewIndex === index) {
            items.push(
                <DropPreview key={`drop-preview-${column.id}-${index}`} compact />,
            );
        }

        items.push(<KanbanTask key={task.id} task={task} />);

        return items;
    });

    if (isTaskDragging) {
        renderedTasks.push(
            <DropSlot
                key={`drop-slot-${column.id}-${tasks.length}`}
                id={getTaskSlotDndId(column.id, tasks.length)}
                active={dropPreviewIndex === tasks.length}
            />,
        );
    }

    if (dropPreviewIndex === tasks.length) {
        renderedTasks.push(<DropPreview key={`drop-preview-${column.id}-end`} />);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="h-full w-80 shrink-0"
        >
            <Card className="flex max-h-full flex-col border-none bg-secondary/30 shadow-none">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center justify-between gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                        <GripVertical
                            className="h-5 w-5 cursor-grab text-muted-foreground active:cursor-grabbing"
                            {...listeners}
                        />

                        {isEditing && isAdmin ? (
                            <div className="flex flex-1 items-center gap-1">
                                <Input
                                    className="h-7 px-2 py-0 text-sm"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoFocus
                                    onBlur={handleSave}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSave()
                                    }
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={handleSave}
                                >
                                    <Check className="h-4 w-4 text-green-500" />
                                </Button>
                            </div>
                        ) : (
                            <span
                                className={`flex-1 truncate ${isAdmin ? 'cursor-pointer transition-colors hover:text-foreground' : ''}`}
                                onClick={() => isAdmin && setIsEditing(true)}
                            >
                                {column.title}
                            </span>
                        )}

                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                                {tasks.length}
                            </span>

                            {isAdmin && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 opacity-60 hover:opacity-100"
                                    onClick={() => setIsDeleteOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                    <SortableContext
                        items={tasks.map((t) => getTaskDndId(t.id))}
                        strategy={verticalListSortingStrategy}
                    >
                        {renderedTasks}
                    </SortableContext>
                </CardContent>

                {canCreateTask && (
                    <div className="p-2">
                        <Button
                            variant="ghost"
                            className="h-8 w-full justify-start text-xs"
                            onClick={onAddTask}
                        >
                            + Добавить задачу
                        </Button>
                    </div>
                )}
            </Card>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Удалить колонку?</DialogTitle>
                        <DialogDescription>
                            Колонка{' '}
                            <span className="font-medium">
                                «{column.title}»
                            </span>{' '}
                            будет удалена, а задачи автоматически перенесутся в
                            другую колонку. Это действие нельзя отменить.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                router.delete(`/columns/${column.id}`, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setIsDeleteOpen(false);
                                    },
                                    // При ошибке (например, нет прав) диалог просто закроется,
                                    // а сервер вернёт ошибку, которую можно обработать глобально
                                });
                            }}
                        >
                            Удалить колонку
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
