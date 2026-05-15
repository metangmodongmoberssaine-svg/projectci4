/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Ajoute ici tes autres variables si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

/// <reference types="vite/client" />