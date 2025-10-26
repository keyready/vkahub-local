export interface FileType {
    name: string;
    extension: string[];
    mimeType: string[];
}

export const fileTypeMap: Record<string, FileType> = {
    image: {
        name: 'Image',
        extension: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'],
        mimeType: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'],
    },
    video: {
        name: 'Video',
        extension: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
        mimeType: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
    },
    audio: {
        name: 'Audio',
        extension: ['mp3', 'wav', 'ogg', 'aac'],
        mimeType: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'],
    },
    document: {
        name: 'Document',
        extension: ['pdf', 'docx', 'xlsx', 'pptx', 'txt'],
        mimeType: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
        ],
    },
    archive: {
        name: 'Archive',
        extension: ['zip', 'rar', '7z', 'tar.gz', 'tar.bz2'],
        mimeType: [
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            'application/x-tar',
            'application/gzip',
        ],
    },
    unknown: {
        name: 'Unknown',
        extension: [],
        mimeType: [],
    },
};
