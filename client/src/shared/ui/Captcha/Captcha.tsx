import { Turnstile } from '@marsidev/react-turnstile';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';

interface CaptchaProps {
    className?: string;
    onSuccessLoad: () => void;
    onError: () => void;
}

export const Captcha = (props: CaptchaProps) => {
    const { className, onError, onSuccessLoad } = props;

    return (
        <HStack maxW justify="start" className={classNames('', {}, [className])}>
            <Turnstile
                options={{
                    theme: 'dark',
                }}
                className="rounded-xl"
                onError={onError}
                onSuccess={onSuccessLoad}
                siteKey="0x4AAAAAAAkgnjeajkAX9QQ3"
            />
        </HStack>
    );
};
