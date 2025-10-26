/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MINIO_ENDPOINT: string;
    readonly VITE_PASSWORD_PUBKEY: string;
    readonly VITE_PASSWORD_PRIVKEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}