// src/services/CategorieService.ts
import api from "./Api";
import { Categorie, CategorieResponse, SingleCategorieResponse } from "../models/CategorieModel";

/**
 * Service pour la gestion des catégories d'AfricaFood
 */
const CategorieService = {
  
  /**
   * Récupère la liste paginée des catégories
   * @param page Numéro de la page à récupérer
   * @param perPage Nombre d'éléments par page
   */
  getAll: async (page: number = 1, perPage: number = 10): Promise<CategorieResponse> => {
    const response = await api.get<CategorieResponse>(`/categories`, {
      params: { 
        page, 
        per_page: perPage 
      }
    });
    return response.data;
  },

  /**
   * Récupère les détails d'une seule catégorie
   * @param id ID de la catégorie
   */
  getById: async (id: number): Promise<SingleCategorieResponse> => {
    const response = await api.get<SingleCategorieResponse>(`/categories/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle catégorie [Admin]
   * @param data Libellé et description
   */
  create: async (data: Partial<Categorie>): Promise<SingleCategorieResponse> => {
    const response = await api.post<SingleCategorieResponse>(`/categories`, data);
    return response.data;
  },

  /**
   * Met à jour une catégorie existante [Admin]
   * @param id ID de la catégorie
   * @param data Données à modifier
   */
  update: async (id: number, data: Partial<Categorie>): Promise<SingleCategorieResponse> => {
    const response = await api.put<SingleCategorieResponse>(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une catégorie [Admin]
   * @param id ID de la catégorie
   */
  delete: async (id: number): Promise<{ status: boolean; message: string }> => {
    const response = await api.delete<{ status: boolean; message: string }>(`/categories/${id}`);
    return response.data;
  }
};

export default CategorieService;