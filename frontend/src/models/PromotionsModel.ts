import { Repas } from './RepasModel';
import { Categorie } from './CategorieModel';

export type PromotionType = 'pourcentage' | 'montant_fixe';

export interface Promotion {
  id: number;
  id_repas: number | null;
  id_categorie: number | null;
  type: PromotionType;
  new_amount: number; // Reçoit le nouveau montant final calculé ou saisi en FCFA
  date_debut: string; // format YYYY-MM-DD
  date_fin: string;   // format YYYY-MM-DD
  is_actif: number;   // 0 ou 1 (booleen SQL)
  created_at?: string;
  updated_at?: string;
  
  // Ces champs sont remplis par le backend via les JOIN dans le Controller
  repas_nom?: string;
  categorie_nom?: string;
}