import api from "./Api";
import { Promotion } from "../models/PromotionsModel";

export interface PromotionFilterParams {
  id_repas?: number | string;
  id_categorie?: number | string;
  is_actif?: number | string;
}

export const PromotionService = {
  /**
   * Récupère la liste des promotions (avec filtres optionnels)
   * Exemple : PromotionService.getAll({ is_actif: 1 })
   */
  getAll: async (params?: PromotionFilterParams) => {
    try {
      const response = await api.get("/promotions", { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des promotions :", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle promotion (Événement globale ou ciblée)
   * Envoie l'objet contenant le type, les dates et le 'new_amount' calculé
   */
  create: async (data: Partial<Promotion>) => {
    try {
      const response = await api.post("/promotions", data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la promotion :", error);
      throw error;
    }
  },

  /**
   * Met à jour une promotion existante
   */
  update: async (id: number, data: Partial<Promotion>) => {
    try {
      const response = await api.put(`/promotions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la promotion #${id} :`, error);
      throw error;
    }
  },

  /**
   * Supprime définitivement une promotion
   */
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/promotions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la promotion #${id} :`, error);
      throw error;
    }
  },

  /**
   * Active ou désactive un événement de promotion (Toggle)
   */
  toggleStatus: async (id: number) => {
    try {
      const response = await api.patch(`/promotions/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du basculement de statut de la promotion #${id} :`, error);
      throw error;
    }
  }
};
