import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BoardData, User } from '@/types';
import { router, useForm } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    Bot,
    Briefcase,
    Check,
    Copy,
    Download,
    Flag,
    GripVertical,
    Heart,
    Leaf,
    MoreHorizontal,
    Plug,
    Plus,
    Rocket,
    RotateCcw,
    Search,
    Target,
    Trash2,
    Zap,
} from 'lucide-react';
import {
    useMemo,
    useState,
    type ElementType,
    type FormEvent,
    type ReactNode,
} from 'react';

type BoardSettingsProps = {
    board: BoardData;
    users: User[];
    onBack: () => void;
    onAddColumn: () => void;
    onDelete: () => void;
    onUsers: () => void;
};

type SettingsTab =
    | 'general'
    | 'columns'
    | 'members'
    | 'access'
    | 'automations'
    | 'integrations'
    | 'export';

const tabs: Array<{ value: SettingsTab; label: string }> = [
    { value: 'general', label: 'Основные' },
    { value: 'columns', label: 'Колонки' },
    { value: 'members', label: 'Участники' },
    { value: 'access', label: 'Права доступа' },
    { value: 'automations', label: 'Автоматизации' },
    { value: 'integrations', label: 'Интеграции' },
    { value: 'export', label: 'Экспорт' },
];

const iconOptions = [
    { value: '🚀', icon: Rocket, color: 'from-[#4567ff] to-[#233bab]' },
    { value: '🌿', icon: Leaf, color: 'from-[#154b2b] to-[#0c2d1c]' },
    { value: '◎', icon: Target, color: 'from-[#6534a7] to-[#321c5d]' },
    { value: '⚡', icon: Zap, color: 'from-[#72451c] to-[#3f2813]' },
    { value: '♡', icon: Heart, color: 'from-[#6c2429] to-[#3a1518]' },
    { value: '💼', icon: Briefcase, color: 'from-[#145064] to-[#0c303b]' },
    { value: '⚑', icon: Flag, color: 'from-[#73346f] to-[#3e1d3d]' },
];

const visibilityLabels = {
    private: 'Приватная',
    workspace: 'Рабочая область',
    public: 'Публичная',
};

function Panel({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-lg border border-white/10 bg-[#14171d]/78 shadow-[0_18px_48px_rgba(0,0,0,0.28)] ${className}`}
        >
            {children}
        </section>
    );
}

function Toggle({ checked = true }: { checked?: boolean }) {
    return (
        <button
            type="button"
            className={`relative h-6 w-11 rounded-full transition ${
                checked ? 'bg-[#4d65d9]' : 'bg-white/12'
            }`}
        >
            <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    checked ? 'right-1' : 'left-1'
                }`}
            />
        </button>
    );
}

export function BoardSettings({
    board,
    users,
    onBack,
    onAddColumn,
    onDelete,
    onUsers,
}: BoardSettingsProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const form = useForm({
        title: board.title,
        description: board.description ?? '',
        visibility: board.visibility ?? 'private',
        icon: board.icon ?? '🚀',
        color: board.color ?? '#4d65d9',
    });

    const totalTasks = useMemo(
        () =>
            board.columns.reduce(
                (total, column) => total + column.tasks.length,
                0,
            ),
        [board.columns],
    );
    const owner = board.owner ?? users.find((user) => user.id === board.owner_id);

    const saveBoard = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/boards/${board.id}`, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['auth', 'board'] }),
        });
    };

    const updateRole = (userId: number, role: string) => {
        router.patch(
            `/boards/${board.id}/users/${userId}`,
            { role },
            { preserveScroll: true },
        );
    };

    return (
        <div className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_20%_0%,rgba(77,101,217,0.08),transparent_28%),linear-gradient(180deg,#0a0c10_0%,#07090d_100%)] p-5 text-zinc-100">
            <button
                type="button"
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Назад к доске
            </button>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Настройки доски
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-[#7667ff] to-[#3d63f0] text-lg font-black text-white shadow-[0_12px_30px_rgba(72,91,255,0.35)]">
                            {board.icon ?? board.id}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {board.title}
                        </h1>
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="rounded-md bg-white/8 px-3 py-1.5 text-sm text-zinc-300">
                            {
                                visibilityLabels[
                                    (board.visibility ?? 'private') as keyof typeof visibilityLabels
                                ]
                            }{' '}
                            доска
                        </span>
                    </div>
                </div>

                <Button
                    variant="destructive"
                    className="h-11 rounded-md bg-[#9d2f34] px-5 text-white hover:bg-[#b83b41]"
                    onClick={onDelete}
                >
                    Удалить доску
                </Button>
            </div>

            <nav className="mb-6 flex gap-7 overflow-x-auto border-b border-white/10 text-sm font-medium text-zinc-400 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`relative h-12 shrink-0 transition ${
                            activeTab === tab.value
                                ? 'text-white'
                                : 'hover:text-zinc-100'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.value && (
                            <span className="absolute right-0 -bottom-px left-0 h-0.5 rounded-full bg-[#5d78ff]" />
                        )}
                    </button>
                ))}
            </nav>

            {activeTab === 'general' && (
                <div className="grid gap-5 xl:grid-cols-[1fr_440px]">
                    <Panel className="p-6">
                        <form className="space-y-6" onSubmit={saveBoard}>
                            <h3 className="text-lg font-bold text-white">
                                Основные настройки
                            </h3>

                            <label className="block space-y-2">
                                <span className="text-sm text-zinc-300">
                                    Название доски
                                </span>
                                <Input
                                    value={form.data.title}
                                    onChange={(event) =>
                                        form.setData('title', event.target.value)
                                    }
                                    className="h-11 border-white/10 bg-black/20 text-white"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-sm text-zinc-300">
                                    Описание
                                </span>
                                <textarea
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-28 w-full rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#5d78ff]/70"
                                    placeholder="Кратко опишите назначение доски"
                                />
                            </label>

                            <div className="space-y-3">
                                <span className="text-sm text-zinc-300">
                                    Иконка и цвет
                                </span>
                                <div className="flex flex-wrap gap-3">
                                    {iconOptions.map((option) => {
                                        const Icon = option.icon;
                                        const active =
                                            form.data.icon === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    form.setData(
                                                        'icon',
                                                        option.value,
                                                    )
                                                }
                                                className={`relative flex h-14 w-14 items-center justify-center rounded-md border bg-gradient-to-br ${option.color} ${
                                                    active
                                                        ? 'border-[#6f86ff] ring-2 ring-[#5d78ff]'
                                                        : 'border-white/10 hover:border-white/25'
                                                }`}
                                            >
                                                <Icon className="h-7 w-7 text-white" />
                                                {active && (
                                                    <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#dce5ff] text-[#4d65d9]">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        className="flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <label className="block space-y-2">
                                <span className="text-sm text-zinc-300">
                                    Тип доски
                                </span>
                                <select
                                    value={form.data.visibility}
                                    onChange={(event) =>
                                        form.setData(
                                            'visibility',
                                            event.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-md border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#5d78ff]/70"
                                >
                                    <option value="private">Приватная</option>
                                    <option value="workspace">
                                        Рабочая область
                                    </option>
                                    <option value="public">Публичная</option>
                                </select>
                                <p className="text-sm text-zinc-500">
                                    Публичные доски видны всем участникам рабочей
                                    области.
                                </p>
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block space-y-2">
                                    <span className="text-sm text-zinc-300">
                                        Язык доски
                                    </span>
                                    <select className="h-11 w-full rounded-md border border-white/10 bg-black/20 px-4 text-sm text-white outline-none">
                                        <option>Русский</option>
                                    </select>
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-sm text-zinc-300">
                                        Часовой пояс
                                    </span>
                                    <select className="h-11 w-full rounded-md border border-white/10 bg-black/20 px-4 text-sm text-white outline-none">
                                        <option>
                                            (UTC+03:00) Москва, Санкт-Петербург
                                        </option>
                                    </select>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-11 rounded-md bg-[#4d65d9] px-5 text-white hover:bg-[#5b73ea]"
                            >
                                Сохранить изменения
                            </Button>
                        </form>
                    </Panel>

                    <div className="space-y-5">
                        <Panel className="p-6">
                            <h3 className="mb-6 text-lg font-bold text-white">
                                Информация о доске
                            </h3>
                            <div className="space-y-5 text-sm">
                                <InfoRow label="ID доски" value={`#${board.id}`} />
                                <InfoRow
                                    label="Создана"
                                    value={new Date(
                                        board.created_at,
                                    ).toLocaleString('ru-RU', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                />
                                <InfoRow
                                    label="Создатель"
                                    value={owner?.name ?? 'Неизвестно'}
                                />
                                <InfoRow
                                    label="Обновлена"
                                    value={new Date(
                                        board.updated_at,
                                    ).toLocaleString('ru-RU', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                />
                                <InfoRow
                                    label="Всего задач"
                                    value={String(totalTasks)}
                                />
                                <InfoRow
                                    label="Участников"
                                    value={String(users.length)}
                                />
                            </div>
                        </Panel>

                        <Panel className="p-5">
                            <h3 className="mb-4 text-lg font-bold text-white">
                                Действия
                            </h3>
                            <div className="space-y-2">
                                <ActionButton
                                    icon={Copy}
                                    title="Дублировать доску"
                                    subtitle="Создать копию этой доски"
                                />
                                <ActionButton
                                    icon={Archive}
                                    title="Архивировать доску"
                                    subtitle="Скрыть доску от участников"
                                />
                                <ActionButton
                                    icon={Trash2}
                                    title="Удалить доску"
                                    subtitle="Безвозвратно удалить доску и все данные"
                                    danger
                                    onClick={onDelete}
                                />
                            </div>
                        </Panel>
                    </div>
                </div>
            )}

            {activeTab === 'columns' && (
                <div className="max-w-3xl space-y-5">
                    <Panel className="p-5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Колонки доски
                                </h3>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Управляйте колонками и их порядком на доске
                                </p>
                            </div>
                            <Button
                                className="h-10 rounded-md bg-[#4d65d9] text-white hover:bg-[#5b73ea]"
                                onClick={onAddColumn}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Добавить колонку
                            </Button>
                        </div>

                        <div className="overflow-hidden rounded-md border border-white/10">
                            {board.columns.map((column) => (
                                <div
                                    key={column.id}
                                    className="grid grid-cols-[32px_1fr_auto_auto_36px] items-center gap-3 border-b border-white/10 px-4 py-4 last:border-b-0"
                                >
                                    <GripVertical className="h-4 w-4 text-zinc-500" />
                                    <div className="flex items-center gap-3">
                                        <span className="h-3 w-3 rounded-full bg-[#5d78ff]" />
                                        <span className="font-semibold text-white">
                                            {column.title}
                                        </span>
                                    </div>
                                    <span className="rounded-md bg-white/8 px-3 py-1 text-xs text-zinc-300">
                                        {column.tasks.length} задач
                                    </span>
                                    <span className="text-sm text-zinc-400">
                                        {column.wip_limit
                                            ? `Лимит: ${column.wip_limit}`
                                            : 'Без лимита'}
                                    </span>
                                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel className="p-5">
                        <h3 className="mb-5 text-lg font-bold text-white">
                            Настройка колонок
                        </h3>
                        <div className="divide-y divide-white/10 rounded-md border border-white/10">
                            <SettingLine
                                title="Показывать лимиты WIP на доске"
                                enabled
                            />
                            <SettingLine
                                title="Показывать количество задач в колонках"
                                enabled
                            />
                        </div>
                        <div className="mt-5 space-y-2">
                            <h4 className="font-semibold text-white">
                                Правила перемещения задач
                            </h4>
                            <select className="h-11 w-full rounded-md border border-white/10 bg-black/20 px-4 text-sm text-white outline-none">
                                <option>
                                    Разрешить перемещение между всеми колонками
                                </option>
                            </select>
                        </div>
                    </Panel>

                    <Button
                        variant="outline"
                        className="border-red-500/60 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Сбросить порядок колонок
                    </Button>
                </div>
            )}

            {activeTab === 'members' && (
                <div className="max-w-4xl space-y-5">
                    <Panel className="p-5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Участники доски
                                </h3>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Приглашайте и управляйте участниками доски
                                </p>
                            </div>
                            <Button
                                className="h-10 rounded-md bg-[#4d65d9] text-white hover:bg-[#5b73ea]"
                                onClick={onUsers}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Пригласить участника
                            </Button>
                        </div>

                        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_160px]">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                    className="h-10 w-full rounded-md border border-white/10 bg-black/20 pr-3 pl-9 text-sm text-white outline-none"
                                    placeholder="Поиск участников..."
                                />
                            </div>
                            <select className="h-10 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none">
                                <option>Все роли</option>
                            </select>
                        </div>

                        <div className="overflow-hidden rounded-md border border-white/10">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="grid grid-cols-[1fr_auto_32px] items-center gap-3 border-b border-white/10 px-4 py-3 last:border-b-0"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar user={user} />
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-white">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-sm text-zinc-500">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    {user.pivot?.role === 'owner' ? (
                                        <span className="rounded-md bg-emerald-500/18 px-3 py-1 text-xs font-semibold text-emerald-300">
                                            Владелец
                                        </span>
                                    ) : (
                                        <select
                                            value={user.pivot?.role ?? 'viewer'}
                                            onChange={(event) =>
                                                updateRole(
                                                    user.id,
                                                    event.target.value,
                                                )
                                            }
                                            className="h-8 rounded-md border border-white/10 bg-white/8 px-2 text-xs text-white outline-none"
                                        >
                                            <option value="editor">
                                                Редактор
                                            </option>
                                            <option value="viewer">
                                                Наблюдатель
                                            </option>
                                        </select>
                                    )}
                                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel className="p-5">
                        <h3 className="mb-4 text-lg font-bold text-white">
                            Приглашения
                        </h3>
                        <div className="space-y-2 rounded-md border border-white/10 p-4 text-sm text-zinc-400">
                            Активные приглашения появятся здесь после отправки.
                        </div>
                    </Panel>
                </div>
            )}

            {activeTab === 'access' && (
                <div className="max-w-3xl space-y-5">
                    <Panel className="p-5">
                        <h3 className="text-lg font-bold text-white">
                            Права доступа к доске
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">
                            Настройте, кто может просматривать и редактировать
                            доску
                        </p>
                        <AccessGroup
                            title="Кто может просматривать доску"
                            options={[
                                'Только приглашенные участники',
                                'Участники рабочей области',
                                'Все в интернете (публичная доска)',
                            ]}
                        />
                        <AccessGroup
                            title="Кто может редактировать доску"
                            options={[
                                'Только редакторы и выше',
                                'Все участники доски',
                                'Только владелец',
                            ]}
                        />
                    </Panel>

                    <Panel className="space-y-5 p-5">
                        <h3 className="text-lg font-bold text-white">
                            Дополнительные настройки
                        </h3>
                        <SettingLine
                            title="Разрешить участникам приглашать других"
                            subtitle="Участники с правами редактора могут приглашать"
                            enabled
                        />
                        <SettingLine
                            title="Показывать доску в списке досок рабочей области"
                            subtitle="Доска будет видна в общем списке"
                            enabled
                        />
                        <Button className="rounded-md bg-[#4d65d9] text-white hover:bg-[#5b73ea]">
                            Сохранить изменения
                        </Button>
                    </Panel>
                </div>
            )}

            {activeTab === 'automations' && (
                <PlaceholderPanel
                    icon={Bot}
                    title="Автоматизации"
                    text="Настройте правила для назначения задач, уведомлений и автоматического перемещения между колонками."
                    actions={['Создать правило', 'Шаблоны автоматизаций']}
                />
            )}

            {activeTab === 'integrations' && (
                <PlaceholderPanel
                    icon={Plug}
                    title="Интеграции"
                    text="Подключайте GitHub, Slack, календарь и другие инструменты команды."
                    actions={['Подключить GitHub', 'Подключить Slack']}
                />
            )}

            {activeTab === 'export' && (
                <PlaceholderPanel
                    icon={Download}
                    title="Экспорт"
                    text="Выгружайте задачи, комментарии и историю доски для отчетов или резервного копирования."
                    actions={['Экспорт CSV', 'Экспорт JSON']}
                />
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">{label}</span>
            <span className="text-right font-semibold text-white">{value}</span>
        </div>
    );
}

function ActionButton({
    icon: Icon,
    title,
    subtitle,
    danger = false,
    onClick,
}: {
    icon: ElementType;
    title: string;
    subtitle: string;
    danger?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-4 rounded-md border border-white/10 p-4 text-left transition hover:bg-white/[0.04] ${
                danger ? 'text-red-400' : 'text-white'
            }`}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-zinc-500">
                    {subtitle}
                </span>
            </span>
        </button>
    );
}

function SettingLine({
    title,
    subtitle,
    enabled = false,
}: {
    title: string;
    subtitle?: string;
    enabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-4">
            <span>
                <span className="block text-sm font-semibold text-white">
                    {title}
                </span>
                {subtitle && (
                    <span className="mt-1 block text-sm text-zinc-500">
                        {subtitle}
                    </span>
                )}
            </span>
            <Toggle checked={enabled} />
        </div>
    );
}

function AccessGroup({
    title,
    options,
}: {
    title: string;
    options: string[];
}) {
    const [selected, setSelected] = useState(0);

    return (
        <div className="mt-5 rounded-md border border-white/10 p-4">
            <h4 className="mb-3 font-semibold text-white">{title}</h4>
            <div className="divide-y divide-white/10">
                {options.map((option, index) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setSelected(index)}
                        className="flex w-full items-start gap-3 py-4 text-left"
                    >
                        <span
                            className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                                selected === index
                                    ? 'border-[#6f86ff]'
                                    : 'border-zinc-500'
                            }`}
                        >
                            {selected === index && (
                                <span className="h-2 w-2 rounded-full bg-[#6f86ff]" />
                            )}
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-white">
                                {option}
                            </span>
                            <span className="mt-1 block text-sm text-zinc-500">
                                {index === 0
                                    ? 'Доступ ограничен выбранными участниками'
                                    : 'Правило применяется ко всем подходящим пользователям'}
                            </span>
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function PlaceholderPanel({
    icon: Icon,
    title,
    text,
    actions,
}: {
    icon: ElementType;
    title: string;
    text: string;
    actions: string[];
}) {
    return (
        <Panel className="max-w-3xl p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-[#4d65d9]/20 text-[#8da2ff]">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                {text}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
                {actions.map((action) => (
                    <Button
                        key={action}
                        className="rounded-md bg-[#4d65d9] text-white hover:bg-[#5b73ea]"
                    >
                        {action}
                    </Button>
                ))}
            </div>
        </Panel>
    );
}

function Avatar({ user }: { user: User }) {
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f3b48f] to-[#7d4f38] text-xs font-bold text-white">
            {user.name
                .split(' ')
                .map((part) => part.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase()}
        </div>
    );
}
