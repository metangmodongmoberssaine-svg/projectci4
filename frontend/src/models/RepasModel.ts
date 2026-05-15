// models/RepasModel.ts
export interface Repas {
  id?: number;              // Optionnel car absent lors de la création d'un repas
  id_categorie: number;
  nom: string;
  description?: string | null; // Facultatif, peut être null en base de données
  prix: number | string;    // Souvent reçu sous forme de string depuis MySQL (Decimal)
  quantite: number;
  photo?: string | null;    // Contient le chemin relatif (ex: 'uploads/repas/nom.jpg') ou null
  status: 'disponible' | 'indisponible';
  categorie?: string;       // Libellé de la catégorie ajouté via la jointure SQL (getDisponibles)
  created_at?: string | null;
  updated_at?: string | null;
}

// Interface utile si tu gères l'envoi de données via un FormData (Création/Modification)
export interface RepasFormData {
  nom: string;
  prix: string;
  id_categorie: string;
  quantite: string;
  description?: string;
  photo?: File | null;      // Reçoit l'objet File issu du <input type="file" />
}