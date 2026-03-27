import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BoardData } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface BoardRenameDialogProps {
    board: BoardData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function BoardRenameDialog({
    board,
    open,
    onOpenChange,
}: BoardRenameDialogProps) {
    const [title, setTitle] = useState(board.title);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setTitle(board.title);
        }
    }, [board.title, open]);

    const handleSubmit = () => {
        if (title.trim() === '' || title === board.title) {
            onOpenChange(false);
            return;
        }

        setLoading(true);
        router.patch(
            `/boards/${board.id}`,
            { title: title.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    router.flushAll();
                    router.reload({ only: ['auth', 'board'] });
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Переименовать доску</DialogTitle>
                </DialogHeader>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
