import { JSEncrypt } from 'jsencrypt';

export const encrypt = (message: string): string => {
    const encrypt = new JSEncrypt();

    encrypt.setPublicKey(import.meta.env.VITE_PASSWORD_PUBKEY);

    const hash = encrypt.encrypt(message);

    if (typeof hash === 'string') return hash;
    return '';
};

export const decrypt = (hash: string): string => {
    const decrypt = new JSEncrypt();

    decrypt.setPrivateKey(import.meta.env.VITE_PASSWORD_PRIVKEY);

    const msg = decrypt.decrypt(hash);

    if (typeof msg === 'string') return msg;
    return 'Не удалось расшифровать сообщение';
};
