// src/services/AuthService.ts
import api from './Api';
import { AuthResponse, User } from '../models/UserModel';

/**
 * Interface pour les données d'inscription
 */
export interface RegisterData {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    password: string;
    ville?: string;
}

/**
 * Service d'authentification AfricaFood
 */
const AuthService = {
    /**
     * Inscription : Crée le compte et déclenche l'envoi de l'OTP par le backend
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * Vérification OTP : Active le compte de l'utilisateur
     * @param email L'email de l'utilisateur
     * @param otp Le code à 6 chiffres reçu par mail
     */
    verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/verify-otp', { email, otp });
        return response.data;
    },

    /**
     * Connexion : Récupère le token JWT et les infos user
     */
    login: async (credentials: Pick<RegisterData, 'email' | 'password'>): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        
        // Si la connexion réussit, on stocke le token immédiatement
        if (response.data.status && response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
        
        return response.data;
    },

    /**
     * Déconnexion : Informe le serveur et nettoie le stockage local
     */
    logout: async (): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/logout');
            return response.data;
        } finally {
            // Quoi qu'il arrive (même si le token est expiré), on vide le localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    },

    /**
     * Récupère les infos de l'utilisateur stockées localement
     */
    getCurrentUser: (): User | null => {
        const user = localStorage.getItem('user_data');
        return user ? JSON.parse(user) : null;
    }
};

export default AuthService;