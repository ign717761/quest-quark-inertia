import { Button } from '@/components/ui/button';
import {
    Filter,
    Plus,
    Search,
    Settings,
    SlidersHorizontal,
    Star,
    Table2,
    UserPlus,
    Users,
} from 'lucide-react';

import { BoardData } from '@/types';

type BoardHeaderProps = {
    board: BoardData;
    onUsers: () => void;
    onCreateTask: () => void;
    activeView: 'board' | 'settings';
    onViewChange: (view: 'board' | 'settings') => void;
};

export function BoardHeader({
    board,
    onUsers,
    onCreateTask,
    activeView,
    onViewChange,
}: BoardHeaderProps) {
    const memberCount = board.users?.length ?? 0;
    const boardInitial = board.icon ?? String(board.id);
    const tabs = [
        { label: 'Доска', icon: Table2, value: 'board' as const },
        { label: 'Настройки', icon: Settings, value: 'settings' as const },
    ];

    return (
        <header className="border-b border-white/8 bg-[#090b0f]/95 px-5 pt-5 shadow-[0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-[#7667ff] to-[#3d63f0] text-lg font-black text-white shadow-[0_12px_30px_rgba(72,91,255,0.35)]">
                            {boardInitial}
                        </div>
                        <h1
                            className="max-w-[420px] truncate text-2xl font-bold tracking-tight text-white"
                        >
                            {board.title}
                        </h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-md text-amber-400 hover:bg-white/8 hover:text-amber-300"
                            aria-label="В избранное"
                        >
                            <Star className="h-4 w-4 fill-current" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-md bg-white/7 px-3 text-zinc-100 hover:bg-white/12 hover:text-white"
                            onClick={onUsers}
                        >
                            <Users className="h-4 w-4" />
                            <span className="ml-2">{memberCount}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-md bg-white/7 px-3 text-zinc-100 hover:bg-white/12 hover:text-white"
                            onClick={onUsers}
                        >
                            <UserPlus className="h-4 w-4" />
                            <span className="ml-2 hidden sm:inline">
                                Пригласить
                            </span>
                        </Button>
                    </div>

                    <nav className="mt-5 flex gap-7 overflow-x-auto text-sm font-medium text-zinc-400 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.label}
                                    onClick={() => onViewChange(tab.value)}
                                    className={`relative flex h-10 shrink-0 items-center gap-2 transition-colors ${
                                        activeView === tab.value
                                            ? 'text-white'
                                            : 'hover:text-zinc-100'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {activeView === tab.value && (
                                        <span className="absolute right-0 -bottom-px left-0 h-0.5 rounded-full bg-[#5d78ff]" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex flex-wrap items-center gap-3 xl:pt-11">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            className="h-10 w-full rounded-md border border-white/10 bg-white/6 pr-3 pl-9 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#5d78ff]/70 focus:bg-white/9 sm:w-56"
                            placeholder="Поиск задач..."
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-md bg-white/7 px-3 text-zinc-100 hover:bg-white/12 hover:text-white"
                    >
                        <Filter className="h-4 w-4" />
                        <span className="ml-2">Фильтры</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-md bg-white/7 px-3 text-zinc-100 hover:bg-white/12 hover:text-white"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="ml-2">Сортировка</span>
                    </Button>
                    <Button
                        size="sm"
                        className="h-10 rounded-md bg-[#4d65d9] px-3 text-white shadow-[0_10px_24px_rgba(77,101,217,0.35)] hover:bg-[#5b73ea]"
                        onClick={onCreateTask}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="ml-2">Создать задачу</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
