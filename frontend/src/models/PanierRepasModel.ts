// src/models/PanierRepasModel.ts
/**
 * Interface PanierRepas synchronisée avec App\Models\PanierRepasModel.php
 */
export interface PanierRepas {
    id: number;
    id_panier: number;
    id_repas: number;
    quantite: number;
    prix_unitaire: number;
    created_at?: string;
    updated_at?: string;

    // Propriétés récupérées via la jointure avec la table `repas` (méthode getByPanier)
    nom?: string;       // repas.nom
    photo?: string;     // repas.photo
    status?: string;    // repas.status (ex: 'disponible', 'indisponible')
}

/**
 * Type utilitaire pour ajouter un élément au panier depuis le frontend
 */
export interface AddToPanierInput {
    id_repas: number;
    quantite: number;
    prix_unitaire: number;
}