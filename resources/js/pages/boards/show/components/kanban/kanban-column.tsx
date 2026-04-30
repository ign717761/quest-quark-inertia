import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBoardStore } from '@/stores/use-board-store';
import { Column, SharedData, Task } from '@/types';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
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
            className={`transition-all ${active || isOver ? 'py-1.5' : 'py-0.5'}`}
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
            className={`rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 text-primary transition-all ${compact ? 'px-3 py-2 text-xs font-medium' : 'px-3 py-3 text-xs'}`}
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
    const { board } = useBoardStore();

    const canCreateTask =
        board?.users?.find((u) => u.id === auth.user.id)?.pivot?.role !==
        'viewer';

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
        <div className="h-full w-80 shrink-0">
            <Card className="flex max-h-full flex-col border-none bg-secondary/30 shadow-none">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center justify-between gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                        <span className="flex-1 truncate">{column.title}</span>

                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                            {tasks.length}
                        </span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                    <SortableContext
                        items={tasks.map((task) => getTaskDndId(task.id))}
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
        </div>
    );
}
