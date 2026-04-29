import {
    type CollisionDetection,
    DndContext,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    closestCenter,
    closestCorners,
    defaultDropAnimationSideEffects,
    getFirstCollision,
    pointerWithin,
    rectIntersection,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { BoardData } from '@/types';

import { useBoardStore } from '@/stores/use-board-store';

import { useKanbanDnd } from '../hooks/useKanbanDnd';
import {
    getColumnDndId,
    getTaskDndId,
    getTaskSlotDndId,
} from '../utils/dndUtils';
import KanbanColumn from './kanban/kanban-column';
import KanbanTask from './kanban/kanban-task';

type KanbanBoardProps = {
    initialBoard: BoardData;
    onAddTask: (columnId: number) => void;
};

export function KanbanBoard({
    initialBoard,
    onAddTask,
}: KanbanBoardProps) {
    const { columns } = useBoardStore();
    const {
        activeTask,
        taskDropPreview,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
    } = useKanbanDnd(initialBoard);
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 240, tolerance: 8 },
        }),
    );

    const collisionDetection: CollisionDetection = (args) => {
        const activeId = String(args.active.id);

        if (!activeId.startsWith('task-')) {
            return closestCorners(args);
        }

        const pointerIntersections = pointerWithin(args);
        const intersections =
            pointerIntersections.length > 0
                ? pointerIntersections
                : rectIntersection(args);
        const overId = getFirstCollision(intersections, 'id');

        if (!overId) {
            return closestCenter(args);
        }

        const overIdString = String(overId);
        const targetColumn = columns.find(
            (column) =>
                getColumnDndId(column.id) === overIdString ||
                column.tasks.some((task) => getTaskDndId(task.id) === overIdString) ||
                Array.from({ length: column.tasks.length + 1 }, (_, index) =>
                    getTaskSlotDndId(column.id, index),
                ).includes(overIdString),
        );

        if (!targetColumn) {
            return closestCenter(args);
        }

        const taskDroppables = args.droppableContainers.filter((container) =>
            targetColumn.tasks.some(
                (task) => getTaskDndId(task.id) === String(container.id),
            ) ||
            Array.from({ length: targetColumn.tasks.length + 1 }, (_, index) =>
                getTaskSlotDndId(targetColumn.id, index),
            ).includes(String(container.id)),
        );

        if (taskDroppables.length === 0) {
            return intersections;
        }

        return closestCenter({
            ...args,
            droppableContainers: taskDroppables,
        });
    };

    return (
        <div className="flex-1 overflow-x-auto bg-[radial-gradient(circle_at_20%_0%,rgba(77,101,217,0.08),transparent_28%),linear-gradient(180deg,#0a0c10_0%,#07090d_100%)] p-5 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex min-h-full items-start gap-5">
                    <SortableContext
                        items={columns.map((c) => getColumnDndId(c.id))}
                        strategy={horizontalListSortingStrategy}
                    >
                        {columns.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={column.tasks.filter(
                                    (t) => t.id !== activeTask?.id,
                                )}
                                isTaskDragging={Boolean(activeTask)}
                                dropPreviewIndex={
                                    taskDropPreview?.columnId === column.id
                                        ? taskDropPreview.index
                                        : null
                                }
                                getTaskDndId={getTaskDndId}
                                getTaskSlotDndId={getTaskSlotDndId}
                                onAddTask={() => onAddTask(column.id)}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay
                    dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: { active: { opacity: '0.5' } },
                        }),
                    }}
                >
                    {activeTask && <KanbanTask task={activeTask} />}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
