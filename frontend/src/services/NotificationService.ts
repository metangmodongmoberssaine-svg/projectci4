import api from "./Api";
import { NotificationResponse } from "../models/NotificationModel";

interface NotificationFilters {
    page?: number;
    perPage?: number;
    status?: 'all' | 'unread' | 'read' | string;
}

class NotificationService {
    
    /**
     * Récupérer toutes les notifications de l'utilisateur connecté
     */
    async getMyNotifications(filters?: NotificationFilters): Promise<NotificationResponse> {
        const response = await api.get<NotificationResponse>('/notifications', {
            params: filters
        });
        return response.data;
    }

    /**
     * Marquer une seule notification comme lue
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