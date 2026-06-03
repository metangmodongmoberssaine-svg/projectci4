// src/models/CommandeModel.ts
export type CommandeStatus = 'en_attente' | 'valide' | 'en_cours' | 'livre' | 'annule';

export interface CommandeRepas {
    id: number;
    id_commande: number;
    id_repas: number;
    quantite: number;
    prix_unitaire: number;
    nom_repas?: string; // Optionnel : si ton backend fait une jointure pour afficher le nom du repas
    image_repas?: string; // Optionnel : pour afficher la miniature dans le résumé
    created_at?: string;
    updated_at?: string;
}

export interface Commande {
    id: number;
    id_user: number;
    id_livreur: number | null;
    id_promotion: number | null;
    adresse_livraison: string;
    montant_total: number;
    montant_remise: number;
    status: CommandeStatus;
    created_at: string;
    updated_at: string;
    
    // Jointures retournées par l'espace Admin (getEnAttente)
    nom?: string;
    prenom?: string;
    telephone?: string;

    // Inclus uniquement lors de la récupération des détails (getDetail)
    repas?: CommandeRepas[];
}