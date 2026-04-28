import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Users } from 'lucide-react';

import { BoardData } from '@/types';

type BoardHeaderProps = {
    board: BoardData;
    isAdmin: boolean;
    onRename: () => void;
    onDelete: () => void;
    onUsers: () => void;
};

export function BoardHeader({
    board,
    isAdmin,
    onRename,
    onDelete,
    onUsers,
}: BoardHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <h1
                className="cursor-pointer text-2xl font-bold tracking-tight transition-colors hover:text-primary"
                onClick={() => isAdmin && onRename()}
            >
                {board.title}
            </h1>

            {isAdmin && (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onUsers}>
                        <Users className="mr-2 h-4 w-4" /> Участники
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onRename}>
                                Переименовать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={onDelete}
                            >
                                Удалить доску
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
}
