import { useState } from 'react';

type ModalControl = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

export function useBoardModals() {
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isColumnOpen, setIsColumnOpen] = useState(false);
    const [isTaskOpen, setIsTaskOpen] = useState(false);
    const [currentColumnId, setCurrentColumnId] = useState<number | null>(null);

    const createModalControl = (
        open: boolean,
        setOpen: (open: boolean) => void,
    ): ModalControl => ({ open, setOpen });

    const openTaskDialog = (columnId: number) => {
        setCurrentColumnId(columnId);
        setIsTaskOpen(true);
    };

    return {
        rename: createModalControl(isRenameOpen, setIsRenameOpen),
        delete: createModalControl(isDeleteOpen, setIsDeleteOpen),
        users: createModalControl(isUsersOpen, setIsUsersOpen),
        column: createModalControl(isColumnOpen, setIsColumnOpen),
        task: createModalControl(isTaskOpen, setIsTaskOpen),
        currentColumnId,
        openTaskDialog,
    };
}
