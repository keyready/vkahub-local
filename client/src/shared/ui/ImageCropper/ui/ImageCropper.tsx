import { CircleStencil, Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import toast from 'react-hot-toast';

interface ImageCropperProps {
    inputImageSrc: string;
    setCroppedImage: (src: File) => void;
}

export const ImageCropper = (props: ImageCropperProps) => {
    const { inputImageSrc, setCroppedImage } = props;

    const cropperRef = useRef<CropperRef>(null);

    const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

    useEffect(() => {
        if (new File([inputImageSrc], 'file').size > 1024 * 3) {
            toast.error('Выберите файл меньше 3мб');
            return;
        }
        setIsModalOpened(Boolean(inputImageSrc));
    }, [inputImageSrc]);

    const onCrop = useCallback(() => {
        if (cropperRef.current) {
            const canvas = cropperRef.current.getCanvas();
            if (canvas) {
                setIsModalOpened(false);
                canvas.toBlob((blob) => {
                    if (!blob) return undefined;
                    const filetype = blob.type.split('image/')[1];
                    return setCroppedImage(new File([blob], `cropped-uploaded-image.${filetype}`));
                });
            }
        }
    }, [setCroppedImage]);

    return (
        <Modal isOpen={isModalOpened}>
            <ModalContent>
                <ModalBody className="py-7 bg-grad-end">
                    <Cropper
                        stencilProps={{
                            aspectRatio: 1,
                        }}
                        ref={cropperRef}
                        stencilComponent={CircleStencil}
                        src={inputImageSrc}
                        className="cropper rounded-2xl"
                    />
                    <Button className="bg-accent dark:text-black text-white" onPress={onCrop}>
                        Сохранить
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
