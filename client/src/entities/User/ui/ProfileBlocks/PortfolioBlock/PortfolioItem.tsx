import { cn, Image } from '@nextui-org/react';
import { RiDeleteBin2Line, RiDownload2Line, RiFilePdf2Line } from '@remixicon/react';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import { PortfolioFile } from '../../../model/types/User';
import { getUserDataService } from '../../../model/services/profileServices/getUserData';
import { deletePortfolioFile } from '../../../model/services/profileServices/deletePortfolioFile';

import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';

interface PortfolioItemProps {
    file: PortfolioFile;
    index: number;
    size?: 'lg' | 'sm';
    showDeleteButton?: boolean;
}

export const PortfolioItem = ({
    showDeleteButton = false,
    file,
    index,
    size = 'lg',
}: PortfolioItemProps) => {
    const dispatch = useAppDispatch();

    const getSizes = useMemo(() => {
        switch (size) {
            case 'lg':
                return 'w-[200px] h-[355px]';
            default:
                return 'w-[100px] h-[177px]';
        }
    }, [size]);

    const handleDownloadClick = useCallback(() => {
        const link = document.createElement('a');
        link.href = file.url.split('/app')[1];
        link.download = file.name;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [file.name, file.url]);

    const handleDeleteClick = useCallback(async () => {
        await toastDispatch(dispatch(deletePortfolioFile(file.name)), {
            success: 'Сертификат удален!',
            loading: 'Подчищаем следы...',
            error: 'Не удалось удалить сертификат',
        });
        await dispatch(getUserDataService());
    }, [dispatch, file.name]);

    const renderCertificateBg = useMemo(() => {
        switch (file.place) {
            case '1st':
                return 'bg-gold/30';
            case '2nd':
                return 'bg-silver/30';
            case '3rd':
                return 'bg-bronze/30';
            default:
                return '';
        }
    }, [file.place]);

    const renderDownloadButton = useMemo(
        () => (
            <motion.button
                type="button"
                onClick={handleDownloadClick}
                initial={{ width: 36 }}
                whileHover={{ width: size === 'lg' ? 100 : 36 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    'h-9 px-2 flex items-center gap-2',
                    'rounded-l-xl rounded-r-none',
                    'overflow-hidden hover:bg-input-hover-bg bg-input-bg dark:text-white',
                    'group-hover:opacity-100 transition-opacity duration-200 opacity-0 cursor-pointer',
                )}
            >
                <RiDownload2Line className="flex-[1_0_auto]" size={20} />
                <span className="whitespace-nowrap text-sm">Скачать</span>
            </motion.button>
        ),
        [handleDownloadClick, size],
    );

    const renderDeleteButton = useMemo(
        () => (
            <motion.button
                type="button"
                onClick={handleDeleteClick}
                initial={{ width: 36 }}
                whileHover={{ width: size === 'lg' ? 100 : 36 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    'h-9 px-2 flex items-center gap-2',
                    'bg-danger hover:danger-400 rounded-r-xl rounded-l-none',
                    'overflow-hidden text-white',
                    'group-hover:opacity-100 transition-opacity duration-200 opacity-0 cursor-pointer',
                )}
            >
                <RiDeleteBin2Line className="flex-[1_0_auto]" size={20} />
                <span className="whitespace-nowrap text-sm">Удалить</span>
            </motion.button>
        ),
        [handleDeleteClick, size],
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            key={index}
            className={cn(
                'flex flex-col items-center gap-2',
                size === 'lg' ? 'w-[200px]' : 'w-[100px]',
            )}
        >
            <p
                className={cn(
                    renderCertificateBg,
                    size === 'lg' ? 'text-l p-3 h-[60px]' : 'text-s p-1.5 h-[40px]',
                    'flex items-center text-center justify-center',
                    'line-clamp-2 rounded-md w-full',
                )}
            >
                {file.eventName}
            </p>

            {file.type === 'img' ? (
                <div className={cn('group relative', getSizes)}>
                    <Image
                        src={file.url.split('/app')[1]}
                        width={size === 'lg' ? 200 : 100}
                        height={size === 'lg' ? 355 : 177}
                    />
                    <div className="flex items-center absolute z-50 top-1 right-1">
                        {renderDownloadButton}
                        {showDeleteButton && renderDeleteButton}
                    </div>
                </div>
            ) : (
                <div
                    className={cn(
                        'group relative flex items-center justify-center',
                        'outline outline-accent outline-2 rounded-md',
                        getSizes,
                    )}
                >
                    <RiFilePdf2Line size={128} />
                    <div className="flex items-center absolute z-50 top-1 right-1">
                        {renderDownloadButton}
                        {showDeleteButton && renderDeleteButton}
                    </div>
                </div>
            )}

            <p
                className={cn(
                    'truncate text-center',
                    size === 'lg' ? 'text-l w-[200px]' : 'text-s w-[100px]',
                )}
            >
                {file.name}
            </p>
        </motion.div>
    );
};
