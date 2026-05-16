import api from "./Api";
import { PanierResponse } from "../models/PanierModel";

class PanierService {
    /**
     * Récupère le panier de l'utilisateur connecté avec pagination
     * @param page Numéro de la page (défaut: 1)
     * @param perPage Nombre d'éléments par page (défaut: 5)
     */
    async getPanier(page: number = 1, perPage: number = 5): Promise<PanierResponse> {
        // Retrait du premier slash pour laisser le baseURL gérer la jointure proprement
        const response = await api.get<PanierResponse>(`panier?page=${page}&per_page=${perPage}`);
        return response.data;
    }

    /**
     * Ajoute un repas au panier (ou incrémente sa quantité si déjà présent)
     * @param id_repas ID du repas à ajouter
     * @param quantite Quantité à ajouter (défaut: 1)
     */
    async addToCart(id_repas: number, quantite: number = 1): Promise<{ status: boolean; message: string }> {
        const response = await api.post<{ status: boolean; message: string }>('panier/add', {
            id_repas,
            quantite
        });
        return response.data;
    }

    /**
     * Modifie la quantité d'un élément spécifique du panier
     * @param itemId ID de la ligne du panier (panier_repas)
     * @param quantite Nouvelle quantité absolue (doit être >= 1)
     */
    async updateQuantity(itemId: number, quantite: number): Promise<{ status: boolean; message: string }> {
        const response = await api.put<{ status: boolean; message: string }>(`panier/item/${itemId}`, {
            quantite
        });
        return response.data;
    }

    /**
     * Retire un élément spécifique du panier
     * @param itemId ID de la ligne du panier (panier_repas)
     */
    async removeFromCart(itemId: number): Promise<{ status: boolean; message: string }> {
        const response = await api.delete<{ status: boolean; message: string }>(`panier/item/${itemId}`);
        return response.data;
    }

    /**
     * Vide entièrement le panier de l'utilisateur
     */
    async clearCart(): Promise<{ status: boolean; message: string }> {
        const response = await api.delete<{ status: boolean; message: string }>('panier/clear');
        return response.data;
    }
}

export default new PanierService();