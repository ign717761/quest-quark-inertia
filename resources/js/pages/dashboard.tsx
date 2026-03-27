import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { boardIcons, getBoardIcon } from '@/lib/board-icons';
import boardsRoute from '@/routes/boards';
import {
    DashboardBoard,
    DashboardStats,
    type BreadcrumbItem,
} from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ClipboardList, Plus, TrendingUp, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import {
    CreateBoardDialog,
    type CreateBoardFormData,
} from './dashboard/components/create-board-dialog';
import {
    InviteUserDialog,
    type InviteUserFormData,
} from './dashboard/components/invite-user-dialog';

interface DashboardProps {
    boards: DashboardBoard[];
    stats: DashboardStats;
}

export default function Dashboard({ boards = [], stats }: DashboardProps) {
    const [open, setOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState<number | null>(null);

    const createBoardForm = useForm<CreateBoardFormData>({
        title: '',
        icon: boardIcons[0]?.value ?? 'layout-grid',
    });
    const inviteForm = useForm<InviteUserFormData>({ email: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        createBoardForm.post(boardsRoute.store().url, {
            onSuccess: () => {
                setOpen(false);
                createBoardForm.reset();
            },
        });
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBoard) return;

        inviteForm.post(boardsRoute.invite(selectedBoard).url, {
            onSuccess: () => {
                setInviteOpen(false);
                setSelectedBoard(null);
                inviteForm.reset();
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Доски
                                    </p>
                                    <p className="mt-2 text-2xl font-bold">
                                        {stats.total_boards}
                                    </p>
                                </div>
                                <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Всего задач
                                    </p>
                                    <p className="mt-2 text-2xl font-bold">
                                        {stats.total_tasks}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Участники
                                    </p>
                                    <p className="mt-2 text-2xl font-bold">
                                        {stats.total_members}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Список досок */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Мои доски</h1>
                    <Button size="sm" onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Создать доску
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {boards.map((board) => {
                        const BoardIcon = getBoardIcon(board.icon);
                        const totalTasks = board.columns.reduce(
                            (sum, col) => sum + col.tasks.length,
                            0,
                        );

                        return (
                            <div
                                key={board.id}
                                className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
                            >
                                <Link
                                    href={boardsRoute.show(board.id).url}
                                    className="absolute inset-0 z-10"
                                />

                                <div className="relative aspect-video p-6">
                                    <div className="mb-8 flex items-start justify-between">
                                        <div className="relative z-20 flex items-center gap-2 text-lg font-bold text-card-foreground">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70">
                                                <BoardIcon className="h-4 w-4" />
                                            </span>
                                            <span>{board.title}</span>
                                        </div>
                                        {board.pivot?.role === 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="z-20 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedBoard(board.id);
                                                    setInviteOpen(true);
                                                }}
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="absolute right-4 bottom-4 left-4 z-20 space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Задачи
                                            </span>
                                            <span className="font-medium">
                                                {totalTasks}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px]"
                                            >
                                                {board.pivot?.role ||
                                                    'участник'}
                                            </Badge>
                                            <span className="text-muted-foreground">
                                                {board.users.length}{' '}
                                                {board.users.length === 1
                                                    ? 'участник'
                                                    : 'участников'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <button
                        onClick={() => setOpen(true)}
                        className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 transition-all hover:border-muted-foreground/50 hover:bg-accent/50"
                    >
                        <Plus className="mb-3 h-10 w-10 text-muted-foreground" />
                        <span className="text font-medium text-muted-foreground">
                            Новая доска
                        </span>
                    </button>
                </div>
            </div>

            <CreateBoardDialog
                open={open}
                onOpenChange={setOpen}
                form={createBoardForm}
                onSubmit={submit}
            />

            <InviteUserDialog
                open={inviteOpen}
                onOpenChange={(val) => {
                    setInviteOpen(val);
                    if (!val) {
                        setSelectedBoard(null);
                    }
                }}
                form={inviteForm}
                onSubmit={handleInvite}
            />
        </AppLayout>
    );
}
