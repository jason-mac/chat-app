export interface ConversationResponse {
  conversation_id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
}

export interface ConversationMemberInfo {
  member_id: string;
  joined_at: string;
}

export interface ConversationMembersResponse {
  conversation_id: string;
  members: ConversationMemberInfo[];
}

export interface CreateConversation {
  name: string | null;
  is_group: boolean;
  member_ids: string[];
}
