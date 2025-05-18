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
    gapi: {
      load(api: string, callback: () => void): void;
      auth2: { init(opts: { client_id: string }): Promise<any> };
      signin2: {
        render(
          elementId: string,
          opts: {
            scope: string;
            width: number;
            height: number;
            longtitle: boolean;
            theme: string;
            onsuccess: (user: any) => void;
          }
        ): void;
      };
    };
    onSignIn: (googleUser: any) => void;
  }

  namespace gapi {
    namespace auth2 {
      type GoogleUser = any;
    }
  }
}

export {};