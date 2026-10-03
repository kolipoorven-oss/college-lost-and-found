import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Tag, 
  MapPin, 
  User, 
  Clock, 
  ArrowLeft,
  Lock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function MessagesPage({ setActivePage, setSelectedItem }) {
  const { user, token, refreshUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadItem, setThreadItem] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all conversations
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        
        // If no active conversation selected yet, pick the first one
        if (!activeConv && data.conversations && data.conversations.length > 0) {
          selectConversation(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific thread
  const selectConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await fetch(`/api/messages/thread/${conv.otherUser.id}/${conv.itemId || 0}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setThreadMessages(data.messages || []);
        setThreadItem(data.item || conv.item);
        setOtherUser(data.otherUser || conv.otherUser);
        refreshUser();
      }
    } catch (err) {
      console.error('Fetch thread error:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: activeConv.otherUser.id,
          item_id: activeConv.itemId,
          message: inputMessage.trim()
        })
      });

      if (res.ok) {
        setInputMessage('');
        // Re-fetch current thread
        await selectConversation(activeConv);
        await fetchConversations();
      }
    } catch (err) {
      alert('Failed to deliver message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Campus Messenger</h3>
        <p className="text-xs text-slate-500">Sign in to communicate with students and staff regarding lost and found reports.</p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Page Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Campus Messenger
          </h1>
          <p className="text-xs text-slate-500">
            Secure, privacy-preserving messaging between campus finders and item owners.
          </p>
        </div>

        <button
          onClick={fetchConversations}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
          title="Refresh Messages"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Split Chat Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-h-[750px]">
        
        {/* Left: Conversation List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Conversations ({conversations.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-slate-400">
                  When you contact an item reporter or someone messages your post, conversations appear here.
                </p>
              </div>
            ) : (
              conversations.map(conv => {
                const isSelected = activeConv?.key === conv.key;
                return (
                  <div
                    key={conv.key}
                    onClick={() => selectConversation(conv)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {conv.otherUser.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs truncate">
                          {conv.otherUser.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {conv.item && (
                        <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-semibold truncate">
                          <Tag className="w-3 h-3 shrink-0" />
                          <span className="truncate">{conv.item.title}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 truncate leading-snug">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Thread */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {otherUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">{otherUser?.name}</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {otherUser?.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {otherUser?.maskedCollegeId} • {otherUser?.department}
                    </p>
                  </div>
                </div>

                {threadItem && (
                  <button
                    onClick={() => {
                      setSelectedItem(threadItem);
                      setActivePage('item-detail');
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Item: {threadItem.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Privacy Notice Banner */}
              <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Private Conversation: Personal phone numbers & email addresses remain confidential.</span>
              </div>

              {/* Message Bubbles Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/40">
                {threadMessages.map(msg => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message to arrange verification or collection..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 stroke-1" />
              <h4 className="font-bold text-slate-700 text-sm">Select a Conversation</h4>
              <p className="text-xs max-w-xs">
                Pick a discussion thread from the sidebar to view chat history and arrange item handovers.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
