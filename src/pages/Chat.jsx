import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_BASE_URL);

const CONTACTS = [
  { id: "alice@synchub.io", name: "Alice Johnson", status: "online", unread: 2, lastMsg: "Hey, how's it going?" },
  { id: "bob@synchub.io", name: "Bob Smith", status: "away", unread: 0, lastMsg: "Let me know when you're free" },
  { id: "carol@synchub.io", name: "Carol White", status: "offline", unread: 5, lastMsg: "Thanks for the update!" },
  { id: "dave@synchub.io", name: "Dave Brown", status: "online", unread: 0, lastMsg: "Sounds good to me" },
  { id: "emma@synchub.io", name: "Emma Davis", status: "online", unread: 1, lastMsg: "Can we sync tomorrow?" },
];

const GROUPS = [
  { id: "general", name: "General", desc: "Team-wide announcements", members: 24, unread: 3 },
  { id: "dev-team", name: "Dev Team", desc: "Engineering discussions", members: 8, unread: 0 },
  { id: "design", name: "Design", desc: "UI/UX & product design", members: 5, unread: 1 },
  { id: "random", name: "Random", desc: "Off-topic fun", members: 18, unread: 0 },
  { id: "announcements", name: "Announcements", desc: "Important updates", members: 24, unread: 0 },
];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-green-600",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-cyan-600",
  "from-yellow-500 to-orange-500",
  "from-indigo-500 to-blue-600",
];

const STATUS_COLORS = { online: "bg-green-500", away: "bg-yellow-400", offline: "bg-gray-600" };
const STATUS_LABELS = { online: "Online", away: "Away", offline: "Offline" };

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState({ type: "group", id: "general", name: "General" });
  const [sidebarTab, setSidebarTab] = useState("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = localStorage.getItem("userEmail") || "you@example.com";

  const getRoomId = (chat) => {
    if (chat.type === "group") return chat.id;
    return [currentUser, chat.id].sort().join("__dm__");
  };

  const getInitials = (str) => {
    if (!str) return "?";
    const parts = str.split(/[\s@]/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : str.slice(0, 2).toUpperCase();
  };

  const getGradient = (seed) => {
    if (!seed) return AVATAR_GRADIENTS[0];
    return AVATAR_GRADIENTS[seed.charCodeAt(0) % AVATAR_GRADIENTS.length];
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  useEffect(() => {
    setMessages([]);
    const roomId = getRoomId(activeChat);
    const token = localStorage.getItem("token");

    axios.get(`${API_BASE_URL}/api/messages/${roomId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(({ data }) => setMessages(data))
      .catch(() => {});

    socket.emit("joinRoom", roomId);
    const handler = (data) => setMessages((prev) => [...prev, data]);
    socket.on("receiveMessage", handler);
    return () => {
      socket.off("receiveMessage", handler);
      socket.emit("leaveRoom", roomId);
    };
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", {
      senderId: currentUser,
      roomId: getRoomId(activeChat),
      content: message,
    });
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const filteredContacts = CONTACTS.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = GROUPS.filter(
    (g) => g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGroupInfo = GROUPS.find((g) => g.id === activeChat.id);
  const activeContactInfo = CONTACTS.find((c) => c.id === activeChat.id);

  // Group messages by date for dividers
  const getDateDivider = (index) => {
    if (index === 0) return formatDate(messages[0]?.createdAt);
    const prev = new Date(messages[index - 1]?.createdAt);
    const curr = new Date(messages[index]?.createdAt);
    if (prev.toDateString() !== curr.toDateString()) return formatDate(messages[index]?.createdAt);
    return null;
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden font-sans">

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        className={`flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5 bg-[#13181f] ${
          sidebarOpen ? "w-72" : "w-0"
        }`}
      >
        {/* Logo + User Profile */}
        <div className="px-4 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/30">
              S
            </div>
            <span className="font-bold text-white text-base tracking-tight">SyncHub</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
            <div className="relative shrink-0">
              <div className={`w-9 h-9 rounded-full bg-linear-to-br ${getGradient(currentUser)} flex items-center justify-center text-xs font-bold shadow`}>
                {getInitials(currentUser)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#13181f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {currentUser.split("@")[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentUser}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <svg className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all"
            />
          </div>
        </div>

        {/* DM / Groups Tabs */}
        <div className="px-4 pb-2 flex gap-1 shrink-0">
          {["dms", "groups"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSidebarTab(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                sidebarTab === tab
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {tab === "dms" ? "Direct Messages" : "Channels"}
            </button>
          ))}
        </div>

        {/* Contact / Channel List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 scrollbar-thin">
          {sidebarTab === "dms" ? (
            <>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 py-2 mt-1">
                Messages · {filteredContacts.length}
              </p>
              {filteredContacts.map((contact) => {
                const isActive = activeChat.type === "dm" && activeChat.id === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setActiveChat({ type: "dm", id: contact.id, name: contact.name })}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all group text-left ${
                      isActive ? "bg-blue-500/15 border border-blue-500/20" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 rounded-full bg-linear-to-br ${getGradient(contact.id)} flex items-center justify-center text-xs font-bold shadow`}>
                        {getInitials(contact.name)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${STATUS_COLORS[contact.status]} rounded-full border-2 border-[#13181f]`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                          {contact.name}
                        </p>
                        {contact.unread > 0 && (
                          <span className="shrink-0 min-w-5 h-5 px-1.5 bg-blue-500 rounded-full text-xs flex items-center justify-center font-bold">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{contact.lastMsg}</p>
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 py-2 mt-1">
                Channels · {filteredGroups.length}
              </p>
              {filteredGroups.map((group) => {
                const isActive = activeChat.type === "group" && activeChat.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveChat({ type: "group", id: group.id, name: group.name })}
                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all group text-left ${
                      isActive ? "bg-blue-500/15 border border-blue-500/20" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${getGradient(group.id)} flex items-center justify-center shrink-0 shadow`}>
                      <span className="text-sm font-black">#</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                          {group.name}
                        </p>
                        {group.unread > 0 && (
                          <span className="shrink-0 min-w-5 h-5 px-1.5 bg-blue-500 rounded-full text-xs flex items-center justify-center font-bold">
                            {group.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{group.members} members · {group.desc}</p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </aside>

      {/* ═══════════ MAIN CHAT ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat Header */}
        <header className="flex items-center gap-3 px-5 py-3.5 bg-[#13181f]/90 backdrop-blur-md border-b border-white/5 shrink-0 z-10">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Chat identity */}
          {activeChat.type === "group" ? (
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${getGradient(activeChat.id)} flex items-center justify-center font-black text-base shadow shrink-0`}>
              #
            </div>
          ) : (
            <div className="relative shrink-0">
              <div className={`w-10 h-10 rounded-full bg-linear-to-br ${getGradient(activeChat.id)} flex items-center justify-center text-sm font-bold shadow`}>
                {getInitials(activeChat.name)}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${activeContactInfo ? STATUS_COLORS[activeContactInfo.status] : "bg-gray-600"} rounded-full border-2 border-[#13181f]`} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-base leading-tight">
              {activeChat.type === "group" ? `# ${activeChat.name}` : activeChat.name}
            </h2>
            <p className="text-xs text-gray-500 leading-tight">
              {activeChat.type === "group"
                ? `${activeGroupInfo?.members ?? 0} members · ${activeGroupInfo?.desc ?? ""}`
                : activeContactInfo
                  ? `${STATUS_LABELS[activeContactInfo.status]} · ${activeChat.id}`
                  : activeChat.id}
            </p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1 shrink-0">
            {activeChat.type === "dm" && (
              <>
                <button className="p-2 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors" title="Voice call">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors" title="Video call">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </>
            )}
            {activeChat.type === "group" && (
              <button className="p-2 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors" title="Members">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
            <button className="p-2 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors" title="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-colors" title="More">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center select-none gap-4">
              <div className={`w-20 h-20 rounded-2xl bg-linear-to-br ${getGradient(activeChat.id)} flex items-center justify-center shadow-2xl`}>
                {activeChat.type === "group" ? (
                  <span className="text-3xl font-black">#</span>
                ) : (
                  <span className="text-2xl font-bold">{getInitials(activeChat.name)}</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {activeChat.type === "group" ? `Welcome to #${activeChat.name}` : `Chat with ${activeChat.name}`}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  {activeChat.type === "group"
                    ? "This is the start of the channel. Be the first to send a message!"
                    : "This is the beginning of your direct message history. Say hello!"}
                </p>
              </div>
              {activeChat.type === "group" && activeGroupInfo && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{activeGroupInfo.members} members in this channel</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              {messages.map((msg, index) => {
                const sender = msg.sender || "Anonymous";
                const isMe = sender === currentUser;
                const prev = messages[index - 1];
                const isSameUser = (prev?.sender || "Anonymous") === sender;
                const timeDiff = prev ? (new Date(msg.createdAt) - new Date(prev.createdAt)) / 60000 : 999;
                const showHeader = !isSameUser || timeDiff > 5;
                const dateDivider = getDateDivider(index);

                return (
                  <div key={index}>
                    {dateDivider && (
                      <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-xs font-semibold text-gray-600 bg-[#0d1117] px-3 py-1 rounded-full border border-white/5">
                          {dateDivider}
                        </span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                    )}
                    <div className={`flex gap-3 group animate-msg-in ${showHeader ? "mt-5" : "mt-0.5"} ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar */}
                      <div className={`shrink-0 w-9 mt-0.5 ${showHeader ? "" : "invisible"}`}>
                        <div className={`w-9 h-9 rounded-full bg-linear-to-br ${getGradient(sender)} flex items-center justify-center text-xs font-bold shadow`}>
                          {getInitials(sender)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`flex flex-col max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                        {showHeader && (
                          <div className={`flex items-baseline gap-2 mb-1.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className="text-xs font-semibold text-gray-300">
                              {isMe ? "You" : sender?.split("@")[0] ?? "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-600">{formatTime(msg.createdAt)}</span>
                          </div>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm ${`
                            isMe
                              ? "bg-linear-to-br from-blue-600 to-blue-700 text-white rounded-tr-md"
                              : "bg-[#1a2030] text-gray-100 border border-white/5 rounded-tl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {!showHeader && (
                          <span className="text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity px-1 mt-0.5">
                            {formatTime(msg.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input Bar */}
        <footer className="px-5 py-4 bg-[#13181f]/70 backdrop-blur-sm border-t border-white/5 shrink-0">
          <div className="flex items-end gap-2 bg-[#1a2030] rounded-2xl border border-white/8 px-4 py-3 focus-within:border-blue-500/40 focus-within:ring-1 focus-within:ring-blue-500/10 transition-all">
            <button className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors shrink-0" title="Attach file">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-600 resize-none text-sm leading-relaxed py-0.5"
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeChat.type === "group" ? "#" + activeChat.name : activeChat.name}…`}
              rows="1"
              style={{ maxHeight: "120px", minHeight: "22px" }}
            />
            <button className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors shrink-0" title="Emoji">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className={`p-2 rounded-xl transition-all shrink-0 ${
                message.trim()
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 scale-100"
                  : "bg-white/5 text-gray-700 cursor-not-allowed"
              }`}
              title="Send"
            >
              <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-700 mt-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono">Enter</kbd> to send ·{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono">Shift+Enter</kbd> for new line
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
