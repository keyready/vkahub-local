import { cn, Image as NImage, type ImageProps } from '@nextui-org/react';
import { BlurhashCanvas } from 'react-blurhash';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface HashImageProps extends Omit<ImageProps, 'src' | 'fallbackSrc'> {
    src: string;
    fallbackSrc?: string;
    isSecured?: boolean;
    hash?: string;
    secureText?: string;
    width: number | string;
    height: number | string;
}

export const Image = (props: HashImageProps) => {
    const { src, hash, isSecured, width, height, fallbackSrc, secureText, ...rest } = props;

    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

    useEffect(() => {
        const newImage = new window.Image();
        setIsImageLoading(true);

        // setTimeout(() => {
        newImage.src = src;
        // }, Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500);

        newImage.onload = () => {
            setImage(newImage);
            setIsImageLoading(false);
        };
        newImage.onerror = (err) => {
            console.log(err);
        };
    }, [src]);

    return (
        <div className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
                <motion.div
                    key={isSecured || isImageLoading || !image ? `hash-${src}` : `image-${src}`}
                    initial={{ opacity: 0, y: -5 }}
                    exit={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1 }}
                >
                    {isSecured || isImageLoading || !image ? (
                        <div className="group relative">
                            {isSecured && width > 200 && (
                                <div
                                    className={cn(
                                        'group-hover:opacity-100 opacity-0 duration-200',
                                        'absolute group-hover:top-2 top-0 right-2',
                                        'py-1 px-2 bg-primary rounded-xl z-30',
                                    )}
                                >
                                    <p className="dark:text-black text-white">
                                        {secureText || 'Доступно по подписке'}
                                    </p>
                                </div>
                            )}

                            {hash ? (
                                <BlurhashCanvas
                                    style={{ width, height }}
                                    className={(rest.classNames?.wrapper as string) ?? ''}
                                    hash={hash}
                                />
                            ) : (
                                <NImage
                                    {...rest}
                                    width={width}
                                    height={height}
                                    src={fallbackSrc || ''}
                                />
                            )}
                        </div>
                    ) : (
                        <NImage {...rest} width={width} height={height} src={image.src} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
