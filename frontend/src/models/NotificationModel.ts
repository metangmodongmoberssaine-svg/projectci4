// src/models/NotificationModel.ts
// src/models/Notification.ts

export interface Notification {
    id: number;
    id_user: number | null;
    titre: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
    is_read: number; // 0 ou 1
    is_broadcast: number; // 0 ou 1
    created_at: string;
    updated_at: string;
}

export interface NotificationResponse {
    status: boolean;
    unread: number;
    data: Notification[];
}