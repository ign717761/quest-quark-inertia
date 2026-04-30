import TaskCreateDialog from '@/pages/boards/show/components/dialogs/task-create-dialog';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { useBoardStore } from '@/stores/use-board-store';
import { BoardData } from '@/types';

import { BoardHeader } from './components/BoardHeader';
import { KanbanBoard } from './components/KanbanBoard';

type ShowProps = {
    board: BoardData;
};

export default function Show({ board: initialBoard }: ShowProps) {
    const { board, setBoard } = useBoardStore();
    const [isTaskOpen, setIsTaskOpen] = useState(false);
    const [currentColumnId, setCurrentColumnId] = useState<number | null>(null);

    useEffect(() => {
        setBoard(initialBoard);
    }, [initialBoard, setBoard]);

    if (!board) {
        return null;
    }

    const openTaskDialog = (columnId: number) => {
        setCurrentColumnId(columnId);
        setIsTaskOpen(true);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Главная', href: '/dashboard' },
                { title: board.title, href: '#' },
            ]}
        >
            <Head title={board.title} />

            <div className="flex h-full flex-col overflow-hidden p-6">
                <BoardHeader board={board} />

                <KanbanBoard
                    initialBoard={initialBoard}
                    onAddTask={openTaskDialog}
                />
            </div>

            <TaskCreateDialog
                columnId={currentColumnId}
                open={isTaskOpen}
                onOpenChange={setIsTaskOpen}
            />
        </AppLayout>
    );
}
