// src/models/AdresseModel.ts

export interface Adresse {
    id?: number;              // Optionnel car absent lors de la création d'une adresse
    id_user: number;
    libelle: string;          // Ex: "Maison", "Bureau", "Pour Maman"
    adresse: string;          // Description textuelle de l'emplacement
    ville: string;            // Par défaut "Douala"
    latitude: number | null;  // Reçu du navigateur (peut être null si refus de partage)
    longitude: number | null; // Reçu du navigateur (peut être null si refus de partage)
    is_default: number;       // 0 pour faux, 1 pour vrai
    created_at?: string;      // Géré automatiquement par le backend CodeIgniter
    updated_at?: string;      // Géré automatiquement par le backend CodeIgniter
}

/**
 * Type spécifique pour la création d'une nouvelle adresse.
 * On exclut 'id_user' en plus de 'id' et des dates car le front-end 
 * n'a pas à l'envoyer (le backend CodeIgniter l'extrait directement du jeton d'authentification).
 */
export type CreateAdresseDTO = Omit<Adresse, 'id' | 'id_user' | 'created_at' | 'updated_at'>;

// Structure de la réponse paginée renvoyée par ton AdresseController
export interface AdresseResponse {
    status: boolean;
    data: Adresse[];
    pagination: {
        current_page: number;
        per_page: number;
        total_items: number;
        total_pages: number;
        has_more: boolean;
    };
}