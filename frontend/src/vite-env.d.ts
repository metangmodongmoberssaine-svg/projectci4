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

// Permet d'importer n'importe quel fichier CSS comme module
declare module '*.css' {
  const content: string;
  export default content;
}

// Spécifique à AOS (si besoin)
declare module 'aos/dist/aos.css';