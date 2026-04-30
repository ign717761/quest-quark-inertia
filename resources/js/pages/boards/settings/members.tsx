import { Head } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import boardsRoute from '@/routes/boards';
import { BoardSettingsData, BreadcrumbItem } from '@/types';

import { BoardMembersSettingsSection } from './components';
import BoardSettingsLayout from './layout';

type BoardSettingsPageProps = {
    board: BoardSettingsData;
};

export default function BoardMembersSettings({
    board,
}: BoardSettingsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Главная', href: '/dashboard' },
        { title: board.title, href: boardsRoute.show(board.id).url },
        { title: `Участники доски`, href: '#' },
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Участники доски ${board.title}`} />

            <BoardSettingsLayout board={board}>
                <BoardMembersSettingsSection board={board} />
            </BoardSettingsLayout>
        </AppLayout>
    );
}
