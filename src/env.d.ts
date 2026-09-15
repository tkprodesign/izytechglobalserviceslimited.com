// Shared environment typing for the SPA. Under Next.js, import.meta.env is
// a plain object: VITE_API_URL is injected at build time when the public env
// var NEXT_PUBLIC_VITE_API_URL is set; the rest are framework placeholders.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly BASE_URL?: string;
  readonly MODE?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
