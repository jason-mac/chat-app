export interface NotifyRead {
  message_id: string;
}

export interface MessageReadResponse {
  message_id: string;
  reader_id: string;
  read_at: string;
}

export interface MessageReadResponses {
  message_id: string;
  read_by: MessageReadResponse[];
}
