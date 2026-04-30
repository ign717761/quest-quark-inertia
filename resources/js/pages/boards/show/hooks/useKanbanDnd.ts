import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { router } from '@inertiajs/react';
import { useState } from 'react';

import tasksRoute from '@/routes/tasks';
import { useBoardStore } from '@/stores/use-board-store';
import { BoardData, Task } from '@/types';

import {
    getTaskDndId,
    isTaskSlotDndId,
    parseDndId,
    parseTaskSlotDndId,
} from '../utils/dndUtils';

type TaskDropPreview = {
    columnId: number;
    index: number;
};

export function useKanbanDnd(initialBoard: BoardData) {
    const { columns, setBoard, updateColumns } = useBoardStore();

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeTaskOriginColumnId, setActiveTaskOriginColumnId] = useState<
        number | null
    >(null);
    const [taskDropPreview, setTaskDropPreview] =
        useState<TaskDropPreview | null>(null);

    const findColumnByTaskId = (taskId: number) =>
        columns.find((column) => column.tasks.some((task) => task.id === taskId));

    const findColumnByDropTarget = (targetId: string) =>
        (isTaskSlotDndId(targetId)
            ? columns.find(
                  (column) => column.id === parseTaskSlotDndId(targetId).columnId,
              )
            : null) ||
        columns.find((column) =>
            column.tasks.some((task) => getTaskDndId(task.id) === targetId),
        );

    const getPreviewIndex = ({
        taskId,
        destinationColumnId,
        targetId,
        active,
        over,
        deltaY,
    }: {
        taskId: number;
        destinationColumnId: number;
        targetId: string;
        active?: DragOverEvent['active'];
        over?: DragOverEvent['over'];
        deltaY?: number;
    }) => {
        const destinationColumn = columns.find(
            (column) => column.id === destinationColumnId,
        );
        if (!destinationColumn) {
            return 0;
        }

        const visibleTasks = destinationColumn.tasks.filter(
            (task) => task.id !== taskId,
        );

        if (isTaskSlotDndId(targetId)) {
            return parseTaskSlotDndId(targetId).index;
        }

        const overSortable = over?.data.current?.sortable as
            | { index?: number }
            | undefined;
        const sortableIndex = overSortable?.index;
        const overIndex =
            typeof sortableIndex === 'number'
                ? sortableIndex
                : visibleTasks.findIndex(
                      (task) => getTaskDndId(task.id) === targetId,
                  );

        if (overIndex === -1) {
            return visibleTasks.length;
        }

        const translatedTop =
            active?.rect.current.translated?.top ??
            (active?.rect.current.initial?.top !== undefined &&
            deltaY !== undefined
                ? active.rect.current.initial.top + deltaY
                : undefined);
        const overMiddleY = over
            ? over.rect.top + over.rect.height / 2
            : undefined;
        const activeCenterY =
            translatedTop !== undefined
                ? translatedTop +
                  ((active?.rect.current.translated?.height ??
                      active?.rect.current.initial?.height ??
                      0) /
                      2)
                : undefined;
        const shouldInsertAfter =
            activeCenterY !== undefined &&
            overMiddleY !== undefined &&
            activeCenterY > overMiddleY;

        return overIndex + (shouldInsertAfter ? 1 : 0);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { type, originalId } = parseDndId(event.active.id as string);

        if (type !== 'task') {
            return;
        }

        const task = columns
            .flatMap((column) => column.tasks)
            .find((item) => item.id === originalId);
        const sourceColumn = findColumnByTaskId(originalId);

        setActiveTask(task || null);
        setActiveTaskOriginColumnId(sourceColumn?.id ?? null);

        if (sourceColumn && task) {
            setTaskDropPreview({
                columnId: sourceColumn.id,
                index: sourceColumn.tasks.findIndex((item) => item.id === task.id),
            });
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || !activeTask) {
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) {
            return;
        }

        const { type: activeType } = parseDndId(activeId);
        if (activeType !== 'task') {
            return;
        }

        const activeColumn = findColumnByTaskId(activeTask.id);
        const overColumn = findColumnByDropTarget(overId);

        if (!activeColumn || !overColumn) {
            return;
        }

        setTaskDropPreview({
            columnId: overColumn.id,
            index: getPreviewIndex({
                taskId: activeTask.id,
                destinationColumnId: overColumn.id,
                targetId: overId,
                active,
                over,
                deltaY: event.delta.y,
            }),
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            cleanup();
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;
        const { type, originalId } = parseDndId(activeId);

        if (type === 'task') {
            handleTaskDragEnd(originalId, overId);
        }

        cleanup();
    };

    const handleTaskDragEnd = (taskId: number, overId: string) => {
        if (!activeTask || activeTaskOriginColumnId === null) {
            return;
        }

        const sourceColumn = columns.find(
            (column) => column.id === activeTaskOriginColumnId,
        );
        const destinationColumn =
            columns.find((column) => column.id === taskDropPreview?.columnId) ??
            findColumnByDropTarget(overId);

        if (!sourceColumn || !destinationColumn) {
            return;
        }

        const destinationTasks = destinationColumn.tasks.filter(
            (task) => task.id !== taskId,
        );
        const previewIndex =
            taskDropPreview?.columnId === destinationColumn.id
                ? taskDropPreview.index
                : getPreviewIndex({
                      taskId,
                      destinationColumnId: destinationColumn.id,
                      targetId: overId,
                  });
        const insertIndex = Math.max(
            0,
            Math.min(previewIndex, destinationTasks.length),
        );
        const movedTask = { ...activeTask, column_id: destinationColumn.id };

        if (sourceColumn.id === destinationColumn.id) {
            const reorderedTasks = arrayMove(
                sourceColumn.tasks,
                sourceColumn.tasks.findIndex((task) => task.id === taskId),
                insertIndex,
            );

            updateColumns(
                columns.map((column) =>
                    column.id === sourceColumn.id
                        ? { ...column, tasks: reorderedTasks }
                        : column,
                ),
            );

            router.patch(
                tasksRoute.move(taskId).url,
                {
                    column_id: destinationColumn.id,
                    task_ids: reorderedTasks.map((task) => task.id),
                },
                {
                    preserveScroll: true,
                    onSuccess: (page) => setBoard(page.props.board as BoardData),
                    onError: () => setBoard(initialBoard),
                },
            );

            return;
        }

        const sourceTasks = sourceColumn.tasks.filter((task) => task.id !== taskId);
        const reorderedDestinationTasks = [...destinationTasks];
        reorderedDestinationTasks.splice(insertIndex, 0, movedTask);

        updateColumns(
            columns.map((column) => {
                if (column.id === sourceColumn.id) {
                    return { ...column, tasks: sourceTasks };
                }

                if (column.id === destinationColumn.id) {
                    return {
                        ...column,
                        tasks: reorderedDestinationTasks,
                    };
                }

                return column;
            }),
        );

        router.patch(
            tasksRoute.move(taskId).url,
            {
                column_id: destinationColumn.id,
                task_ids: reorderedDestinationTasks.map((task) => task.id),
            },
            {
                preserveScroll: true,
                onSuccess: (page) => setBoard(page.props.board as BoardData),
                onError: () => setBoard(initialBoard),
            },
        );
    };

    const cleanup = () => {
        setActiveTask(null);
        setActiveTaskOriginColumnId(null);
        setTaskDropPreview(null);
    };

    return {
        activeTask,
        taskDropPreview,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
    };
}
