import { useState, useEffect } from 'react';
import type { Message } from '../../../types/message';
import type { ConversationResponse } from '../../../types/conversation';
import type { UserProfile } from '../../../types/user';
import { Avatar } from '../../ui/Avatar';
import { API_URL } from '../../../config';
import type { ConversationMembersResponse } from '../../../types/conversation';

interface ChatItemJSXProps {
  conversation: ConversationResponse;
  message: Message | null;
  setCurrentConversation: React.Dispatch<
    React.SetStateAction<ConversationResponse | null>
  >;
  setReceiverId: React.Dispatch<React.SetStateAction<string | null>>;
  isActive: boolean;
}

export function ChatItemJSX({
  conversation,
  message,
  setCurrentConversation,
  setReceiverId,
  isActive,
}: ChatItemJSXProps) {
  const [displayName, setDisplayName] = useState(conversation.name ?? ' ');
  const myId = localStorage.getItem('user_id');

  useEffect(() => {
    if (conversation.is_group || conversation.name) return;
    const fetchOtherUser = async () => {
      try {
        const res = await fetch(
          `${API_URL}/conversations/${conversation.conversation_id}/members`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = (await res.json()) as ConversationMembersResponse;
        const other = data.members.find((m) => m.member_id !== myId);
        if (other) {
          const profileRes = await fetch(
            `${API_URL}/users/${other.member_id}/profile`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          const profile = (await profileRes.json()) as UserProfile;
          setDisplayName(profile.username);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOtherUser();
  }, [conversation.conversation_id]);

  const handleClick = async () => {
    setCurrentConversation(conversation);
    if (!conversation.is_group) {
      try {
        const res = await fetch(
          `${API_URL}/conversations/${conversation.conversation_id}/members`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = (await res.json()) as ConversationMembersResponse;
        const other = data.members.find((m) => m.member_id !== myId);
        if (other) setReceiverId(other.member_id);
      } catch (err) {
        console.error(err);
      }
    } else {
      setReceiverId(null);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 flex justify-between items-center py-3 cursor-pointer transition-colors ${
        isActive ? 'bg-[#2e3035] hover:bg-[#33363b]' : 'hover:bg-[#2e3035]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={displayName} />
        <div className="min-w-0">
          <p className="text-sm text-[#dbdee1] font-medium">{displayName}</p>
          <p className="text-xs text-[#80848e] mt-0.5 truncate w-32">
            {message?.content ?? ''}
          </p>
        </div>
      </div>
    </div>
  );
}
