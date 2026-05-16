import { User } from "../models/UserModel";
import api from "./Api";

/**
 * Interface pour la structure de réponse paginée du backend CodeIgniter
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
     * Récupère la liste des livreurs avec recherche et filtres de statut
     * @param page Numéro de la page à charger
     * @param search Terme de recherche (nom, prenom, tel)
     * @param status Filtre par statut (1 pour actif, 0 pour inactif)
     */
    getAllLivreurs: async (page: number = 1, search: string = '', status?: number): Promise<LivreurPaginationResponse> => {
        // Construction dynamique des query parameters pour correspondre aux attentes de CodeIgniter
        const params: Record<string, any> = { page };
        
        if (search.trim()) {
            params.search = search.trim();
        }
        
        if (status !== undefined) {
            params.status = status;
        }

        const response = await api.get<LivreurPaginationResponse>('/livreurs', { params });
        return response.data;
    },

    /**
     * Récupère un livreur spécifique par son identifiant unique
     */
    getLivreurById: async (id: number): Promise<{ status: boolean, data: User }> => {
        const response = await api.get<{ status: boolean, data: User }>(`/livreurs/${id}`);
        return response.data;
    },

    /**
     * Crée un nouveau livreur
     * Le backend génère automatiquement ses identifiants temporaires et gère l'envoi du mail d'accès
     */
    createLivreur: async (livreurData: Partial<User>): Promise<{ status: boolean, message: string, email: string }> => {
        const response = await api.post<{ status: boolean, message: string, email: string }>('/livreurs', livreurData);
        return response.data;
    },

    /**
     * Met à jour les informations de profil d'un livreur existant
     */
    updateLivreur: async (id: number, updateData: Partial<User>): Promise<{ status: boolean, message: string }> => {
        const response = await api.put<{ status: boolean, message: string }>(`/livreurs/${id}`, updateData);
        return response.data;
    },

    /**
     * Supprime définitivement un livreur de la base de données
     */
    deleteLivreur: async (id: number): Promise<{ status: boolean, message: string }> => {
        const response = await api.delete<{ status: boolean, message: string }>(`/livreurs/${id}`);
        return response.data;
    },

    /**
     * Modifie l'état d'activité d'un livreur (Bloqué / Opérationnel)
     * Envoie la valeur numérique (1 ou 0) attendue par les champs TINYINT de MySQL
     */
    toggleStatus: async (id: number, isActif: boolean): Promise<{ status: boolean, message: string }> => {
        const response = await api.put<{ status: boolean, message: string }>(`/livreurs/${id}`, { 
            is_actif: isActif ? 1 : 0 
        });
        return response.data;
    }
};

export default LivreurService;