import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import tasksRoute from '@/routes/tasks';
import { SharedData, Task, type User as UserType } from '@/types';
import { useForm, usePage, router } from '@inertiajs/react';
import { Trash2, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface TaskEditDialogProps {
    task: Task;
    boardUsers: UserType[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });

    if (Math.abs(diffMinutes) < 60) {
        return rtf.format(diffMinutes, 'minute');
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
    }

    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, 'day');
}

export default function TaskEditDialog({
    task,
    boardUsers,
    open,
    onOpenChange,
}: TaskEditDialogProps) {
    const { auth } = usePage<SharedData>().props;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCommentDeleteDialogOpen, setIsCommentDeleteDialogOpen] =
        useState(false);
    const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(
        null,
    );
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
        null,
    );

    const {
        data,
        setData,
        patch,
        delete: destroy,
        processing,
        errors,
    } = useForm({
        title: task.title || '',
        description: task.description || '',
        assignee_id: task.assignee_id ? String(task.assignee_id) : 'none',
    });

    const {
        data: commentData,
        setData: setCommentData,
        post: postComment,
        processing: commentProcessing,
        errors: commentErrors,
        reset: resetComment,
    } = useForm({
        body: '',
    });

    const {
        data: editCommentData,
        setData: setEditCommentData,
        patch: patchComment,
        processing: editCommentProcessing,
        errors: editCommentErrors,
        reset: resetEditComment,
    } = useForm({
        body: '',
    });

    const currentRole = boardUsers.find((u) => u.id === auth.user.id)?.pivot?.role;
    const canManageTask = currentRole === 'admin' || currentRole === 'editor';
    const canCreateComment = Boolean(
        boardUsers.find((user) => user.id === auth.user.id),
    );
    const canDeleteTask = auth.user.id === task.creator_id;

    const comments = useMemo(() => task.comments || [], [task.comments]);

    useEffect(() => {
        setData('title', task.title || '');
        setData('description', task.description || '');
        setData('assignee_id', task.assignee_id ? String(task.assignee_id) : 'none');
        setEditingCommentId(null);
        resetComment();
        resetEditComment();
    }, [
        task.id,
        task.title,
        task.description,
        task.assignee_id,
        setData,
        resetComment,
        resetEditComment,
    ]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title: data.title,
            description: data.description,
            assignee_id:
                data.assignee_id === 'none' ? null : Number(data.assignee_id),
        };

        patch(tasksRoute.update(task.id).url, {
            ...payload,
            onSuccess: () => onOpenChange(false),
            preserveScroll: true,
        } as any);
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        destroy(tasksRoute.destroy(task.id).url, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                onOpenChange(false);
            },
            preserveScroll: true,
        });
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();

        postComment(`/tasks/${task.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => resetComment(),
        });
    };

    const startEditComment = (commentId: number, body: string) => {
        setEditingCommentId(commentId);
        setEditCommentData('body', body);
    };

    const submitEditComment = (commentId: number) => {
        patchComment(`/comments/${commentId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCommentId(null);
                resetEditComment();
            },
        });
    };

    const requestDeleteComment = (commentId: number) => {
        setCommentToDeleteId(commentId);
        setIsCommentDeleteDialogOpen(true);
    };

    const confirmDeleteComment = () => {
        if (!commentToDeleteId) return;

        router.delete(`/comments/${commentToDeleteId}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (editingCommentId === commentToDeleteId) {
                    setEditingCommentId(null);
                    resetEditComment();
                }
                setIsCommentDeleteDialogOpen(false);
                setCommentToDeleteId(null);
            },
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="h-[100dvh] max-h-[100dvh] w-full overflow-y-auto rounded-none p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-lg sm:p-6">
                    <form onSubmit={submit}>
                        <DialogHeader>
                            <DialogTitle>Редактирование задачи</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-4">
                                <Label htmlFor="title">Название</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Что нужно сделать?"
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Описание</Label>
                                <RichTextEditor
                                    id="description"
                                    value={data.description}
                                    onChange={(value) =>
                                        setData('description', value)
                                    }
                                    placeholder="Добавьте деталей..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Исполнитель</Label>
                                <Select
                                    value={data.assignee_id}
                                    onValueChange={(value) =>
                                        setData('assignee_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Назначить пользователя" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="flex items-center text-muted-foreground">
                                                <User className="mr-2 h-4 w-4" />{' '}
                                                Без исполнителя
                                            </span>
                                        </SelectItem>
                                        {boardUsers?.map((user) => (
                                            <SelectItem
                                                key={user.id}
                                                value={String(user.id)}
                                            >
                                                <span className="flex items-center">
                                                    <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px]">
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    {user.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="flex items-center justify-between sm:justify-between">
                            <div>
                                {canDeleteTask && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Отмена
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Сохранить
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>

                    <div className="mt-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-md font-semibold">Комментарии</h3>
                            <span className="text-xs text-muted-foreground">
                                {comments.length}
                            </span>
                        </div>

                        {canCreateComment && (
                            <form
                                onSubmit={submitComment}
                                className="mb-4"
                            >
                                <Label htmlFor="new-comment" className="sr-only">
                                    Новый комментарий
                                </Label>
                                <RichTextEditor
                                    id="new-comment"
                                    value={commentData.body}
                                    onChange={(value) =>
                                        setCommentData('body', value)
                                    }
                                    placeholder="Добавьте комментарий..."
                                />
                                <div className="mt-2 flex justify-end">
                                    <Button type="submit" disabled={commentProcessing}>
                                        Отправить
                                    </Button>
                                </div>
                                {commentErrors.body && (
                                    <p className="mt-2 text-xs text-destructive">
                                        {commentErrors.body}
                                    </p>
                                )}
                            </form>
                        )}

                        {comments.length === 0 && (
                            <p className="mb-4 text-sm text-muted-foreground">
                                Пока нет комментариев.
                            </p>
                        )}

                        <div className="space-y-4">
                            {comments.map((comment) => {
                                const isAuthor = comment.author_id === auth.user.id;
                                const canManageComment =
                                    isAuthor || currentRole === 'admin';

                                return (
                                    <div
                                        key={comment.id}
                                        className="rounded-md border p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 gap-3">
                                                <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border">
                                                    {comment.author?.avatar ? (
                                                        <img
                                                            src={
                                                                comment.author
                                                                    .avatar
                                                            }
                                                            alt={
                                                                comment.author
                                                                    ?.name ||
                                                                'Пользователь'
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                                                            {(
                                                                comment.author
                                                                    ?.name ||
                                                                'П'
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground">
                                                            {comment.author
                                                                ?.name ||
                                                                'Пользователь'}
                                                        </span>
                                                        <span>
                                                            {formatRelativeTime(
                                                                comment.updated_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {editingCommentId !==
                                                        comment.id && (
                                                        <div
                                                            className="text-sm break-words text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                                                            dangerouslySetInnerHTML={{
                                                                __html: comment.body,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {canManageComment &&
                                                editingCommentId !==
                                                    comment.id && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                startEditComment(
                                                                    comment.id,
                                                                    comment.body,
                                                                )
                                                            }
                                                        >
                                                            Изменить
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-destructive"
                                                            onClick={() =>
                                                                requestDeleteComment(
                                                                    comment.id,
                                                                )
                                                            }
                                                        >
                                                            Удалить
                                                        </Button>
                                                    </div>
                                                )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="mt-2 space-y-2">
                                                <RichTextEditor
                                                    value={editCommentData.body}
                                                    onChange={(value) =>
                                                        setEditCommentData(
                                                            'body',
                                                            value,
                                                        )
                                                    }
                                                />
                                                {editCommentErrors.body && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            editCommentErrors.body
                                                        }
                                                    </p>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() =>
                                                            submitEditComment(
                                                                comment.id,
                                                            )
                                                        }
                                                        disabled={
                                                            editCommentProcessing
                                                        }
                                                    >
                                                        Сохранить
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingCommentId(
                                                                null,
                                                            );
                                                            resetEditComment();
                                                        }}
                                                    >
                                                        Отмена
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent className="max-h-[80vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Удалить задачу?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Это действие нельзя отменить. Задача будет удалена
                        навсегда.
                    </p>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={processing}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={isCommentDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsCommentDeleteDialogOpen(open);
                    if (!open) {
                        setCommentToDeleteId(null);
                    }
                }}
            >
                <DialogContent className="max-h-[80vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Удалить комментарий?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Вы уверены, что хотите удалить комментарий?
                    </p>
                    <DialogFooter className="flex gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsCommentDeleteDialogOpen(false);
                                setCommentToDeleteId(null);
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDeleteComment}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
