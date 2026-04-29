import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { useBoardStore } from '@/stores/use-board-store';
import { BoardData } from '@/types';

import { BoardDialogs } from './components/BoardDialogs';
import { BoardHeader } from './components/BoardHeader';
import { BoardSettings } from './components/BoardSettings';
import { KanbanBoard } from './components/KanbanBoard';
import { useBoardModals } from './hooks/useBoardModals';

type ShowProps = {
    board: BoardData;
};

export default function Show({ board: initialBoard }: ShowProps) {
    const { board, setBoard } = useBoardStore();
    const [activeView, setActiveView] = useState<'board' | 'settings'>('board');

    const modals = useBoardModals();

    useEffect(() => {
        setBoard(initialBoard);
    }, [initialBoard, setBoard]);

    if (!board) {
        return null;
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Главная', href: '/dashboard' },
                { title: board.title, href: '#' },
            ]}
        >
            <Head title={board.title} />

            <div className="flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#090b0f] text-zinc-100">
                <BoardHeader
                    board={board}
                    onUsers={() => modals.users.setOpen(true)}
                    onCreateTask={() => {
                        const firstColumn = board.columns[0];

                        if (firstColumn) {
                            modals.openTaskDialog(firstColumn.id);
                        } else {
                            modals.column.setOpen(true);
                        }
                    }}
                    activeView={activeView}
                    onViewChange={setActiveView}
                />

                {activeView === 'board' ? (
                    <KanbanBoard
                        initialBoard={initialBoard}
                        onAddTask={modals.openTaskDialog}
                    />
                ) : (
                    <BoardSettings
                        board={board}
                        users={board.users || []}
                        onBack={() => setActiveView('board')}
                        onAddColumn={() => modals.column.setOpen(true)}
                        onDelete={() => modals.delete.setOpen(true)}
                        onUsers={() => modals.users.setOpen(true)}
                    />
                )}
            </div>

            <BoardDialogs
                board={board}
                users={board.users || []}
                currentColumnId={modals.currentColumnId}
                rename={modals.rename}
                deleteModal={modals.delete}
                usersModal={modals.users}
                column={modals.column}
                task={modals.task}
            />
        </AppLayout>
    );
}
