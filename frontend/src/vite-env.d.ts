/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add other VITE_... vars here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// --- Add these at the bottom of vite-env.d.ts ---
declare global {
  interface Window {
    gapi: any,
    onSignIn: (googleUser: any) => void;
  }

  namespace gapi {
    namespace auth2 {
      type GoogleUser = any;
    }
  }
}

export {};