import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import type { UserProfile } from '../../types/user';
import type { FriendshipResponse } from '../../types/friendship';

type Tab = 'find' | 'incoming' | 'outgoing';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const fetchUsername = async (id: string): Promise<string> => {
  const res = await fetch(`${API_URL}/users/${id}/profile`, {
    headers: getHeaders(),
  });
  if (!res.ok) return id;
  const data = (await res.json()) as UserProfile;
  return data.username;
};

export default function FriendSearch() {
  const [tab, setTab] = useState<Tab>('find');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [incoming, setIncoming] = useState<FriendshipResponse[]>([]);
  const [outgoing, setOutgoing] = useState<FriendshipResponse[]>([]);
  const [incomingNames, setIncomingNames] = useState<Record<string, string>>(
    {}
  );
  const [outgoingNames, setOutgoingNames] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
      if (!res.ok) return;
      setUsers((await res.json()) as UserProfile[]);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchIncoming = async () => {
      const res = await fetch(`${API_URL}/friend-requests/incoming`, {
        headers: getHeaders(),
      });
      if (!res.ok) return;
      const data = (await res.json()) as FriendshipResponse[];
      setIncoming(data);
      const names: Record<string, string> = {};
      await Promise.all(
        data.map(async (r) => {
          names[r.requester_id] = await fetchUsername(r.requester_id);
        })
      );
      setIncomingNames(names);
    };
    const fetchOutgoing = async () => {
      const res = await fetch(`${API_URL}/friend-requests/outgoing`, {
        headers: getHeaders(),
      });
      if (!res.ok) return;
      const data = (await res.json()) as FriendshipResponse[];
      setOutgoing(data);
      const names: Record<string, string> = {};
      await Promise.all(
        data.map(async (r) => {
          names[r.receiver_id] = await fetchUsername(r.receiver_id);
        })
      );
      setOutgoingNames(names);
    };
    fetchIncoming();
    fetchOutgoing();
  }, []);

  const sendFriendRequest = async (receiverId: string) => {
    const res = await fetch(`${API_URL}/friend-requests/${receiverId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (res.ok) setSent((prev) => new Set(prev).add(receiverId));
  };

  const acceptRequest = async (requesterId: string) => {
    const res = await fetch(
      `${API_URL}/friend-requests/${requesterId}/accept`,
      {
        method: 'PATCH',
        headers: getHeaders(),
      }
    );
    if (res.ok)
      setIncoming((prev) => prev.filter((r) => r.requester_id !== requesterId));
  };

  const declineRequest = async (requesterId: string) => {
    const res = await fetch(
      `${API_URL}/friend-requests/${requesterId}/decline`,
      {
        method: 'PATCH',
        headers: getHeaders(),
      }
    );
    if (res.ok)
      setIncoming((prev) => prev.filter((r) => r.requester_id !== requesterId));
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  const tabClass = (t: Tab) =>
    `text-xs px-3 py-1.5 cursor-pointer transition-colors ${
      tab === t
        ? 'text-white border-b border-white'
        : 'text-[#80848e] hover:text-[#dbdee1]'
    }`;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#25272b] p-6">
      <div className="flex gap-4 mb-6 border-b border-[#383a40]">
        <button className={tabClass('find')} onClick={() => setTab('find')}>
          find friends
        </button>
        <button
          className={tabClass('incoming')}
          onClick={() => setTab('incoming')}
        >
          incoming {incoming.length > 0 && `(${incoming.length})`}
        </button>
        <button
          className={tabClass('outgoing')}
          onClick={() => setTab('outgoing')}
        >
          outgoing
        </button>
      </div>

      {tab === 'find' && (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search users..."
            className="rounded-md bg-[#383a40] text-[#dbdee1] text-sm px-3 py-2 outline-none placeholder-[#80848e] mb-4"
          />
          <div className="flex flex-col gap-2">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between px-4 py-3 bg-[#2b2d31] rounded-md"
              >
                <p className="text-sm text-[#dbdee1]">{user.username}</p>
                <button
                  onClick={() => sendFriendRequest(user.user_id)}
                  disabled={sent.has(user.user_id)}
                  className="text-xs px-3 py-1 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {sent.has(user.user_id) ? 'sent' : 'add'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'incoming' && (
        <div className="flex flex-col gap-2">
          {incoming.length === 0 && (
            <p className="text-xs text-[#80848e]">no incoming requests</p>
          )}
          {incoming.map((r) => (
            <div
              key={r.requester_id}
              className="flex items-center justify-between px-4 py-3 bg-[#2b2d31] rounded-md"
            >
              <p className="text-sm text-[#dbdee1]">
                {incomingNames[r.requester_id] ?? r.requester_id}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptRequest(r.requester_id)}
                  className="text-xs px-3 py-1 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white cursor-pointer transition-colors"
                >
                  accept
                </button>
                <button
                  onClick={() => declineRequest(r.requester_id)}
                  className="text-xs px-3 py-1 rounded bg-[#383a40] hover:bg-[#43454c] text-white cursor-pointer transition-colors"
                >
                  decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'outgoing' && (
        <div className="flex flex-col gap-2">
          {outgoing.length === 0 && (
            <p className="text-xs text-[#80848e]">no outgoing requests</p>
          )}
          {outgoing.map((r) => (
            <div
              key={r.receiver_id}
              className="flex items-center justify-between px-4 py-3 bg-[#2b2d31] rounded-md"
            >
              <p className="text-sm text-[#dbdee1]">
                {outgoingNames[r.receiver_id] ?? r.receiver_id}
              </p>
              <span className="text-xs text-[#80848e]">pending</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
