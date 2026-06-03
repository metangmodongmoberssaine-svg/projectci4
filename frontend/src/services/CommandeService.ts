import api from "./Api";
import { Commande } from "../models/CommandeModel";

// Structure de la réponse pour la liste paginée des commandes
export interface CommandeListResponse {
    status: boolean;
    data: Commande[];
    pagination: {
        current_page: number;
        per_page: number;
        total_items: number;
        total_pages: number;
    };
}

// Structure de la réponse pour le détail d'une seule commande
export interface CommandeDetailResponse {
    status: boolean;
    data: Commande;
}

// Structure attendue par le backend pour créer une commande
export interface CreateCommandeInput {
    adresse: string;
    code_promo?: string; // Optionnel
}

// Structure de la réponse renvoyée après la création de commande (Succès Campay)
export interface CreateCommandeResponse {
    status: boolean;
    message: string;
    commande_id: number;
    reference: string;
    checkout?: {
        telephone: string;
        operateur: 'mtn_money' | 'orange_money';
        montant: number;
    };
}

// Structure de base pour les réponses simples (annulation, mise à jour)
export interface SimpleResponse {
    status: boolean;
    message: string;
}

class CommandeService {
    /**
     * Récupérer l'historique paginé des commandes du client connecté
     * GET /api/commandes?page=1&per_page=10
     */
    async getHistory(page: number = 1, perPage: number = 10): Promise<CommandeListResponse> {
        const response = await api.get<CommandeListResponse>('/commandes', {
            params: { page, per_page: perPage }
        });
        return response.data;
    }

    /**
     * Récupérer les détails d'une commande spécifique (avec ses repas)
     * GET /api/commandes/{id}
     */
    async getDetail(id: number): Promise<CommandeDetailResponse> {
        const response = await api.get<CommandeDetailResponse>(`/commandes/${id}`);
        return response.data;
    }

    /**
     * Créer une commande et déclencher le push de paiement Campay
     * POST /api/commandes
     */
    async create(input: CreateCommandeInput): Promise<CreateCommandeResponse> {
        const response = await api.post<CreateCommandeResponse>('/commandes', input);
        return response.data;
    }

    /**
     * Annuler une commande en attente (Action du client)
     * POST /api/commandes/{id}/annuler
     */
    async annuler(id: number): Promise<SimpleResponse> {
        const response = await api.post<SimpleResponse>(`/commandes/${id}/annuler`);
        return response.data;
    }

    /**
     * Changer le statut d'une commande (Action de l'administrateur / Livreur)
     * PATCH /api/commandes/{id}/statut
     */
    async changerStatut(id: number, status: string): Promise<SimpleResponse> {
        const response = await api.patch<SimpleResponse>(`/commandes/${id}/statut`, { status });
        return response.data;
    }
}

export default new CommandeService();