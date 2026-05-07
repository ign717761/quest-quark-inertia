import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import boardsRoute from '@/routes/boards';
import { BoardSettingsData } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

type BoardDeleteSectionProps = {
    board: BoardSettingsData;
    isAdmin: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function BoardDeleteSection({
    board,
    isAdmin,
    open,
    onOpenChange,
}: BoardDeleteSectionProps) {
    const [isDeletingOptimistically, setIsDeletingOptimistically] =
        useState(false);

    const deleteBoard = () => {
        setIsDeletingOptimistically(true);
        onOpenChange(false);

        router.delete(boardsRoute.destroy(board.id).url, {
            onError: () => {
                setIsDeletingOptimistically(false);
            },
        });
    };

    return (
        <>
            <div className="space-y-6">
                <HeadingSmall
                    title="Красная зона"
                    description="Необратимые действия для всей доски."
                />
                <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                    <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                        <p className="font-medium">Внимание</p>
                        <p className="text-sm">
                            {isDeletingOptimistically
                                ? 'Удаляем доску...'
                                : 'Пожалуйста, действуйте осторожно, это непоправимо.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-red-600 dark:text-red-100">
                            Будут удалены доска, ее колонки, задачи и участники.
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!isAdmin || isDeletingOptimistically}
                            onClick={() => onOpenChange(true)}
                        >
                            Удалить доску
                        </Button>
                    </div>

                    {!isAdmin && (
                        <p className="text-sm text-muted-foreground">
                            Удалять доску может только администратор.
                        </p>
                    )}
                </div>
            </div>

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить доску?</DialogTitle>
                        <DialogDescription>
                            Доска «{board.title}» и все связанные данные будут
                            удалены безвозвратно.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={deleteBoard}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
