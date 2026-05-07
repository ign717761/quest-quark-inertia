import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Column } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, GripVertical, Trash2 } from 'lucide-react';

import { columnTypeOptions } from './constants';
import { ColumnDraft } from './types';

type SortableColumnItemProps = {
    column: ColumnDraft;
    disabled: boolean;
    processing: boolean;
    error?: string;
    onChange: (columnId: number, patch: Partial<ColumnDraft>) => void;
    onSave: (columnId: number) => void;
    onDelete: (column: ColumnDraft) => void;
};

export default function SortableColumnItem({
    column,
    disabled,
    processing,
    error,
    onChange,
    onSave,
    onDelete,
}: SortableColumnItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.6 : 1,
            }}
        >
            <Card className="py-4">
                <CardContent className="space-y-4 px-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                            disabled={disabled}
                            aria-label="Переместить колонку"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-5 w-5" />
                        </Button>

                        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                            <div>
                                <Label
                                    className="sr-only"
                                    htmlFor={`column-title-${column.id}`}
                                >
                                    Название
                                </Label>
                                <Input
                                    id={`column-title-${column.id}`}
                                    value={column.title}
                                    disabled={disabled}
                                    className="h-9 px-5 text-base"
                                    onChange={(event) =>
                                        onChange(column.id, {
                                            title: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label className="sr-only">Тип</Label>
                                <Select
                                    value={column.type}
                                    disabled={disabled}
                                    onValueChange={(value: Column['type']) =>
                                        onChange(column.id, { type: value })
                                    }
                                >
                                    <SelectTrigger className="h-9 px-5 text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columnTypeOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                                aria-label="Удалить колонку"
                                onClick={() => onDelete(column)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>

                            <Button
                                type="button"
                                size="icon"
                                disabled={disabled || processing}
                                aria-label="Сохранить колонку"
                                onClick={() => onSave(column.id)}
                            >
                                <Check className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {error && <InputError message={error} />}
                </CardContent>
            </Card>
        </div>
    );
}
