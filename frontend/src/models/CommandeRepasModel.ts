// src/models/CommandeRepasModel.ts
/**
 * Interface CommandeRepas synchronisée avec App\Models\CommandeRepasModel.php
 */
export interface CommandeRepas {
    id: number;
    id_commande: number;
    id_repas: number;
    quantite: number;
    prix_unitaire: number;
    created_at?: string;
    updated_at?: string;

    // Propriétés optionnelles ajoutées par les jointures du backend 
    // (Utiles pour l'affichage dans le récapitulatif du panier ou l'historique)
    nom_repas?: string;
    image_repas?: string;
}

/**
 * Type utilitaire pour la création d'une ligne de commande (Payload envoyé au serveur)
 */
export type CreateCommandeRepasInput = Omit<CommandeRepas, 'id' | 'created_at' | 'updated_at'>;