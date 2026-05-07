import { BoardRole, Column } from '@/types';

export const columnTypeOptions: Array<{ value: Column['type']; label: string }> = [
    { value: 'backlog', label: 'Бэклог' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'done', label: 'Готово' },
];

export const roleLabels: Record<BoardRole, string> = {
    admin: 'Администратор',
    editor: 'Редактор',
    viewer: 'Читатель',
};
