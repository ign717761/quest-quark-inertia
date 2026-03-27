import { BoardData, User } from '@/types';

import BoardDeleteDialog from './dialogs/board-delete-dialog';
import BoardRenameDialog from './dialogs/board-rename-dialog';
import BoardUsersDialog from './dialogs/board-users-dialog';
import ColumnCreateDialog from './dialogs/column-create-dialog';
import TaskCreateDialog from './dialogs/task-create-dialog';

type ModalState = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

type BoardDialogsProps = {
    board: BoardData;
    users: User[];
    currentColumnId: number | null;
    rename: ModalState;
    deleteModal: ModalState;
    usersModal: ModalState;
    column: ModalState;
    task: ModalState;
};

export function BoardDialogs({
    board,
    users,
    currentColumnId,
    rename,
    deleteModal,
    usersModal,
    column,
    task,
}: BoardDialogsProps) {
    return (
        <>
            <TaskCreateDialog
                columnId={currentColumnId}
                open={task.open}
                onOpenChange={task.setOpen}
            />

            <ColumnCreateDialog
                boardId={board.id}
                open={column.open}
                onOpenChange={column.setOpen}
            />

            <BoardUsersDialog
                boardId={board.id}
                users={users}
                open={usersModal.open}
                onOpenChange={usersModal.setOpen}
            />

            <BoardRenameDialog
                board={board}
                open={rename.open}
                onOpenChange={rename.setOpen}
            />

            <BoardDeleteDialog
                board={board}
                open={deleteModal.open}
                onOpenChange={deleteModal.setOpen}
            />
        </>
    );
}
