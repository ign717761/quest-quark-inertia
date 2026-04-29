import { Button } from '@/components/ui/button';
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
import { Check, MoreHorizontal, Plus } from 'lucide-react';
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
        'owner';
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

    const columnTone = {
        backlog: 'text-zinc-100',
        in_progress: 'text-[#6ea4ff]',
        done: 'text-[#3bd274]',
    }[column.type] ?? 'text-[#c175ff]';

    const titleTone =
        column.title.toLowerCase().includes('review') ||
        column.title.toLowerCase().includes('провер')
            ? 'text-[#c175ff]'
            : columnTone;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="h-full w-[300px] shrink-0"
        >
            <section className="flex max-h-full min-h-[420px] flex-col rounded-lg border border-white/10 bg-[#14171d]/78 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur">
                <div
                    className="flex items-center justify-between gap-2 px-3 pt-3 pb-2"
                    {...listeners}
                >
                    {isEditing && isAdmin ? (
                        <div className="flex flex-1 items-center gap-1">
                            <Input
                                className="h-8 border-white/10 bg-black/30 px-2 py-0 text-sm text-white"
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
                                className="h-8 w-8 text-emerald-400 hover:bg-white/8"
                                onClick={handleSave}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <button
                            className={`min-w-0 flex-1 truncate text-left text-base font-bold ${titleTone} ${isAdmin ? 'cursor-pointer hover:text-white' : ''}`}
                            onClick={() => isAdmin && setIsEditing(true)}
                        >
                            {column.title}
                        </button>
                    )}

                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/9 px-2 text-xs font-semibold text-zinc-300">
                        {tasks.length}
                    </span>

                    {canCreateTask && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-md text-zinc-400 hover:bg-white/8 hover:text-white"
                            onClick={onAddTask}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}

                    {isAdmin && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-md text-zinc-400 hover:bg-white/8 hover:text-white"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <SortableContext
                        items={tasks.map((t) => getTaskDndId(t.id))}
                        strategy={verticalListSortingStrategy}
                    >
                        {renderedTasks}
                    </SortableContext>
                </div>

                {canCreateTask && (
                    <div className="px-3 py-3">
                        <Button
                            variant="ghost"
                            className="h-9 w-full justify-center rounded-md text-sm text-zinc-400 hover:bg-white/7 hover:text-zinc-100"
                            onClick={onAddTask}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить задачу
                        </Button>
                    </div>
                )}
            </section>

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
