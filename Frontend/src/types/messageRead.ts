export interface MessageReadResponse {
  message_id: string;
  reader_id: string;
  read_at: string;
}

export interface NotifyMessageRead {
  message_id: string;
}

export interface MessageReadsResponse {
  message_id: string;
  read_by: MessageReadResponse[];
}
