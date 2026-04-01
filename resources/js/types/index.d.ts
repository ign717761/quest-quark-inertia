import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    pivot?: BoardUserPivot;
    [key: string]: unknown;
}

export interface Board {
    id: number;
    title: string;
    icon?: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface Column {
    id: number;
    board_id: number;
    title: string;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    column_id: number;
    creator_id: number;
    assignee_id: number | null;
    title: string;
    description: string;
    position: number;
    created_at: string;
    updated_at: string;
    creator?: User;
    assignee?: User | null;
    comments?: TaskComment[];
}

export interface TaskComment {
    id: number;
    task_id: number;
    author_id: number;
    body: string;
    created_at: string;
    updated_at: string;
    author?: User;
}

export interface BoardUserPivot {
    id: number;
    board_id: number;
    user_id: number;
    role: 'admin' | 'editor' | 'viewer';
    created_at: string;
    updated_at: string;
}

export interface ColumnWithTasks extends Column {
    tasks: Task[];
}

export interface BoardData extends Board {
    columns: ColumnWithTasks[];
    users?: User[];
}

export type BoardRole = BoardUserPivot['role'];

export interface DashboardBoard extends Board {
    pivot?: Pick<BoardUserPivot, 'role'>;
    columns: Array<Pick<ColumnWithTasks, 'tasks'>>;
    users: User[];
}

export interface DashboardStats {
    total_boards: number;
    total_tasks: number;
    total_members: number;
}

export interface Auth {
    user: User;
    boards: Board[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: {
        message: string;
        author: string;
    };
    auth: Auth;
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    sidebarOpen: boolean;
    [key: string]: unknown;
}
