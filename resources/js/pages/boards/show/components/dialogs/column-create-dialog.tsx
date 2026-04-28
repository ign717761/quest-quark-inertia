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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

interface ColumnCreateDialogProps {
    boardId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ColumnCreateDialog({
    boardId,
    open,
    onOpenChange,
}: ColumnCreateDialogProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        type: 'in_progress',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/boards/${boardId}/columns`, {
            onSuccess: () => {
                reset();
                setData('type', 'in_progress');
                onOpenChange(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Добавить новую колонку</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="col-title">Название колонки</Label>
                            <Input
                                id="col-title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                placeholder="Например: В работе"
                                autoFocus
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Тип колонки</Label>
                            <Select
                                value={data.type}
                                onValueChange={(value) => setData('type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="backlog">Бэклог</SelectItem>
                                    <SelectItem value="in_progress">В работе</SelectItem>
                                    <SelectItem value="done">Готово</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-xs text-destructive">
                                    {errors.type}
                                </p>
                            )}
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
                            Создать
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
