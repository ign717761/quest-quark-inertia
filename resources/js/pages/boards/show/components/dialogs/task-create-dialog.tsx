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
import { useBoardStore } from '@/stores/use-board-store';
import { SharedData, Task } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { User } from 'lucide-react';

interface TaskCreateDialogProps {
    columnId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TaskCreateDialog({
    columnId,
    open,
    onOpenChange,
}: TaskCreateDialogProps) {
    const { auth } = usePage<SharedData>().props;
    const board = useBoardStore((state) => state.board);
    const addTask = useBoardStore((state) => state.addTask);
    const setBoard = useBoardStore((state) => state.setBoard);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        assignee_id: 'none',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!columnId) return;

        const boardSnapshot = board
            ? (structuredClone(board) as typeof board)
            : null;
        const tempTaskId = -Date.now();
        const assigneeId =
            data.assignee_id === 'none' ? null : Number(data.assignee_id);
        const assignee =
            board?.users?.find((user) => user.id === assigneeId) ?? null;
        const optimisticTask: Task = {
            id: tempTaskId,
            column_id: columnId,
            creator_id: auth.user.id,
            assignee_id: assigneeId,
            title: data.title,
            description: data.description,
            position: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignee,
            comments: [],
        };

        addTask(optimisticTask);
        reset();
        onOpenChange(false);

        post(`/columns/${columnId}/tasks`, {
            ...data,
            assignee_id: data.assignee_id === 'none' ? null : data.assignee_id,
            onError: () => {
                if (boardSnapshot) {
                    setBoard(boardSnapshot);
                }
            },
            preserveScroll: true,
        } as any);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100dvh] max-h-[100dvh] w-full overflow-y-auto rounded-none p-4 sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-lg sm:p-6">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Новая задача</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-title">Название</Label>
                            <Input
                                id="create-title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                placeholder="Что нужно сделать?"
                                autoFocus
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-description">Описание</Label>
                            <RichTextEditor
                                id="create-description"
                                value={data.description}
                                onChange={(value) =>
                                    setData('description', value)
                                }
                                placeholder="Добавьте подробностей..."
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
                                    <SelectValue placeholder="Выберите исполнителя" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <span className="flex items-center text-muted-foreground">
                                            <User className="mr-2 h-4 w-4" />{' '}
                                            Без исполнителя
                                        </span>
                                    </SelectItem>
                                    {board?.users?.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={String(user.id)}
                                        >
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Отмена
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Создать задачу
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
