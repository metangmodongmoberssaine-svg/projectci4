// src/models/ContactModel.ts
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  reply: string | null;
  is_read: 0 | 1;
  created_at: string;
  updated_at: string;
  replied_at: string | null;
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
}

export interface ContactApiResponse {
  status: boolean;
  data: ContactMessage[];
  pagination: PaginationMeta;
}

export interface ContactFilters {
  search?: string;
  status?: 'read' | 'unread' | 'replied' | 'unreplied' | '';
  page?: number;
  perPage?: number;
}

// Optionnel : Payload requis pour envoyer une réponse depuis l'admin
export interface ContactReplyPayload {
  reply: string;
}

// Optionnel : Payload requis pour envoyer un message depuis le formulaire public
export interface ContactSendPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}