import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import boardsRoute from '@/routes/boards';
import { BoardSettingsData, BreadcrumbItem } from '@/types';

import { BoardGeneralSettingsSection } from './components';
import BoardSettingsLayout from './layout';

type BoardSettingsPageProps = {
    board: BoardSettingsData;
};

export default function BoardProfileSettings({
    board,
}: BoardSettingsPageProps) {
    const [optimisticTitle, setOptimisticTitle] = useState(board.title);

    useEffect(() => {
        setOptimisticTitle(board.title);
    }, [board.title]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Главная', href: '/dashboard' },
        { title: optimisticTitle, href: boardsRoute.show(board.id).url },
        { title: `Настройки доски`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Настройки доски ${optimisticTitle}`} />

            <BoardSettingsLayout board={board} title={optimisticTitle}>
                <BoardGeneralSettingsSection
                    board={board}
                    optimisticTitle={optimisticTitle}
                    onOptimisticTitleChange={setOptimisticTitle}
                />
            </BoardSettingsLayout>
        </AppLayout>
    );
}
