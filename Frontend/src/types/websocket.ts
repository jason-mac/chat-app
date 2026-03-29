import type { CreateMessage, MessageResponse } from './message';
import type { NotifyMessageRead, MessageReadResponse } from './messageRead';

export type SendMessage = {
  type: 'send_message';
  payload: CreateMessage;
};

export type NotifyRead = {
  type: 'notify_read';
  payload: NotifyMessageRead;
};

export type Ping = {
  type: 'ping';
};

export type MessageRead = {
  type: 'message_read';
  payload: MessageReadResponse;
};

export type NewMessage = {
  type: 'new_message';
  payload: MessageResponse;
};

export type WsRequest = SendMessage | NotifyRead | Ping;

export type WsResponse = MessageRead | NewMessage;
