import { encode } from 'blurhash';

const loadImage = async (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (...args) => reject(args);
        img.src = src;
    });

const getImageData = (image: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height);
    }
    return undefined;
};

export const encodeImageToBlurhash = async (imageUrl: string, x?: number, y?: number) => {
    const image = await loadImage(imageUrl);
    if (!image) return '';

    const imageData = getImageData(image);
    if (imageData) {
        return encode(imageData.data, imageData.width, imageData.height, x || 4, y || 4);
    }
    return '';
};
