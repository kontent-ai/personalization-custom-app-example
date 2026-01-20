/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KONTENT_ENVIRONMENT_ID: string;
  readonly VITE_KONTENT_PREVIEW_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
