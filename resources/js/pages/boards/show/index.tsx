import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import { useBoardStore } from '@/stores/use-board-store';
import { BoardData, SharedData } from '@/types';

import { BoardDialogs } from './components/BoardDialogs';
import { BoardHeader } from './components/BoardHeader';
import { KanbanBoard } from './components/KanbanBoard';
import { useBoardEvents } from './hooks/useBoardEvents';
import { useBoardModals } from './hooks/useBoardModals';

type ShowProps = {
    board: BoardData;
};

export default function Show({ board: initialBoard }: ShowProps) {
    const { auth } = usePage<SharedData>().props;
    const { board, setBoard } = useBoardStore();

    const modals = useBoardModals();
    useBoardEvents(initialBoard.id);

    useEffect(() => {
        setBoard(initialBoard);
    }, [initialBoard, setBoard]);

    if (!board) {
        return null;
    }

    const currentUser = board.users?.find((user) => user.id === auth.user.id);
    const isAdmin = currentUser?.pivot?.role === 'admin';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: board.title, href: '#' },
            ]}
        >
            <Head title={board.title} />

            <div className="flex h-full flex-col overflow-hidden p-6">
                <BoardHeader
                    board={board}
                    isAdmin={isAdmin}
                    onRename={() => modals.rename.setOpen(true)}
                    onDelete={() => modals.delete.setOpen(true)}
                    onUsers={() => modals.users.setOpen(true)}
                />

                <KanbanBoard
                    initialBoard={initialBoard}
                    onAddColumn={() => modals.column.setOpen(true)}
                    onAddTask={modals.openTaskDialog}
                />
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
