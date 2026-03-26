import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';
import yandexIcon from '@/components/ui/yandex.svg'

const yandexAuthUrl = '/auth/yandex/redirect';

function YandexIcon() {
    return (
        <img className='w-6 rounded-full' src={yandexIcon} alt="" />
    );
}

type YandexAuthButtonProps = Omit<ComponentProps<typeof Button>, 'asChild'>;

export default function YandexAuthButton({
    className,
    children = 'Войти через Яндекс',
    ...props
}: YandexAuthButtonProps) {
    return (
        <Button
            asChild
            variant="outline"
            className={cn('w-full mt-3', className)}
            {...props}
        >
            <a href={yandexAuthUrl}>
                <YandexIcon />
                <span>{children}</span>
            </a>
        </Button>
    );
}
