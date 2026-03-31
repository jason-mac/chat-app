export interface CreateGroupMessage {
  content: string;
  conversation_id: string;
}

export interface CreateDirectMessage {
  content: string;
  conversation_id?: string;
  receiver_id: string;
}

export interface MessageResponse {
  message_id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export interface MessageQuery {
  limit?: number;
  offset?: number;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  created_at: string;
}
