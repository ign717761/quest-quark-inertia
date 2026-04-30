import { BoardData, ColumnWithTasks, Task, TaskComment, User } from '@/types';
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

const syncBoardWithColumns = (
    board: BoardData | null,
    columns: ColumnWithTasks[],
): BoardData | null =>
    board
        ? {
              ...board,
              columns,
          }
        : null;

interface BoardState {
    board: BoardData | null;
    columns: ColumnWithTasks[];
    setBoard: (board: BoardData) => void;
    updateColumns: (columns: ColumnWithTasks[]) => void;
    updateBoardTitle: (title: string) => void;
    updateColumnTitle: (columnId: number, title: string) => void;
    updateColumn: (
        columnId: number,
        patch: Partial<Pick<ColumnWithTasks, 'title' | 'type' | 'position'>>,
    ) => void;
    addColumn: (column: ColumnWithTasks) => void;
    removeColumn: (columnId: number) => void;
    updateColumnOrder: (columnIds: number[]) => void;
    addBoardUser: (user: User) => void;
    updateBoardUserRole: (userId: number, role: 'admin' | 'editor' | 'viewer') => void;
    removeBoardUser: (userId: number) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: number, patch: Partial<Task>) => void;
    removeTask: (taskId: number) => void;
    addComment: (taskId: number, comment: TaskComment) => void;
    updateComment: (commentId: number, body: string) => void;
    removeComment: (commentId: number) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    board: null,
    columns: [],
    setBoard: (board) => {
        const normalizedColumns = normalizeColumns(board.columns);

        set({
            board: {
                ...board,
                columns: normalizedColumns,
            },
            columns: normalizedColumns,
        });
    },
    updateColumns: (columns) => {
        const normalizedColumns = normalizeColumns(columns);

        set((state) => ({
            columns: normalizedColumns,
            board: syncBoardWithColumns(state.board, normalizedColumns),
        }));
    },
    updateBoardTitle: (title) =>
        set((state) => ({
            board: state.board
                ? {
                      ...state.board,
                      title,
                  }
                : null,
        })),
    updateColumnTitle: (columnId, title) =>
        set((state) => {
            const columns = state.columns.map((column) =>
                column.id === columnId ? { ...column, title } : column,
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    updateColumn: (columnId, patch) =>
        set((state) => {
            const columns = normalizeColumns(
                state.columns.map((column) =>
                    column.id === columnId ? { ...column, ...patch } : column,
                ),
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    addColumn: (column) =>
        set((state) => {
            const columns = normalizeColumns([...state.columns, normalizeColumn(column)]);

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    removeColumn: (columnId) =>
        set((state) => {
            const columns = normalizeColumns(
                state.columns
                    .filter((column) => column.id !== columnId)
                    .map((column, index) => ({
                        ...column,
                        position: index,
                    })),
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    updateColumnOrder: (columnIds) =>
        set((state) => {
            const columns = columnIds
                .map((id) => state.columns.find((column) => column.id === id))
                .filter(Boolean)
                .map((column, index) => ({
                    ...(column as ColumnWithTasks),
                    position: index,
                }));

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    addBoardUser: (user) =>
        set((state) => ({
            board: state.board
                ? {
                      ...state.board,
                      users: [...(state.board.users ?? []), user],
                  }
                : null,
        })),
    updateBoardUserRole: (userId, role) =>
        set((state) => ({
            board: state.board
                ? {
                      ...state.board,
                      users: (state.board.users ?? []).map((user) =>
                          user.id === userId
                              ? {
                                    ...user,
                                    pivot: user.pivot
                                        ? { ...user.pivot, role }
                                        : user.pivot,
                                }
                              : user,
                      ),
                  }
                : null,
        })),
    removeBoardUser: (userId) =>
        set((state) => ({
            board: state.board
                ? {
                      ...state.board,
                      users: (state.board.users ?? []).filter(
                          (user) => user.id !== userId,
                      ),
                  }
                : null,
        })),
    addTask: (task) =>
        set((state) => {
            const columns = state.columns.map((column) => {
                if (column.id !== task.column_id) {
                    return column;
                }

                return normalizeColumn({
                    ...column,
                    tasks: [
                        { ...task, position: 0 },
                        ...column.tasks.map((currentTask) => ({
                            ...currentTask,
                            position: currentTask.position + 1,
                        })),
                    ],
                });
            });

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    updateTask: (taskId, patch) =>
        set((state) => {
            const columns = state.columns.map((column) =>
                normalizeColumn({
                    ...column,
                    tasks: column.tasks.map((task) =>
                        task.id === taskId ? { ...task, ...patch } : task,
                    ),
                }),
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    removeTask: (taskId) =>
        set((state) => {
            const columns = state.columns.map((column) =>
                normalizeColumn({
                    ...column,
                    tasks: column.tasks
                        .filter((task) => task.id !== taskId)
                        .map((task, index) => ({
                            ...task,
                            position: index,
                        })),
                }),
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    addComment: (taskId, comment) =>
        set((state) => {
            const columns = state.columns.map((column) =>
                normalizeColumn({
                    ...column,
                    tasks: column.tasks.map((task) =>
                        task.id === taskId
                            ? {
                                  ...task,
                                  comments: [comment, ...(task.comments ?? [])],
                              }
                            : task,
                    ),
                }),
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    updateComment: (commentId, body) =>
        set((state) => {
            const columns = state.columns.map((column) =>
                normalizeColumn({
                    ...column,
                    tasks: column.tasks.map((task) => ({
                        ...task,
                        comments: (task.comments ?? []).map((comment) =>
                            comment.id === commentId
                                ? {
                                      ...comment,
                                      body,
                                  }
                                : comment,
                        ),
                    })),
                }),
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
    removeComment: (commentId) =>
        set((state) => {
            const columns = state.columns.map((column) =>
                normalizeColumn({
                    ...column,
                    tasks: column.tasks.map((task) => ({
                        ...task,
                        comments: (task.comments ?? []).filter(
                            (comment) => comment.id !== commentId,
                        ),
                    })),
                }),
            );

            return {
                columns,
                board: syncBoardWithColumns(state.board, columns),
            };
        }),
}));
