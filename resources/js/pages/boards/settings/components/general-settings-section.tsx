import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import boardsRoute from '@/routes/boards';
import { BoardSettingsData, SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import BoardDeleteSection from './board-delete-section';

type BoardGeneralSettingsSectionProps = {
    board: BoardSettingsData;
    optimisticTitle: string;
    onOptimisticTitleChange: (title: string) => void;
};

export function BoardGeneralSettingsSection({
    board,
    optimisticTitle,
    onOptimisticTitleChange,
}: BoardGeneralSettingsSectionProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUser = board.users.find((user) => user.id === auth.user.id);
    const currentRole = currentUser?.pivot?.role;
    const canEditBoard = currentRole === 'admin' || currentRole === 'editor';
    const isAdmin = currentRole === 'admin';

    const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

    const generalForm = useForm({
        title: optimisticTitle,
    });

    useEffect(() => {
        generalForm.setData('title', optimisticTitle);
    }, [optimisticTitle]);

    const submitGeneral = (event: FormEvent) => {
        event.preventDefault();
        const previousTitle = board.title;

        generalForm.patch(boardsRoute.update(board.id).url, {
            preserveScroll: true,
            onError: () => {
                onOptimisticTitleChange(previousTitle);
                generalForm.setData('title', previousTitle);
            },
        });
    };

    return (
        <>
            <div className="space-y-6">
                <HeadingSmall
                    title="Основная информация"
                    description="Измените название доски. Основной рабочий экран останется сфокусированным только на задачах."
                />

                {!canEditBoard && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Только просмотр</AlertTitle>
                        <AlertDescription>
                            У вас нет прав на изменение основной информации этой
                            доски.
                        </AlertDescription>
                    </Alert>
                )}

                <form className="space-y-6" onSubmit={submitGeneral}>
                    <div className="grid gap-2">
                        <Label htmlFor="board-title">Название доски</Label>
                        <Input
                            id="board-title"
                            value={generalForm.data.title}
                            disabled={!canEditBoard || generalForm.processing}
                            onChange={(event) => {
                                generalForm.setData('title', event.target.value);
                                onOptimisticTitleChange(event.target.value);
                            }}
                        />
                        <InputError message={generalForm.errors.title} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={!canEditBoard || generalForm.processing}
                        >
                            Сохранить
                        </Button>
                    </div>
                </form>
            </div>

            <BoardDeleteSection
                board={board}
                isAdmin={isAdmin}
                open={isDeleteBoardOpen}
                onOpenChange={setIsDeleteBoardOpen}
            />
        </>
    );
}
