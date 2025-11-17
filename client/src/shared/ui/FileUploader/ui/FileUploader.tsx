import { cn } from '@nextui-org/react';
import { ChangeEvent, useCallback, useRef, useState } from 'react';

interface FileUploaderProps {
    className?: string;
    onUpload: (file: File) => void;
}

export const FileUploader = (props: FileUploaderProps) => {
    const { className, onUpload } = props;

    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelectFile = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const { files } = ev.target;
            if (files?.length) {
                onUpload(Array.from(files)[0]);
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            }
        },
        [onUpload],
    );

    const handleDragOver = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
    }, []);

    const handleDragEnter = useCallback(
        (ev: React.DragEvent<HTMLDivElement>) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (!isDragging) {
                setIsDragging(true);
            }
        },
        [isDragging],
    );

    const handleDragLeave = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.currentTarget.contains(ev.relatedTarget as Node)) return;
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (ev: React.DragEvent<HTMLDivElement>) => {
            ev.preventDefault();
            ev.stopPropagation();
            setIsDragging(false);

            const { files } = ev.dataTransfer;
            if (files?.length) {
                onUpload(files[0]);
            }
        },
        [onUpload],
    );

    return (
        <label htmlFor="file-uploader" className={cn(className, 'w-full h-12')}>
            <div
                className={cn(
                    'flex items-center justify-start px-5 bg-input-bg rounded-md cursor-pointer',
                    'hover:bg-input-hover-bg h-full w-full duration-200',
                    isDragging && 'bg-input-hover-bg',
                )}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p>{isDragging ? 'Отпустите файл здесь…' : 'Выберите или перетащите файл'}</p>
            </div>
            <input
                ref={inputRef}
                onChange={handleSelectFile}
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                type="file"
                id="file-uploader"
                className="hidden"
            />
        </label>
    );
};
