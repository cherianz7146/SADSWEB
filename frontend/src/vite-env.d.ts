/// <reference types="vite/client" />

// Minimal google typings to satisfy TS where the script loads at runtime
declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (options: { client_id: string; callback: (resp: any) => void; [key: string]: any }) => void;
          prompt: (cb?: (notification: any) => void) => void;
          renderButton?: (parent: HTMLElement, options?: Record<string, any>) => void;
        };
      };
    };
  }
}

export {};
