/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Ajoute ici tes autres variables si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}