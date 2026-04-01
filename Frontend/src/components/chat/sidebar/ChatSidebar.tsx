import { useEffect, useState, useMemo } from 'react';
import { PersonIcon } from '../../ui/Icons.tsx';
import { HeaderBox } from './HeaderBox.tsx';
import { SearchBox } from './SearchBox.tsx';
import { ChatItemJSX } from './ChatItemJSX.tsx';
import { fetchRecentChatItems } from '../../../services/recentChatItems.ts';
import { Avatar } from '../../ui/Avatar.tsx';
import type { Message } from '../../../types/message.ts';
import type { ChatItem } from '../../../types/chat-item.ts';
import type { ConversationResponse } from '../../../types/conversation.ts';
import type { FriendshipResponse } from '../../../types/friendship.ts';
import { API_URL } from '../../../config.ts';

interface ChatSidebarProps {
  currentConversation: ConversationResponse | null;
  setCurrentConversation: React.Dispatch<
    React.SetStateAction<ConversationResponse | null>
  >;
  setShowSearchUser: React.Dispatch<React.SetStateAction<boolean>>;
  setReceiverId: React.Dispatch<React.SetStateAction<string | null>>;
  recentMessageSent: Message | null;
}

type SideBarMode = 'conversations' | 'friends';

const myId = () => localStorage.getItem('user_id') ?? '';
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function ChatSidebar({
  currentConversation,
  setCurrentConversation,
  setShowSearchUser,
  setReceiverId,
  recentMessageSent,
}: ChatSidebarProps) {
  const [recentChats, setRecentChats] = useState<ChatItem[]>([]);
  const [query, setQuery] = useState<string>('');
  const [sideBarMode, setSideBarMode] = useState<SideBarMode>('conversations');
  const [friends, setFriends] = useState<FriendshipResponse[]>([]);
  const [friendNames, setFriendNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchNames = async () => {
      const names: Record<string, string> = {};
      await Promise.all(
        friends.map(async (f) => {
          const friendId =
            f.requester_id === myId() ? f.receiver_id : f.requester_id;
          const res = await fetch(`${API_URL}/users/${friendId}/profile`, {
            headers: getHeaders(),
          });
          if (!res.ok) return;
          const profile = await res.json();
          names[friendId] = profile.username;
        })
      );
      setFriendNames(names);
    };
    if (friends.length > 0) fetchNames();
  }, [friends]);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await fetch(`${API_URL}/friends`, { headers: getHeaders() });
      if (!res.ok) return;
      setFriends((await res.json()) as FriendshipResponse[]);
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    setShowSearchUser(false);
  }, [sideBarMode]);

  const displayData = useMemo(() => {
    if (query === '') return recentChats;
    return recentChats.filter((chatItem) =>
      (chatItem.conversation.name ?? 'Direct Message')
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [sideBarMode, query, recentChats]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRecentChatItems();
      setRecentChats(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!recentMessageSent) return;
    const conversationId = recentMessageSent.conversation_id;
    let index = 0;
    while (index < recentChats.length) {
      if (conversationId === recentChats[index].conversation.conversation_id)
        break;
      index++;
    }
    if (index >= recentChats.length) return;
    const newChatItem: ChatItem = {
      ...recentChats[index],
      message: recentMessageSent,
    };
    let newRecentChats = recentChats.filter((_, i) => i !== index);
    newRecentChats = [newChatItem, ...newRecentChats];
    setRecentChats(newRecentChats);
  }, [recentMessageSent]);

  const handleFriendClick = async (friend: FriendshipResponse) => {
    const friendId =
      friend.requester_id === myId() ? friend.receiver_id : friend.requester_id;
    const convRes = await fetch(`${API_URL}/conversations`, {
      headers: getHeaders(),
    });
    const convList = (await convRes.json()) as ConversationResponse[];

    for (const conv of convList) {
      if (conv.is_group) continue;
      const membersRes = await fetch(
        `${API_URL}/conversations/${conv.conversation_id}/members`,
        { headers: getHeaders() }
      );
      const membersData = await membersRes.json();
      const hasFriend = membersData.members.some(
        (m: { member_id: string }) => m.member_id === friendId
      );
      if (hasFriend) {
        setCurrentConversation(conv);
        setReceiverId(friendId);
        return;
      }
    }

    const res = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: null,
        is_group: false,
        member_ids: [myId(), friendId],
      }),
    });
    if (!res.ok) return;
    const newConv = (await res.json()) as ConversationResponse;
    setCurrentConversation(newConv);
    setReceiverId(friendId);
  };

  return (
    <aside className="w-64 border-r border-[#1e1f22] flex flex-col bg-[#1e1f22]">
      <HeaderBox
        sideBarMode={sideBarMode}
        setSideBarMode={setSideBarMode}
        setRecentChats={setRecentChats}
      />
      <SearchBox setQuery={setQuery} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {sideBarMode === 'conversations' &&
          displayData.map((item) => (
            <ChatItemJSX
              key={item.conversation.conversation_id}
              conversation={item.conversation}
              message={item.message}
              setCurrentConversation={setCurrentConversation}
              setReceiverId={setReceiverId}
              isActive={
                currentConversation?.conversation_id ===
                item.conversation.conversation_id
              }
            />
          ))}
        {sideBarMode === 'friends' &&
          friends.map((friend) => {
            const friendId =
              friend.requester_id === myId()
                ? friend.receiver_id
                : friend.requester_id;
            return (
              <div
                key={friendId}
                onClick={() => handleFriendClick(friend)}
                className="px-4 flex items-center gap-3 py-3 cursor-pointer hover:bg-[#2e3035] transition-colors"
              >
                <Avatar name={friendNames[friendId] ?? friendId} />
                <p className="text-sm text-[#dbdee1]">
                  {friendNames[friendId] ?? friendId}
                </p>
              </div>
            );
          })}
      </div>
      <div className="mt-auto flex justify-between items-center bg-[#2b2d31] px-4 py-3.5">
        <div className="flex gap-3">
          <Avatar name={`${localStorage.getItem('username')}`} />
          {`${localStorage.getItem('username')}`}
        </div>
        <button
          onClick={() => setShowSearchUser(true)}
          className="relative group p-2 rounded hover:bg-[#232428] transition"
        >
          <PersonIcon />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
            Add friend
          </span>
        </button>
      </div>
    </aside>
  );
}
