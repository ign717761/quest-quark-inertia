import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import boardsRoute from '@/routes/boards';
import boardsUsersRoute from '@/routes/boards/users';
import { BoardSettingsData, SharedData, User } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { Shield, Trash2, Users } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { roleLabels } from './constants';

type BoardMembersSettingsSectionProps = {
    board: BoardSettingsData;
};

export function BoardMembersSettingsSection({
    board,
}: BoardMembersSettingsSectionProps) {
    const { auth } = usePage<SharedData>().props;

    const [memberToRemove, setMemberToRemove] = useState<User | null>(null);
    const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);
    const [users, setUsers] = useState<User[]>(board.users);

    const inviteForm = useForm({
        email: '',
    });

    const currentUser = useMemo(
        () => users.find((user) => user.id === auth.user.id),
        [auth.user.id, users],
    );
    const currentRole = currentUser?.pivot?.role;
    const canEditBoard = currentRole === 'admin' || currentRole === 'editor';
    const isAdmin = currentRole === 'admin';

    useEffect(() => {
        setUsers(board.users);
    }, [board.users]);

    const submitInvite = (event: FormEvent) => {
        event.preventDefault();
        const previousUsers = users;
        const previousEmail = inviteForm.data.email;
        const tempUserId = -Date.now();

        setUsers((current) => [
            ...current,
            {
                id: tempUserId,
                name:
                    inviteForm.data.email.split('@')[0] || inviteForm.data.email,
                email: inviteForm.data.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                pivot: {
                    id: tempUserId,
                    board_id: board.id,
                    user_id: tempUserId,
                    role: 'editor',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        ]);
        inviteForm.reset();

        inviteForm.post(boardsRoute.invite(board.id).url, {
            preserveScroll: true,
            onError: () => {
                setUsers(previousUsers);
                inviteForm.setData('email', previousEmail);
            },
        });
    };

    const updateMemberRole = (userId: number, role: 'editor' | 'viewer') => {
        const previousUsers = users;
        setUpdatingMemberId(userId);
        setUsers((current) =>
            current.map((user) =>
                user.id === userId
                    ? {
                          ...user,
                          pivot: user.pivot ? { ...user.pivot, role } : user.pivot,
                      }
                    : user,
            ),
        );
        router.patch(
            boardsUsersRoute.update({ board: board.id, user: userId }).url,
            { role },
            {
                preserveScroll: true,
                onError: () => {
                    setUsers(previousUsers);
                },
                onFinish: () => setUpdatingMemberId(null),
            },
        );
    };

    const removeMember = () => {
        if (!memberToRemove) {
            return;
        }
        const previousUsers = users;

        setUsers((current) =>
            current.filter((user) => user.id !== memberToRemove.id),
        );
        setMemberToRemove(null);

        router.delete(
            boardsUsersRoute.remove({
                board: board.id,
                user: memberToRemove.id,
            }).url,
            {
                preserveScroll: true,
                onError: () => {
                    setUsers(previousUsers);
                },
            },
        );
    };

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-6">
                    <HeadingSmall
                        title="Приглашение участника"
                        description="Отправьте письмо с приглашением. Пользователь сможет открыть ссылку и присоединиться к доске под этим email."
                    />

                    <form className="space-y-6" onSubmit={submitInvite}>
                        <div className="grid gap-2">
                            <Label htmlFor="invite-email">Email</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                value={inviteForm.data.email}
                                disabled={!canEditBoard || inviteForm.processing}
                                onChange={(event) =>
                                    inviteForm.setData('email', event.target.value)
                                }
                                placeholder="user@example.com"
                            />
                            <InputError message={inviteForm.errors.email} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={!canEditBoard || inviteForm.processing}
                            >
                                <Users className="h-4 w-4" />
                                Пригласить
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <HeadingSmall
                        title="Участники доски"
                        description={`${users.length} участников подключено к этой доске.`}
                    />

                    <div className="space-y-4">
                        {users.map((user) => {
                            const role = user.pivot?.role;
                            const isCurrentUser = user.id === auth.user.id;
                            const isRoleEditable = isAdmin && role !== 'admin';

                            return (
                                <div
                                    key={user.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                {role && (
                                                    <Badge
                                                        variant={
                                                            role === 'admin'
                                                                ? 'default'
                                                                : role === 'editor'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {roleLabels[role]}
                                                    </Badge>
                                                )}
                                                {isCurrentUser && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Вы
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>

                                        {role === 'admin' ? (
                                            <div className="flex items-center gap-2 text-sm text-primary">
                                                <Shield className="h-4 w-4" />
                                                Администратор
                                            </div>
                                        ) : isRoleEditable ? (
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                <Select
                                                    value={role}
                                                    disabled={updatingMemberId === user.id}
                                                    onValueChange={(
                                                        value: 'editor' | 'viewer',
                                                    ) =>
                                                        updateMemberRole(
                                                            user.id,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="editor">
                                                            Редактор
                                                        </SelectItem>
                                                        <SelectItem value="viewer">
                                                            Читатель
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setMemberToRemove(user)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {!isAdmin
                                                    ? 'Изменение ролей доступно только администратору.'
                                                    : 'Роль администратора нельзя изменить отсюда.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Dialog
                open={memberToRemove !== null}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удалить участника?</DialogTitle>
                        <DialogDescription>
                            Пользователь {memberToRemove?.name} потеряет доступ к
                            этой доске.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMemberToRemove(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={removeMember}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
