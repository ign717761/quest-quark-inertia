import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import boardsRoute from '@/routes/boards';
import { BoardSettingsData, NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type BoardSettingsLayoutProps = PropsWithChildren<{
    board: BoardSettingsData;
}>;

const getSidebarNavItems = (board: BoardSettingsData): NavItem[] => [
    {
        title: 'Основное',
        href: boardsRoute.settings(board.id),
        icon: null,
    },
    {
        title: 'Колонки',
        href: boardsRoute.settings.columns(board.id),
        icon: null,
    },
    {
        title: 'Участники',
        href: boardsRoute.settings.members(board.id),
        icon: null,
    },
];

export default function BoardSettingsLayout({
    board,
    children,
}: BoardSettingsLayoutProps) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const sidebarNavItems = getSidebarNavItems(board);

    return (
        <div className="px-4 py-6">
            <Heading
                title="Настройки"
                description={`Управляйте параметрами доски «${board.title}»`}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isSameUrl(
                                        currentPath,
                                        item.href,
                                    ),
                                })}
                            >
                                <Link href={item.href}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
