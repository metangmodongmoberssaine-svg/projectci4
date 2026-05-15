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
 * Interface pour la modification du profil
 */
export interface UpdateProfileData {
    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
    ville?: string;
}

/**
 * Interface pour le changement de mot de passe
 */
export interface ChangePasswordData {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

/**
 * Service d'authentification AfricaFood
 */
const AuthService = {
    /**
     * Inscription : Crée le compte et déclenche l'envoi de l'OTP
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * Vérification OTP : Active le compte de l'utilisateur
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
        
        if (response.data.status && response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
        
        return response.data;
    },

    /**
     * Récupère le profil frais depuis le serveur
     * Utile pour synchroniser les infos après une modification
     */
    getProfile: async (): Promise<AuthResponse> => {
        const response = await api.get<AuthResponse>('/auth/profile');
        if (response.data.status && response.data.user) {
            // On met à jour le stockage local avec les infos fraîches
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    /**
     * Met à jour les informations de l'utilisateur (nom, tel, ville...)
     */
    updateProfile: async (data: UpdateProfileData): Promise<AuthResponse> => {
        const response = await api.put<AuthResponse>('/auth/update-profile', data);
        return response.data;
    },

    /**
     * Change le mot de passe
     */
    changePassword: async (data: ChangePasswordData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/change-password', data);
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
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    },

    /**
     * Récupère les infos de l'utilisateur stockées localement
     */
    getCurrentUser: (): User | null => {
        const user = localStorage.getItem('user_data');
        try {
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }
};

export default AuthService;