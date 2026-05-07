import { Column } from '@/types';

export type ColumnDraft = Pick<Column, 'id' | 'title' | 'type' | 'position'>;

export function normalizeColumns(columns: Column[]): ColumnDraft[] {
    return [...columns].sort((a, b) => a.position - b.position);
}
