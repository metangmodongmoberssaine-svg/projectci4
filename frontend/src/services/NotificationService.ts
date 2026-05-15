// src/services/NotificationService.ts
// src/services/NotificationService.ts
import api from "./Api";
import { NotificationResponse } from "../models/NotificationModel";

class NotificationService {
    
    /**
     * Récupérer toutes les notifications de l'utilisateur connecté
     * (Inclut les notifications directes et les diffusions/broadcast)
     */
    async getMyNotifications(): Promise<NotificationResponse> {
        const response = await api.get<NotificationResponse>('/notifications');
        return response.data;
    }

    /**
     * Marquer une seule notification comme lue
     * @param id - ID de la notification
     */
    async markAsRead(id: number): Promise<{ status: boolean; message: string }> {
        const response = await api.patch(`notifications/read/${id}`);
        return response.data;
    }

    /**
     * Marquer TOUTES les notifications de l'utilisateur comme lues
     */
    async markAllAsRead(): Promise<{ status: boolean; message: string }> {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    }

    /**
     * [Admin] Envoyer une notification
     * @param data - { titre, message, target, type }
     * target peut être 'all' pour tout le monde ou l'ID numérique d'un utilisateur
     */
    async sendNotification(data: { 
        titre: string; 
        message: string; 
        target: string | number; 
        type?: string 
    }): Promise<{ status: boolean; message: string }> {
        const response = await api.post('/notifications/send', data);
        return response.data;
    }
}

export default new NotificationService();