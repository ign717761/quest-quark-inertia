import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { AlertCircleIcon, CircleCheckIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type FlashNotice = {
    id: number;
    type: 'success' | 'error';
    title: string;
    message: string;
    visible: boolean;
    closing: boolean;
};

export function FlashMessages() {
    const { flash } = usePage<SharedData>().props;
    const [notices, setNotices] = useState<FlashNotice[]>([]);
    const timeoutIdsRef = useRef<number[]>([]);
    const noticeIdRef = useRef(0);

    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
        };
    }, []);

    useEffect(() => {
        const nextNotices: FlashNotice[] = [];

        if (flash?.success) {
            nextNotices.push({
                id: ++noticeIdRef.current,
                type: 'success',
                title: 'Готово',
                message: flash.success,
                visible: false,
                closing: false,
            });
        }

        if (flash?.error) {
            nextNotices.push({
                id: ++noticeIdRef.current,
                type: 'error',
                title: 'Ошибка',
                message: flash.error,
                visible: false,
                closing: false,
            });
        }

        if (nextNotices.length === 0) {
            return;
        }

        setNotices((current) => [...current, ...nextNotices]);

        nextNotices.forEach((notice) => {
            const showTimeout = window.setTimeout(() => {
                setNotices((current) =>
                    current.map((item) =>
                        item.id === notice.id ? { ...item, visible: true } : item,
                    ),
                );
            }, 20);

            const startClosingTimeout = window.setTimeout(() => {
                setNotices((current) =>
                    current.map((item) =>
                        item.id === notice.id ? { ...item, closing: true } : item,
                    ),
                );
            }, 3800);

            const removeTimeout = window.setTimeout(() => {
                setNotices((current) =>
                    current.filter((item) => item.id !== notice.id),
                );
            }, 4200);

            timeoutIdsRef.current.push(showTimeout, startClosingTimeout, removeTimeout);
        });
    }, [flash]);

    if (notices.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
            {notices.map((notice) => (
                <Alert
                    key={notice.id}
                    variant={notice.type === 'error' ? 'destructive' : 'default'}
                    className={`pointer-events-auto border shadow-lg transition-all duration-300 ease-out ${
                        notice.closing
                            ? 'translate-y-0 scale-95 opacity-0'
                            : notice.visible
                              ? 'translate-y-0 scale-100 opacity-100'
                              : '-translate-y-2 scale-95 opacity-0'
                    } ${
                        notice.type === 'error'
                            ? 'border-rose-200 bg-rose-50 text-rose-950 [&>svg]:text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-50 dark:[&>svg]:text-rose-300'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-50 dark:[&>svg]:text-emerald-300'
                    }`}
                >
                    {notice.type === 'error' ? (
                        <AlertCircleIcon />
                    ) : (
                        <CircleCheckIcon />
                    )}
                    <AlertTitle>{notice.title}</AlertTitle>
                    <AlertDescription>{notice.message}</AlertDescription>
                </Alert>
            ))}
        </div>
    );
}
