// src/models/PanierModel.ts
// src/models/PanierModel.ts

export interface PanierItem {
    id: number;            // ID de la table panier_repas
    id_panier: number;
    id_repas: number;
    quantite: number;
    prix_unitaire: string | number;
    created_at: string;
    updated_at: string;
    
    // Propriétés jointes depuis la table repas dans le contrôleur
    nom: string;
    photo: string | null;
    status: 'disponible' | 'indisponible';
}

export interface PanierData {
    id: number;            // ID de la table panier
    id_user: number;
    items: PanierItem[];   // Les éléments du panier de la page actuelle
    total: number;         // Le montant total global de tout le panier
    pagination: {
        current_page: number;
        per_page: number;
        total_items: number;
        total_pages: number;
        has_more: boolean;
    };
}

export interface PanierResponse {
    status: boolean;
    data: PanierData;
}