// src/services/ContactService.ts
import api from "./Api";
import { 
  ContactApiResponse, 
  ContactFilters, 
  ContactSendPayload, 
  ContactReplyPayload 
} from "../models/ContactModel";

class ContactService {
  /**
   * PUBLIC : Permet à un internaute d'envoyer un message via le formulaire de contact
   */
  public async sendPublicMessage(payload: ContactSendPayload): Promise<{ status: boolean; message: string }> {
    const response = await api.post('/contact/send', payload);
    return response.data;
  }

  /**
   * ADMIN : Liste tous les messages avec pagination, filtres de statut et recherche textuelle
   */
  public async getMessages(filters: ContactFilters = {}): Promise<ContactApiResponse> {
    const response = await api.get<ContactApiResponse>('/admin/contacts', {
      params: {
        page: filters.page ?? 1,
        perPage: filters.perPage ?? 10,
        search: filters.search || undefined,
        status: filters.status || undefined
      }
    });
    return response.data;
  }

  /**
   * ADMIN : Alterne le statut de lecture d'un message (Lu <-> Non lu)
   */
  public async toggleReadStatus(id: number): Promise<{ status: boolean; message: string }> {
    const response = await api.patch(`admin/contacts/mark-read/${id}`);
    return response.data;
  }

  /**
   * ADMIN : Marque tous les messages non lus comme lus d'un seul coup
   */
  public async markAllAsRead(): Promise<{ status: boolean; message: string }> {
    const response = await api.patch('admin/contacts/mark-all-read');
    return response.data;
  }

  /**
   * ADMIN : Envoie une réponse par e-mail et/ou notification de dashboard à un utilisateur
   */
  public async replyToMessage(
    id: number, 
    payload: ContactReplyPayload
  ): Promise<{ status: boolean; message: string; mail_sent: boolean; dashboard_notified: boolean }> {
    const response = await api.post(`admin/contacts/reply/${id}`, payload);
    return response.data;
  }
}

export default new ContactService();