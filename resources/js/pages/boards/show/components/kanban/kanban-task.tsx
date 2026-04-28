import { useBoardStore } from '@/stores/use-board-store';
import { SharedData, Task } from '@/types';
import { usePage } from '@inertiajs/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import TaskEditDialog from './task-edit-dialog';

export default function KanbanTask({ task }: { task: Task }) {
    const board = useBoardStore((state) => state.board);
    const { auth } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const column = board?.columns.find((item) => item.id === task.column_id);
    const currentRole = board?.users?.find((user) => user.id === auth.user.id)?.pivot?.role;
    const canDragTask =
        currentRole === 'admin' ||
        currentRole === 'editor' ||
        task.assignee_id === auth.user.id ||
        (task.assignee_id === null && column?.type === 'backlog');

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `task-${task.id}`,
        data: { type: 'task', task },
        disabled: !canDragTask,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition:
            transition ?? (isDragging ? undefined : 'transform 220ms ease'),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[100px] rounded-lg border-2 border-dashed border-primary/20 bg-accent/50 opacity-50"
            />
        );
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`group relative flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md ${
                    canDragTask ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                }`}
                {...(canDragTask ? attributes : {})}
                {...(canDragTask ? listeners : {})}
                onClick={(e) => {
                    setIsModalOpen(true);
                }}
            >
                <div>
                    <p className="line-clamp-3 text-sm leading-snug font-medium text-card-foreground">
                        {task.title}
                    </p>
                </div>

                <div className="mt-1 flex items-center justify-between border-t border-border/40 pt-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                            {new Date(task.created_at).toLocaleDateString(
                                'ru-RU',
                                {
                                    day: 'numeric',
                                    month: 'short',
                                },
                            )}
                        </span>
                    </div>

                    {task.assignee && (
                        <div
                            className="flex max-w-[120px] items-center gap-1.5 rounded-full bg-muted/50 py-0.5 pr-2 pl-2"
                            title={task.assignee.name}
                        >
                            <div className="relative flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-background">
                                {task.assignee.avatar ? (
                                    <img
                                        src={task.assignee.avatar}
                                        alt={task.assignee.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-primary text-[9px] font-bold text-primary-foreground uppercase">
                                        {task.assignee.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="truncate text-[10px] font-medium text-muted-foreground">
                                {task.assignee.name.split(' ')[0]}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <TaskEditDialog
                task={task}
                boardUsers={board?.users || []}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}
