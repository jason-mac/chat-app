export interface Message {
  message_id: string;
  content: string;
  message_from: string;
  message_to: string;
  created_at: string;
}

export type MessageResponse = Message;

export interface CreateMessage {
  content: string;
  message_to: string;
}

export interface MarkMessageRead {
  user_id: string;
  message_id: string;
}
