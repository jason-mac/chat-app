import type {
  CreateDirectMessage,
  CreateGroupMessage,
  MessageResponse,
} from './message';

import type { NotifyRead, MessageReadResponse } from './message-read';

export type SendDirectMessage = {
  type: 'send_direct_message';
  payload: CreateDirectMessage;
};

export type SendGroupMessage = {
  type: 'send_group_message';
  payload: CreateGroupMessage;
};

export type NotifyReadRequest = {
  type: 'notify_read';
  payload: NotifyRead;
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

export type WsRequest =
  | SendDirectMessage
  | SendGroupMessage
  | NotifyReadRequest
  | Ping;
export type WsResponse = MessageRead | NewMessage;
