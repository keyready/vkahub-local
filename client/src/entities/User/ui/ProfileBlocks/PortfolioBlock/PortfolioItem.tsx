import { cn, Image } from '@nextui-org/react';
import { RiDownload2Line, RiFilePdf2Line } from '@remixicon/react';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import { PortfolioFile } from '../../../model/types/User';

interface PortfolioItemProps {
    file: PortfolioFile;
    index: number;
}

export const PortfolioItem = ({ file, index }: PortfolioItemProps) => {
    const handleDownloadClick = useCallback(() => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [file.name, file.url]);

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
                whileHover={{ width: 100 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    'absolute top-5 right-5 h-9 px-2 flex items-center gap-2',
                    'overflow-hidden rounded-md hover:bg-input-hover-bg bg-input-bg text-white',
                    'group-hover:opacity-100 transition-opacity duration-200 opacity-0 cursor-pointer',
                )}
            >
                <RiDownload2Line className="flex-[1_0_auto]" size={20} />
                <span className="whitespace-nowrap text-sm">Скачать</span>
            </motion.button>
        ),
        [handleDownloadClick],
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            key={index}
            className={cn('w-[200px] flex flex-col items-center gap-2')}
        >
            <p className={cn(renderCertificateBg, 'text-l text-center p-3 rounded-md ')}>
                {file.eventName}
            </p>
            {file.type === 'img' ? (
                <div className="group relative w-[200px] h-[355px]">
                    <Image src={file.url} width={200} height={325} />
                    {renderDownloadButton}
                </div>
            ) : (
                <div
                    className={cn(
                        'group relative w-[200px] h-[355px] flex items-center justify-center',
                        'outline outline-accent outline-2 rounded-md',
                    )}
                >
                    <RiFilePdf2Line size={128} />
                    {renderDownloadButton}
                </div>
            )}

            <p className="truncate">{file.name}</p>
        </motion.div>
    );
};
