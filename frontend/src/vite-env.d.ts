/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add other VITE_... vars here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

declare namespace gapi {
  namespace auth2 {
    interface GoogleUser {
      getBasicProfile(): any;
      getAuthResponse(): { id_token: string };
    }
    interface GoogleAuth {
      signIn(): Promise<GoogleUser>;
      getAuthInstance(): GoogleAuth;
      currentUser: { get(): GoogleUser };
    }
  }

  function load(lib: "auth2", callback: () => void): void;
}

declare global {
  interface Window {
    gapi: typeof gapi;
    onSignIn: (googleUser: gapi.auth2.GoogleUser) => void;
  }
}

export {};