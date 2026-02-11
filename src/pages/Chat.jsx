import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(3);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const currentUser = localStorage.getItem("userEmail") || "You";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await axios.get(
        "http://localhost:5000/api/messages/general"
      );
      setMessages(data);
    };

    fetchMessages();
    socket.emit("joinRoom", "general");

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      roomId: "general",
      content: message,
    });

    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-cyan-500",
      "bg-gradient-to-br from-cyan-500 to-teal-500",
      "bg-gradient-to-br from-green-500 to-emerald-500",
      "bg-gradient-to-br from-indigo-500 to-blue-500",
      "bg-gradient-to-br from-sky-500 to-blue-500",
    ];
    const index = email ? email.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/10 shadow-2xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-xl shadow-lg">
                S
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">SyncHub</h1>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{onlineUsers} online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm border border-white/10 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.user?.email === currentUser;
            const showAvatar = index === 0 || messages[index - 1].user?.email !== msg.user?.email;
            
            return (
              <div
                key={index}
                className={`flex gap-3 animate-fade-in ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(msg.user?.email)} flex items-center justify-center font-semibold text-white shadow-lg`}>
                    {getInitials(msg.user?.email)}
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <span className="text-xs text-gray-400 mb-1 px-2">
                      {msg.user?.email || 'Anonymous'}
                    </span>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-tr-sm'
                        : 'bg-white/10 text-white border border-white/10 rounded-tl-sm'
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="backdrop-blur-xl bg-white/10 border-t border-white/10 p-4">
        <div className="flex gap-3 items-end max-w-5xl mx-auto">
          <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 outline-none text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
              style={{ maxHeight: '120px', minHeight: '48px' }}
            />
          </div>

          <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
          >
            <span>Send</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
