import { useBoardStore } from '@/stores/use-board-store';
import { SharedData, Task } from '@/types';
import { usePage } from '@inertiajs/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckCircle2, ListChecks, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import TaskEditDialog from './task-edit-dialog';

export default function KanbanTask({ task }: { task: Task }) {
    const board = useBoardStore((state) => state.board);
    const { auth } = usePage<SharedData>().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const column = board?.columns.find((item) => item.id === task.column_id);
    const currentRole = board?.users?.find(
        (user) => user.id === auth.user.id,
    )?.pivot?.role;
    const canDragTask =
        currentRole === 'owner' ||
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
                className="h-[154px] rounded-lg border border-dashed border-[#5d78ff]/40 bg-white/6 opacity-50"
            />
        );
    }

    const assigneeName = task.assignee?.name ?? 'Без исполнителя';
    const assigneeInitials = assigneeName
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const date = new Date(task.due_date ?? task.created_at).toLocaleDateString(
        'ru-RU',
        {
            day: 'numeric',
            month: 'short',
        },
    );
    const priorityStyles = {
        low: 'bg-[#173057] text-[#7fb3ff]',
        medium: 'bg-[#5a410b] text-[#ffd05a]',
        high: 'bg-[#5a2020] text-[#ff7b6f]',
    }[task.priority ?? 'medium'];
    const priorityLabel = {
        low: 'Низкий',
        medium: 'Средний',
        high: 'Высокий',
    }[task.priority ?? 'medium'];
    const checklistDone = task.id % 5;
    const checklistTotal = Math.max(checklistDone, (task.id % 4) + 2);
    const commentsCount = task.comments?.length ?? 0;
    const isDone = column?.type === 'done';

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`group relative flex min-h-[154px] flex-col gap-3 rounded-lg border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.045))] p-4 text-zinc-100 shadow-[0_14px_28px_rgba(0,0,0,0.26)] transition-all duration-200 hover:border-white/18 hover:bg-white/[0.11] ${
                    canDragTask
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-pointer'
                }`}
                {...(canDragTask ? attributes : {})}
                {...(canDragTask ? listeners : {})}
                onClick={(e) => {
                    setIsModalOpen(true);
                }}
            >
                {isDone && (
                    <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 fill-[#29b864] text-[#11161c]" />
                )}

                <div className="pr-7">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-white">
                        {task.title}
                    </p>
                    {task.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                            {task.description}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                    <div
                        className="flex min-w-0 items-center gap-2"
                        title={assigneeName}
                    >
                        <div className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#263141]">
                            {task.assignee?.avatar ? (
                                <img
                                    src={task.assignee.avatar}
                                    alt={task.assignee.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f3b48f] to-[#7d4f38] text-[10px] font-bold text-white">
                                    {assigneeInitials}
                                </div>
                            )}
                        </div>
                        <span className="truncate text-xs font-medium text-zinc-300">
                            {assigneeName}
                        </span>
                    </div>

                    {!isDone && (
                        <span
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${priorityStyles}`}
                        >
                            {priorityLabel}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{date}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isDone && (
                            <div className="flex items-center gap-1.5">
                                <ListChecks className="h-3.5 w-3.5" />
                                <span>
                                    {checklistDone}/{checklistTotal}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{commentsCount}</span>
                        </div>
                    </div>
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
