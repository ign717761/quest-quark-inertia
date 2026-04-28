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

interface BoardState {
    board: BoardData | null;
    columns: ColumnWithTasks[];
    setBoard: (board: BoardData) => void;
    updateColumns: (columns: ColumnWithTasks[]) => void;
    updateColumnTitle: (columnId: number, title: string) => void;
    updateColumnOrder: (columnIds: number[]) => void;
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
}));
