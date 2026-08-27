/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOTCARD_API_URL?: string;
  readonly VITE_AUTHFORGE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
