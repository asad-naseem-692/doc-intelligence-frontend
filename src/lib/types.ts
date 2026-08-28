export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type DocumentStatusType = 'processing' | 'ready' | 'failed';

export interface DocumentItem {
  id: string;
  filename: string;
  owner_id: string;
  status: DocumentStatusType;
  uploaded_at: string;
  error_message?: string | null;
}

export interface Citation {
  document_id: string;
  filename: string;
  chunk_index: number;
  excerpt: string;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  is_fallback: boolean;
}

export interface QAHistoryEntry {
  id: string;
  question: string;
  answer: string;
  citations: Citation[];
  is_fallback: boolean;
  created_at: string;
}

export interface ApiError {
  detail: string;
}
