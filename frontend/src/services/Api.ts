// src/services/Api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

/**
 *  STRATÉGIE PROXY :
 * On utilise '/api' comme URL de base. 
 * Le proxy configuré dans vite.config.ts interceptera ces requêtes
 * et les redirigera vers http://localhost:8080.
 */
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  /**
   * withCredentials: false est recommandé pour le développement initial 
   * afin d'éviter les conflits de sécurité CORS sur les requêtes de type 'Preflight'.
   */
  withCredentials: false, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * INTERCEPTEUR DE REQUÊTE
 * Ajoute automatiquement le Token JWT dans le header "Authorization" 
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 *  INTERCEPTEUR DE RÉPONSE
 * Gestion globale des erreurs (ex: session expirée)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le serveur répond avec une erreur 401, le token est probablement invalide
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // window.location.href = '/login'; // Optionnel : redirection automatique
    }
    return Promise.reject(error);
  }
);

export default api;