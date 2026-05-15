import { Repas } from "../models/RepasModel";
import api from "./Api";

// Interface standard pour les réponses API globales de ton projet
export interface ApiResponse<T> {
  status: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export const RepasService = {
  /**
   * Récupère la liste des repas avec calcul dynamique des promotions [Client]
   * Retourne les prix normaux barrés et les nouveaux prix recalculés si une offre est active.
   * Peut être filtrée par l'ID d'une catégorie (?categorie=X)
   */
  getClientAll: async (idCategorie?: number): Promise<ApiResponse<Repas[]>> => {
    const url = idCategorie ? `/repas/client?categorie=${idCategorie}` : "/repas/client";
    const response = await api.get<ApiResponse<Repas[]>>(url);
    return response.data;
  },

  /**
   * Récupère la liste brute de tous les repas disponibles [Admin / Interne]
   * Peut être filtrée par l'ID d'une catégorie (?categorie=X)
   */
  getAll: async (idCategorie?: number): Promise<ApiResponse<Repas[]>> => {
    const url = idCategorie ? `/repas?categorie=${idCategorie}` : "/repas";
    const response = await api.get<ApiResponse<Repas[]>>(url);
    return response.data;
  },

  /**
   * Récupère les détails d'un repas spécifique (incluant ses avis et sa note moyenne)
   */
  getById: async (id: number): Promise<ApiResponse<Repas>> => {
    const response = await api.get<ApiResponse<Repas>>(`/repas/${id}`);
    return response.data;
  },

  /**
   * Crée un repas [Admin]
   * Utilise FormData pour supporter le téléversement de la photo
   */
  create: async (formData: FormData): Promise<ApiResponse<{ id: number }>> => {
    const response = await api.post<ApiResponse<{ id: number }>>("/repas", formData, {
      headers: {
        // Obligatoire pour écraser le 'application/json' par défaut de l'instance d'origine
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Met à jour un repas existant [Admin]
   * Point de vigilance : On ajoute '_method' avec la valeur 'PUT' dans le FormData.
   * Axios envoie en POST (ce qui permet l'upload de fichiers) et CodeIgniter l'intercepte 
   * comme un PUT grâce à la réécriture à la volée.
   */
  update: async (id: number, formData: FormData): Promise<ApiResponse<null>> => {
    // On s'assure que le spoofing de méthode est bien présent dans le FormData
    if (!formData.has("_method")) {
      formData.append("_method", "PUT");
    }

    const response = await api.post<ApiResponse<null>>(`/repas/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Supprime un repas [Admin]
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/repas/${id}`);
    return response.data;
  },

  /**
   * Bascule le statut d'un repas entre disponible et indisponible [Admin]
   */
  toggleStatus: async (id: number): Promise<ApiResponse<{ nouveau_status: string }>> => {
    const response = await api.patch<ApiResponse<{ nouveau_status: string }>>(`/repas/${id}/status`);
    return response.data;
  },
};