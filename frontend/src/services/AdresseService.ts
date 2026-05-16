
// src/services/AdresseService.ts
import api from "./Api";
import { Adresse, AdresseResponse, CreateAdresseDTO } from "../models/AdresseModel";

class AdresseService {
    /**
     * Récupérer les adresses de l'utilisateur connecté avec pagination
     * @param page Numéro de la page (défaut: 1)
     * @param perPage Nombre d'éléments par page (défaut: 10)
     */
    async getAdresses(page: number = 1, perPage: number = 10): Promise<AdresseResponse> {
        const response = await api.get<AdresseResponse>('/adresses', {
            params: { page, per_page: perPage }
        });
        return response.data;
    }

    /**
     * Ajouter une nouvelle adresse (avec ou sans géolocalisation)
     * @param adresseData Les données de l'adresse (DTO)
     */
    async createAdresse(adresseData: CreateAdresseDTO): Promise<{ status: boolean; message: string; id: number }> {
        const response = await api.post('/adresses', adresseData);
        return response.data;
    }

    /**
     * Mettre à jour une adresse existante (PUT)
     * @param id ID de l'adresse à modifier
     * @param adresseData Données partielles ou complètes à modifier
     */
    async updateAdresse(id: number, adresseData: Partial<CreateAdresseDTO>): Promise<{ status: boolean; message: string }> {
        const response = await api.put(`/adresses/${id}`, adresseData);
        return response.data;
    }

    /**
     * Supprimer une adresse
     * @param id ID de l'adresse à supprimer
     */
    async deleteAdresse(id: number): Promise<{ status: boolean; message: string }> {
        const response = await api.delete(`/adresses/${id}`);
        return response.data;
    }

    /**
     * Définir une adresse comme adresse par défaut pour les prochaines commandes
     * @param id ID de l'adresse à mettre par défaut
     */
    async setDefaultAdresse(id: number): Promise<{ status: boolean; message: string }> {
        const response = await api.patch(`/adresses/${id}/default`);
        return response.data;
    }
}

export default new AdresseService();