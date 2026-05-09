// src/models/UserModel.ts
/**
 * Interface User synchronisée avec App\Models\UserModel.php
 */
export interface User {
    id?: number;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    role: 'client' | 'livreur' | 'admin';
    ville?: string;
    photo_profil?: string;
    is_verified: boolean;
    is_actif: boolean;
    created_at?: string;
    updated_at?: string;
    
    // On ne met pas 'password' ou 'otp_code' ici par sécurité 
    // car le backend ne doit jamais les renvoyer en JSON.
}

/**
 * Interface pour la réponse d'authentification (Login)
 */
export interface AuthResponse {
    status: boolean;
    message: string;
    token?: string; // Présent si login réussi
    user?: User;    // Présent si login réussi
}

/**
 * Interface pour les erreurs de validation du backend
 */
export interface ApiValidationError {
    status: false;
    message: string;
    errors: {
        email?: string;
        telephone?: string;
        password?: string;
        nom?: string;
        prenom?: string;
    };
}