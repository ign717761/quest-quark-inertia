<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class ManualTestingSeeder extends Seeder
{
    public function run(): void
    {
        $users = collect($this->users())->mapWithKeys(
            fn (array $attributes, string $key) => [$key => $this->upsertUser($attributes)]
        );

        foreach ($this->boards() as $boardDefinition) {
            $this->seedBoard($boardDefinition, $users->all());
        }

        $this->command?->info('Manual testing data is ready.');
        $this->command?->line('admin@example.com / password');
        $this->command?->line('editor@example.com / password');
        $this->command?->line('viewer@example.com / password');
        $this->command?->line('outsider@example.com / password');
    }

    private function upsertUser(array $attributes): User
    {
        return User::updateOrCreate(
            ['email' => $attributes['email']],
            [
                'name' => $attributes['name'],
                'password' => $attributes['password'],
            ],
        );
    }

    private function seedBoard(array $definition, array $users): void
    {
        /** @var User $owner */
        $owner = $users[$definition['owner']];

        $board = Board::updateOrCreate(
            [
                'user_id' => $owner->id,
                'title' => $definition['title'],
            ],
            ['icon' => $definition['icon']],
        );

        $board->users()->sync(
            collect($definition['members'])
                ->mapWithKeys(
                    fn (string $role, string $userKey) => [$users[$userKey]->id => ['role' => $role]]
                )
                ->all()
        );

        Task::query()
            ->whereHas('column', fn ($query) => $query->where('board_id', $board->id))
            ->delete();

        Column::query()
            ->where('board_id', $board->id)
            ->delete();

        foreach ($definition['columns'] as $columnIndex => $columnDefinition) {
            $column = Column::create([
                'board_id' => $board->id,
                'title' => $columnDefinition['title'],
                'position' => $columnIndex,
            ]);

            foreach ($columnDefinition['tasks'] as $taskIndex => $taskDefinition) {
                $assigneeKey = $taskDefinition['assignee'] ?? null;

                $task = Task::create([
                    'column_id' => $column->id,
                    'creator_id' => $users[$taskDefinition['creator']]->id,
                    'assignee_id' => $assigneeKey ? $users[$assigneeKey]->id : null,
                    'title' => $taskDefinition['title'],
                    'description' => $taskDefinition['description'],
                    'position' => $taskIndex,
                ]);

                foreach ($taskDefinition['comments'] ?? [] as $commentDefinition) {
                    TaskComment::create([
                        'task_id' => $task->id,
                        'author_id' => $users[$commentDefinition['author']]->id,
                        'body' => $commentDefinition['body'],
                    ]);
                }
            }
        }
    }

    private function users(): array
    {
        return [
            'admin' => [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => 'password',
            ],
            'editor' => [
                'name' => 'Editor User',
                'email' => 'editor@example.com',
                'password' => 'password',
            ],
            'viewer' => [
                'name' => 'Viewer User',
                'email' => 'viewer@example.com',
                'password' => 'password',
            ],
            'outsider' => [
                'name' => 'Outsider User',
                'email' => 'outsider@example.com',
                'password' => 'password',
            ],
        ];
    }

    private function boards(): array
    {
        return [
            [
                'title' => 'Запуск продукта',
                'icon' => 'rocket',
                'owner' => 'admin',
                'members' => [
                    'admin' => 'admin',
                    'editor' => 'editor',
                    'viewer' => 'viewer',
                ],
                'columns' => [
                    [
                        'title' => 'Идеи',
                        'tasks' => [
                            [
                                'title' => 'Собрать список лендингов для вдохновения',
                                'description' => 'Нужно подобрать 5-7 референсов, чтобы быстро проверить визуальные гипотезы.',
                                'creator' => 'admin',
                                'assignee' => 'editor',
                                'comments' => [
                                    [
                                        'author' => 'viewer',
                                        'body' => 'Добавил в заметки пару неплохих B2B-референсов.',
                                    ],
                                ],
                            ],
                            [
                                'title' => 'Проверить конкурентов по онбордингу',
                                'description' => 'Сравнить первый экран, CTA и шаги регистрации у прямых конкурентов.',
                                'creator' => 'admin',
                                'assignee' => null,
                            ],
                        ],
                    ],
                    [
                        'title' => 'В работе',
                        'tasks' => [
                            [
                                'title' => 'Подготовить контент для welcome-экрана',
                                'description' => 'Нужны короткий value proposition, подпись под формой и CTA для демо.',
                                'creator' => 'admin',
                                'assignee' => 'editor',
                                'comments' => [
                                    [
                                        'author' => 'admin',
                                        'body' => 'Проверь, чтобы текст не ломал мобильный layout.',
                                    ],
                                    [
                                        'author' => 'editor',
                                        'body' => 'Черновик уже готов, осталось согласовать акценты.',
                                    ],
                                ],
                            ],
                            [
                                'title' => 'Настроить аналитику регистрации',
                                'description' => 'Проверить отправку события после успешной регистрации и входа через социальный провайдер.',
                                'creator' => 'editor',
                                'assignee' => 'admin',
                            ],
                        ],
                    ],
                    [
                        'title' => 'На проверке',
                        'tasks' => [
                            [
                                'title' => 'Прогнать ручной smoke-тест доски',
                                'description' => 'Проверить создание колонки, таски, комментария и изменение роли участника.',
                                'creator' => 'editor',
                                'assignee' => 'viewer',
                                'comments' => [
                                    [
                                        'author' => 'viewer',
                                        'body' => 'Базовый сценарий проходит, но invite хочу перепроверить отдельно.',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'title' => 'Готово',
                        'tasks' => [
                            [
                                'title' => 'Создать доску запуска',
                                'description' => 'Структура колонок и участники уже готовы для демонстрации.',
                                'creator' => 'admin',
                                'assignee' => 'admin',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Внутренние улучшения',
                'icon' => 'briefcase',
                'owner' => 'editor',
                'members' => [
                    'editor' => 'admin',
                    'admin' => 'editor',
                ],
                'columns' => [
                    [
                        'title' => 'Бэклог',
                        'tasks' => [
                            [
                                'title' => 'Разобрать фидбек по drag and drop',
                                'description' => 'Собрать список проблем с сортировкой задач и переносом между колонками.',
                                'creator' => 'editor',
                                'assignee' => 'admin',
                            ],
                            [
                                'title' => 'Подумать над архивом завершённых задач',
                                'description' => 'Пока это идея без исполнителя, нужна просто как элемент для ручного теста.',
                                'creator' => 'editor',
                                'assignee' => null,
                            ],
                        ],
                    ],
                    [
                        'title' => 'В процессе',
                        'tasks' => [
                            [
                                'title' => 'Упростить форму приглашения пользователя',
                                'description' => 'Нужно сделать понятнее ошибки при попытке пригласить несуществующий email.',
                                'creator' => 'admin',
                                'assignee' => 'editor',
                                'comments' => [
                                    [
                                        'author' => 'admin',
                                        'body' => 'Это хороший сценарий для ручной проверки негативных кейсов.',
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'title' => 'Готово',
                        'tasks' => [
                            [
                                'title' => 'Подключить базовые сиды для демо',
                                'description' => 'Данные должны быть повторяемыми и удобными для показа приложения.',
                                'creator' => 'editor',
                                'assignee' => 'editor',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Личная админская доска',
                'icon' => 'monitor',
                'owner' => 'admin',
                'members' => [
                    'admin' => 'admin',
                ],
                'columns' => [
                    [
                        'title' => 'Сегодня',
                        'tasks' => [
                            [
                                'title' => 'Проверить пустой dashboard у outsider',
                                'description' => 'После входа outsider не должен видеть ни одной доски и чужие маршруты.',
                                'creator' => 'admin',
                                'assignee' => 'admin',
                            ],
                        ],
                    ],
                    [
                        'title' => 'Потом',
                        'tasks' => [
                            [
                                'title' => 'Подготовить сценарий демонстрации прав доступа',
                                'description' => 'Показать разницу между admin, editor и viewer на одной и той же доске.',
                                'creator' => 'admin',
                                'assignee' => null,
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
