// src/models/CategorieModel.ts
/**
 * Interface représentant une Catégorie (AfricaFood)
 * Basée sur la migration CreateCategoriesTable
 */
export interface Categorie {
  id: number;
  libelle: string;
  description: string | null; // Nullable car 'null' => true dans la migration
  icone: string | null;       // Nullable car 'null' => true dans la migration
  
  // Timestamps générés par CodeIgniter
  created_at?: string;
  updated_at?: string;

  // Optionnel : Nombre de repas si tu utilises withRepasCount()
  nb_repas?: number;
}

/**
 * Structure de la réponse pour la liste paginée
 */
export interface CategorieResponse {
  status: boolean;
  categories: Categorie[];
  pager: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * Structure pour une réponse d'objet unique
 */
export interface SingleCategorieResponse {
  status: boolean;
  data: Categorie;
}