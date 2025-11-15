import {
    Button,
    cn,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
} from '@nextui-org/react';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { getUserData, getUserIsLoading } from '../../../model/selectors/UserSelectors';
import { addPortfolioFile } from '../../../model/services/profileServices/addPortfolioFile';
import { getUserDataService } from '../../../model/services/profileServices/getUserData';
import { type EventPlace, eventPlace, type PortfolioFile } from '../../../model/types/User';

import { PortfolioItem } from './PortfolioItem';

import { VStack } from '@/shared/ui/Stack';
import { FileUploader } from '@/shared/ui/FileUploader';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { formatBytes } from '@/shared/lib/formatBytes';

interface PortfolioBlockProps {
    className?: string;
}

export const PortfolioBlock = (props: PortfolioBlockProps) => {
    const { className } = props;

    const [uploadedFile, setUploadedFile] = useState<File>();
    const [uploadedFileParams, setUploadedFileParams] = useState<Partial<PortfolioFile>>({});
    const [isCertificateModalOpened, setIsCertificateModalOpened] = useState<boolean>(false);

    const portfolioFiles = useSelector(getUserData)?.portfolio;
    const isUserLoading = useSelector(getUserIsLoading);

    useEffect(() => {
        console.log(portfolioFiles);
        
    }, [portfolioFiles])

    const dispatch = useAppDispatch();

    const isFormValid = useMemo(
        () => uploadedFileParams?.eventName && uploadedFileParams.place,
        [uploadedFileParams?.eventName, uploadedFileParams.place],
    );

    const handleFileUpload = useCallback(async (file: File) => {
        setIsCertificateModalOpened(true);
        setUploadedFile(file);
    }, []);

    const confirmUploading = useCallback(async () => {
        if (!isFormValid) {
            toast.error('Заполнены не все поля или не выбран файл');
            return;
        }

        const formData = new FormData();
        formData.append('certificates', uploadedFile as Blob);
        formData.append('eventName', uploadedFileParams?.eventName || '');
        formData.append('place', uploadedFileParams?.place || '');

        const res = await toastDispatch(dispatch(addPortfolioFile(formData)), {
            error: 'Не получилось добавить файл',
            loading: 'В процессе...',
            success: 'Файл успешно добавлен!',
        });
        await dispatch(getUserDataService());

        if (res.meta.requestStatus === 'fulfilled') {
            setIsCertificateModalOpened(false);
            setUploadedFileParams({});
        }
    }, [
        dispatch,
        isFormValid,
        uploadedFile,
        uploadedFileParams.eventName,
        uploadedFileParams.place,
    ]);

    return (
        <div className={cn('', className)}>
            <VStack gap="24px" maxW>
                <VStack maxW gap="0px">
                    <h1 className="text-primary text-l font-bold">Ваше порфтолио</h1>
                    <p className="italic">
                        Добавьте сюда сканы или фото грамот и серфикатов после участия в
                        соревнованиях
                    </p>
                </VStack>

                <FileUploader onUpload={handleFileUpload} />

                <AnimatePresence mode="wait">
                    {portfolioFiles?.length ? (
                        <>
                            <Divider className="w-full" />
                            <div className="flex flex-wrap items-start gap-3">
                                {portfolioFiles.map((file, index) => (
                                    <PortfolioItem file={file} index={index} key={index} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="italic">Вы пока ничего не добавили</p>
                    )}
                </AnimatePresence>
            </VStack>

            <Modal
                isOpen={isCertificateModalOpened}
                onClose={() => setIsCertificateModalOpened(false)}
                size="3xl"
            >
                <ModalContent>
                    <ModalHeader>
                        <h2 className="dark:text-white text-black">Загрузка сертификата</h2>
                    </ModalHeader>
                    <ModalBody>
                        <div
                            className={cn(
                                'flex w-full h-full justify-between',
                                'px-4 py-3 bg-input-bg rounded-xl dark:text-white/60',
                            )}
                        >
                            <p className="w-7/8 truncate">{uploadedFile?.name}</p>
                            <p className="w-1/8">{formatBytes(uploadedFile?.size)}</p>
                        </div>
                        <Input
                            value={uploadedFileParams.eventName}
                            onValueChange={(v) =>
                                setUploadedFileParams((ps) => ({
                                    ...ps,
                                    eventName: v,
                                }))
                            }
                            label="Название соревнования"
                            isRequired
                        />
                        <Select
                            value={uploadedFileParams.place}
                            onSelectionChange={(ss) =>
                                setUploadedFileParams((ps) => ({
                                    ...ps,
                                    place: ss.currentKey as EventPlace,
                                }))
                            }
                            listboxProps={{
                                itemClasses: {
                                    base: 'dark:text-white data-[hover=true]:text-foreground',
                                },
                            }}
                            isRequired
                            label="Результат участия"
                            items={eventPlace}
                            startContent={
                                uploadedFileParams.place ? (
                                    <div
                                        className={cn(
                                            'w-4 h-4 rounded-md',
                                            uploadedFileParams.place === '1st' && 'bg-gold',
                                            uploadedFileParams.place === '2nd' && 'bg-silver',
                                            uploadedFileParams.place === '3rd' && 'bg-bronze',
                                            uploadedFileParams.place === 'participant' &&
                                                'bg-amber-900',
                                        )}
                                    />
                                ) : null
                            }
                        >
                            {(place) => (
                                <SelectItem
                                    startContent={
                                        <div
                                            className={cn(
                                                'w-4 h-4 rounded-md',
                                                place.key === '1st' && 'bg-gold',
                                                place.key === '2nd' && 'bg-silver',
                                                place.key === '3rd' && 'bg-bronze',
                                                place.key === 'participant' && 'bg-amber-900',
                                            )}
                                        />
                                    }
                                    key={place.key}
                                >
                                    {place.label}
                                </SelectItem>
                            )}
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            isLoading={isUserLoading}
                            className="bg-accent hover:bg-accent/60 text-white"
                            onPress={confirmUploading}
                            isDisabled={!isFormValid}
                        >
                            Загрузить
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};
