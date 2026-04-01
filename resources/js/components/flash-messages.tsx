import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { AlertCircleIcon, CircleCheckIcon } from 'lucide-react';

export function FlashMessages() {
    const { flash } = usePage<SharedData>().props;

    if (!flash?.success && !flash?.error) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 px-6 pt-6">
            {flash.success ? (
                <Alert>
                    <CircleCheckIcon />
                    <AlertTitle>Готово</AlertTitle>
                    <AlertDescription>{flash.success}</AlertDescription>
                </Alert>
            ) : null}

            {flash.error ? (
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            ) : null}
        </div>
    );
}
