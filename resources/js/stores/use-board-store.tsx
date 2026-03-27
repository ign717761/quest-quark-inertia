import { BoardData, ColumnWithTasks, Task } from '@/types';
import { create } from 'zustand';

const sortTasksByPosition = (tasks: Task[]) =>
    [...tasks].sort((a, b) => a.position - b.position);

const normalizeTasks = (tasks: Task[]) => sortTasksByPosition(tasks);

const sortColumnsByPosition = (columns: ColumnWithTasks[]) =>
    [...columns].sort((a, b) => a.position - b.position);

const normalizeColumn = (column: ColumnWithTasks): ColumnWithTasks => ({
    ...column,
    tasks: normalizeTasks(column.tasks ?? []),
});

const normalizeColumns = (columns: ColumnWithTasks[]) =>
    sortColumnsByPosition(columns).map(normalizeColumn);

const orderTasksByIds = (tasks: Task[], orderedIds?: number[]) => {
    if (!orderedIds || orderedIds.length === 0) {
        return normalizeTasks(tasks);
    }

    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const orderedTasks = orderedIds
        .map((id) => taskMap.get(id))
        .filter(Boolean) as Task[];
    const orderedSet = new Set(orderedIds);
    const remainingTasks = tasks.filter((task) => !orderedSet.has(task.id));

    return [...orderedTasks, ...remainingTasks].map((task, index) => ({
        ...task,
        position: index,
    }));
};

const normalizeColumnPositions = (columns: ColumnWithTasks[]) =>
    columns.map((column, index) => ({
        ...column,
        position: index,
    }));

interface BoardState {
    board: BoardData | null;
    columns: ColumnWithTasks[];
    setBoard: (board: BoardData) => void;
    updateColumns: (columns: ColumnWithTasks[]) => void;
    updateColumnTitle: (columnId: number, title: string) => void;
    updateColumnOrder: (columnIds: number[]) => void;
    addColumn: (column: ColumnWithTasks) => void;
    updateColumn: (column: ColumnWithTasks) => void;
    removeColumn: (
        columnId: number,
        columnIds?: number[],
        destinationColumn?: ColumnWithTasks,
    ) => void;
    addTask: (task: Task) => void;
    applyTaskOrder: (columnId: number, taskIds: number[]) => void;
    updateTask: (task: Task) => void;
    removeTask: (taskId: number, columnId: number, taskIds?: number[]) => void;
    moveTask: (payload: {
        task: Task;
        fromColumnId: number;
        toColumnId: number;
        fromTaskIds?: number[];
        toTaskIds?: number[];
    }) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    board: null,
    columns: [],
    setBoard: (board) =>
        set({
            board,
            columns: normalizeColumns(board.columns),
        }),
    updateColumns: (columns) => set({ columns }),
    updateColumnTitle: (columnId: number, title: string) =>
        set((state) => ({
            columns: state.columns.map((col) =>
                col.id === columnId ? { ...col, title } : col,
            ),
        })),
    updateColumnOrder: (columnIds: number[]) =>
        set((state) => ({
            columns: columnIds
                .map((id) => state.columns.find((c) => c.id === id))
                .filter(Boolean)
                .map((col, index) => ({
                    ...(col as ColumnWithTasks),
                    position: index,
                })),
        })),
    addColumn: (column) =>
        set((state) => {
            const exists = state.columns.some((col) => col.id === column.id);
            if (exists) {
                return {};
            }

            const nextColumn: ColumnWithTasks = {
                ...column,
                tasks: normalizeTasks(column.tasks ?? []),
            };

            return {
                columns: normalizeColumns([...state.columns, nextColumn]),
            };
        }),
    updateColumn: (column) =>
        set((state) => ({
            columns: normalizeColumns(
                [...state.columns]
                .map((col) =>
                    col.id === column.id
                        ? {
                              ...col,
                              ...column,
                              tasks: column.tasks
                                  ? normalizeTasks(column.tasks)
                                  : col.tasks,
                          }
                        : col,
                )
            ),
        })),
    removeColumn: (columnId, columnIds, destinationColumn) =>
        set((state) => {
            const nextColumns = state.columns
                .filter((col) => col.id !== columnId)
                .map((col) =>
                    destinationColumn && col.id === destinationColumn.id
                        ? {
                              ...col,
                              ...destinationColumn,
                              tasks: normalizeTasks(
                                  destinationColumn.tasks ?? col.tasks,
                              ),
                          }
                        : col,
                );

            if (
                destinationColumn &&
                !nextColumns.some((col) => col.id === destinationColumn.id)
            ) {
                nextColumns.push({
                    ...destinationColumn,
                    tasks: normalizeTasks(destinationColumn.tasks ?? []),
                });
            }

            if (columnIds && columnIds.length > 0) {
                const columnMap = new Map(
                    nextColumns.map((col) => [col.id, col]),
                );
                const orderedColumns = columnIds
                    .map((id) => columnMap.get(id))
                    .filter(Boolean) as ColumnWithTasks[];

                return {
                    columns: normalizeColumnPositions(orderedColumns),
                };
            }

            return {
                columns: normalizeColumnPositions(nextColumns),
            };
        }),
    addTask: (task) =>
        set((state) => ({
            columns: state.columns.map((col) => {
                if (col.id !== task.column_id) {
                    return col;
                }

                const exists = col.tasks.some((t) => t.id === task.id);
                if (exists) {
                    return col;
                }

                return {
                    ...col,
                    tasks: normalizeTasks([...col.tasks, task]),
                };
            }),
        })),
    applyTaskOrder: (columnId, taskIds) =>
        set((state) => ({
            columns: state.columns.map((col) =>
                col.id === columnId
                    ? {
                          ...col,
                          tasks: orderTasksByIds(col.tasks, taskIds),
                      }
                    : col,
            ),
        })),
    updateTask: (task) =>
        set((state) => ({
            columns: state.columns.map((col) => {
                const taskIndex = col.tasks.findIndex((t) => t.id === task.id);
                if (taskIndex === -1) {
                    return col;
                }

                const updatedTasks = [...col.tasks];
                updatedTasks[taskIndex] = {
                    ...updatedTasks[taskIndex],
                    ...task,
                };

                return {
                    ...col,
                    tasks: normalizeTasks(updatedTasks),
                };
            }),
        })),
    removeTask: (taskId, columnId, taskIds) =>
        set((state) => ({
            columns: state.columns.map((col) => {
                if (col.id !== columnId) {
                    return col;
                }

                const remainingTasks = col.tasks.filter(
                    (task) => task.id !== taskId,
                );

                return {
                    ...col,
                    tasks: orderTasksByIds(remainingTasks, taskIds),
                };
            }),
        })),
    moveTask: ({ task, fromColumnId, toColumnId, fromTaskIds, toTaskIds }) =>
        set((state) => {
            const movedTask = { ...task, column_id: toColumnId };

            return {
                columns: state.columns.map((col) => {
                    if (fromColumnId === toColumnId && col.id === toColumnId) {
                        const taskMap = new Map(
                            col.tasks.map((t) => [t.id, t]),
                        );
                        taskMap.set(movedTask.id, movedTask);

                        return {
                            ...col,
                            tasks: orderTasksByIds(
                                Array.from(taskMap.values()),
                                toTaskIds || fromTaskIds,
                            ),
                        };
                    }

                    if (col.id === fromColumnId) {
                        const remainingTasks = col.tasks.filter(
                            (t) => t.id !== movedTask.id,
                        );
                        return {
                            ...col,
                            tasks: orderTasksByIds(remainingTasks, fromTaskIds),
                        };
                    }

                    if (col.id === toColumnId) {
                        const taskMap = new Map(
                            col.tasks.map((t) => [t.id, t]),
                        );
                        taskMap.set(movedTask.id, movedTask);

                        return {
                            ...col,
                            tasks: orderTasksByIds(
                                Array.from(taskMap.values()),
                                toTaskIds,
                            ),
                        };
                    }

                    return col;
                }),
            };
        }),
}));
