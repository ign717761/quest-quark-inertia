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
import { InertiaFormProps } from '@inertiajs/react';

export type CreateBoardFormData = {
    title: string;
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
