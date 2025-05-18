/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add other VITE_... vars here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
