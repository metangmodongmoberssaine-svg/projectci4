import { User } from "../models/UserModel";
import api from "./Api";

/**
 * Interface pour la structure de réponse paginée du backend
 */
export interface LivreurPaginationResponse {
    status: boolean;
    data: User[];
    pager: {
        currentPage: number;
        pageCount: number;
        perPage: number;
        total: number;
    };
    total: number;
}

const LivreurService = {
    /**
     * Récupère la liste des livreurs avec recherche et filtres
     * @param page Numéro de la page
     * @param search Terme de recherche (nom, prenom, tel)
     * @param status Filtre par statut (1 pour actif, 0 pour inactif)
     */
    getAllLivreurs: async (page: number = 1, search: string = '', status?: number): Promise<LivreurPaginationResponse> => {
        const params: any = { page };
        if (search) params.search = search;
        if (status !== undefined) params.status = status;

        const response = await api.get('/livreurs', { params });
        return response.data;
    },

    /**
     * Récupère un livreur par son ID
     */
    getLivreurById: async (id: number): Promise<{ status: boolean, data: User }> => {
        const response = await api.get(`/livreurs/${id}`);
        return response.data;
    },

    /**
     * Crée un nouveau livreur
     * Le backend s'occupe de générer le code à 5 chiffres et d'envoyer le mail
     */
    createLivreur: async (livreurData: Partial<User>): Promise<{ status: boolean, message: string, email: string }> => {
        const response = await api.post('/livreurs', livreurData);
        return response.data;
    },

    /**
     * Met à jour les informations d'un livreur
     */
    updateLivreur: async (id: number, updateData: Partial<User>): Promise<{ status: boolean, message: string }> => {
        const response = await api.put(`/livreurs/${id}`, updateData);
        return response.data;
    },

    /**
     * Supprime un livreur
     */
    deleteLivreur: async (id: number): Promise<{ status: boolean, message: string }> => {
        const response = await api.delete(`/livreurs/${id}`);
        return response.data;
    },

    /**
     * Active ou désactive un livreur (Helper rapide utilisant l'update)
     */
    toggleStatus: async (id: number, isActif: boolean): Promise<{ status: boolean, message: string }> => {
        const response = await api.put(`/livreurs/${id}`, { is_actif: isActif ? 1 : 0 });
        return response.data;
    }
};

export default LivreurService;