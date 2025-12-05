import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { cn, Spinner } from '@nextui-org/react';
import { AnimatePresence, motion } from 'framer-motion';

import classes from './ImageUpload.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { ImageCropper } from '@/shared/ui/ImageCropper';
import { encodeImageToBlurhash } from '@/shared/ui/Image';

interface ImageUploadProps {
    className?: string;
    onChange: (file: File) => void;
    onImageHashGenerated?: (hash: string) => void;
    isLoading?: boolean;
    initialImage?: string;
}

export const ImageUpload = (props: ImageUploadProps) => {
    const { className, isLoading, onImageHashGenerated, initialImage, onChange } = props;

    const [uploadedImageSrc, setUploadedImageSrc] = useState<string>();
    const [isDragStart, setIsDragStart] = useState<boolean>(false);
    const [croppedImage, setCroppedImage] = useState<string>('');
    const [isHashGenerating, setIsHashGenerating] = useState<boolean>(false);

    useEffect(() => {
        if (initialImage) {
            setCroppedImage(initialImage);
        }
    }, [initialImage]);

    const handleUploadFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const { files } = event.target;

        if (files?.length) {
            setUploadedImageSrc(URL.createObjectURL(files[0]));
        }
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const items = Array.from(event.dataTransfer.items);
        const files: File[] = [];
        items.forEach((item) => {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file && file.type.startsWith('image/')) {
                    files.push(file);
                }
            }
        });
        setUploadedImageSrc(URL.createObjectURL(files[0]));
        setIsDragStart(false);
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragStart(true);
    }, []);

    const handleDragStart = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragStart(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragStart(false);
    }, []);

    const handleSetCroppedImage = useCallback(
        (image: File) => {
            const imageUrl = URL.createObjectURL(image);
            setCroppedImage(imageUrl);
            onChange(image);
            setIsHashGenerating(true);
            encodeImageToBlurhash(imageUrl)
                .then(onImageHashGenerated)
                .finally(() => setIsHashGenerating(false));
        },
        [onChange, onImageHashGenerated],
    );

    const mods: Mods = {
        [classes.isLoading]: isLoading,
        [classes.hovered]: isDragStart,
    };

    return (
        <>
            <label
                htmlFor="avatar-uploaded"
                className={classNames(classes.ImageUpload, mods, [className])}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDragEnter={handleDragStart}
            >
                <input
                    id="avatar-uploaded"
                    className="hidden rounded-xl"
                    onChange={handleUploadFile}
                    type="file"
                    accept="image/*"
                    disabled={isLoading}
                />
                {isDragStart && <p className="text-center align-center text-primary">Отпустите!</p>}
                {!isDragStart && !uploadedImageSrc && !croppedImage && (
                    <p className="text-xs text-center align-center text-primary">
                        Выберите или перетащите картинку
                    </p>
                )}
                {croppedImage && (
                    <AnimatePresence mode="wait">
                        <div className="relative">
                            <motion.p
                                initial={{ y: -50, opacity: 0 }}
                                exit={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={cn(
                                    'absolute bottom-3 right-1/2 translate-x-1/2',
                                    'w-4/5 rounded-md py-1 px-2 bg-accent dark:text-black !text-white',
                                    'text-center text-[70%] leading-[100%]',
                                )}
                            >
                                Нажмите для изменения
                            </motion.p>
                            <img
                                className={classes.img}
                                src={croppedImage}
                                alt="Загруженная аватарка"
                            />
                        </div>
                    </AnimatePresence>
                )}
                {isHashGenerating && (
                    <Spinner className="absolute top-1/2 right-1/2 -translate-y-1/2 translate-x-1/2" />
                )}
            </label>

            {uploadedImageSrc && (
                <ImageCropper
                    setCroppedImage={handleSetCroppedImage}
                    inputImageSrc={uploadedImageSrc}
                />
            )}
        </>
    );
};
