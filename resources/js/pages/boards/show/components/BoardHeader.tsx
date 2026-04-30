import { Button } from '@/components/ui/button';
import boardsRoute from '@/routes/boards';
import { BoardData } from '@/types';
import { Link } from '@inertiajs/react';
import { Settings2 } from 'lucide-react';

type BoardHeaderProps = {
    board: BoardData;
};

export function BoardHeader({ board }: BoardHeaderProps) {
    return (
        <div className="mb-6 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">{board.title}</h1>

            <Button variant="outline" size="icon" asChild>
                <Link
                    href={boardsRoute.settings(board.id).url}
                    aria-label="Настройки доски"
                >
                    <Settings2 className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
