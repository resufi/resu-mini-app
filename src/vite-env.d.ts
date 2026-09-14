/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NETWORK?: 'testnet' | 'mainnet';
    readonly VITE_TON_ENDPOINT?: string;
    readonly VITE_TONCENTER_API_KEY?: string;
    readonly VITE_TONCONNECT_MANIFEST_URL?: string;
    readonly VITE_TWA_RETURN_URL?: string;
    readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const __RESU_ENV__: Record<string, string | undefined> | undefined;
