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
import { boardIcons } from '@/lib/board-icons';
import { InertiaFormProps } from '@inertiajs/react';

export type CreateBoardFormData = {
    title: string;
    icon: string;
};

interface CreateBoardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: InertiaFormProps<CreateBoardFormData>;
    onSubmit: (e: React.FormEvent) => void;
}

export function CreateBoardDialog({
    open,
    onOpenChange,
    form,
    onSubmit,
}: CreateBoardDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Новая доска</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label>Название</Label>
                        <Input
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            autoFocus
                        />
                        {form.errors.title && (
                            <p className="text-sm text-destructive">
                                {form.errors.title}
                            </p>
                        )}
                        <div className="space-y-2 pt-2">
                            <Label>Иконка</Label>
                            <div className="grid grid-cols-5 gap-2">
                                {boardIcons.map((icon) => {
                                    const Icon = icon.icon;
                                    const isActive =
                                        form.data.icon === icon.value;

                                    return (
                                        <button
                                            key={icon.value}
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'icon',
                                                    icon.value,
                                                )
                                            }
                                            className={`flex h-16 flex-col items-center justify-center gap-1 rounded-lg border text-xs transition ${
                                                isActive
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-muted hover:border-muted-foreground/50 hover:bg-accent/50'
                                            }`}
                                            aria-pressed={isActive}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{icon.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {form.errors.icon && (
                                <p className="text-sm text-destructive">
                                    {form.errors.icon}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            Создать
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
