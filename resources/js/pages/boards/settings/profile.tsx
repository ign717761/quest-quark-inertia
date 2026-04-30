import { Head } from '@inertiajs/react';

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
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Главная', href: '/dashboard' },
        { title: board.title, href: boardsRoute.show(board.id).url },
        { title: `Настройки доски`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Настройки доски ${board.title}`} />

            <BoardSettingsLayout board={board}>
                <BoardGeneralSettingsSection board={board} />
            </BoardSettingsLayout>
        </AppLayout>
    );
}
