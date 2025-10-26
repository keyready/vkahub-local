import { ChangeEvent, useCallback, useMemo } from 'react';
import { RiFileImageLine, RiFileVideoLine } from '@remixicon/react';
import { cn } from '@nextui-org/react';

import classes from './MultiplyFilesInput.module.scss';

import { HStack, VStack } from '@/shared/ui/Stack';

interface MultiplyFilesInputProps {
    className?: string;
    placeholder?: string;
    onChange: (files: File[]) => void;
    files: File[];
    isDisabled?: boolean;
}

export const MultiplyFilesInput = (props: MultiplyFilesInputProps) => {
    const { className, placeholder, isDisabled, onChange, files } = props;

    const handleFilesChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) {
                onChange(Array.from(event.target.files));
            }
        },
        [onChange],
    );

    const calculateFileSize = useMemo(() => {
        const bytes = files.reduce((total, file) => total + file.size, 0);
        const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
        let index = Math.floor(Math.log(bytes) / Math.log(1024));

        let value = bytes / 1024 ** index;

        value = Math.round(value);

        if (value === 1024 && index < units.length - 1) {
            value = 1;
            index += 1;
        }

        return `${value} ${units[index]}`;
    }, [files]);

    return (
        <label
            htmlFor="files-input"
            className={cn(
                classes.MultiplyFilesInput,
                'bg-input-bg hover:bg-input-hover-bg',
                className,
            )}
        >
            {files.length ? (
                <VStack maxW align="center">
                    <HStack justify="center" maxW className="flex-wrap">
                        {files.slice(0, 10).map((file, index) => {
                            if (file.type.includes('image')) {
                                return (
                                    <RiFileImageLine
                                        size={48}
                                        className="text-zinc-400"
                                        key={index}
                                    />
                                );
                            }

                            return (
                                <RiFileVideoLine size={48} className="text-zinc-400" key={index} />
                            );
                        })}
                        {files.length > 10 ? <p className="text-2xl text-zinc-400">...</p> : null}
                    </HStack>
                    <p className="text-zinc-400">Размер вложений: {calculateFileSize}</p>
                </VStack>
            ) : (
                <h1 className="text-zinc-400">
                    {placeholder || 'Прикрепите файлы'} <span className="text-red-500">*</span>
                </h1>
            )}
            <input
                disabled={isDisabled}
                onChange={handleFilesChange}
                accept="video/*, image/*"
                className="hidden"
                type="file"
                id="files-input"
                multiple
            />
        </label>
    );
};
