import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/chatService';
import { Conversation, ChatMessage, User } from '../types';
import {
  Send,
  Image as ImageIcon,
  X,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ArrowLeft,
  Search,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Circle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatWindowProps {
  initialConversationId?: string | null;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  initialConversationId = null,
  onClose,
  isEmbedded = false
}) => {
  const { user, allUsers, showToast } = useApp();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active conversation prop
  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
    }
  }, [initialConversationId]);

  // 1. Real-time listener for user's conversations
  useEffect(() => {
    if (!user) return;

    const convsRef = collection(db, 'conversations');
    const q = query(convsRef, where('participants', 'array-contains', user.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convList: Conversation[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }) as Conversation);

        // Sort by updatedAt descending
        convList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setConversations(convList);

        // Auto select first conversation if none active
        if (!activeConvId && convList.length > 0 && !initialConversationId) {
          setActiveConvId(convList[0].id);
        }
      },
      (err) => {
        console.warn('Real-time conversations sync warning:', err);
      }
    );

    return () => unsubscribe();
  }, [user, initialConversationId]);

  // 2. Real-time listener for active conversation messages
  useEffect(() => {
    if (!activeConvId || !user) return;

    // Mark conversation as read when opened
    chatService.markAsRead(activeConvId, user.id);

    const messagesRef = collection(db, 'conversations', activeConvId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgList: ChatMessage[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }) as ChatMessage);

        setMessages(msgList);

        // Mark unread messages as read as they arrive
        chatService.markAsRead(activeConvId, user.id);
      },
      (err) => {
        console.warn('Real-time messages sync warning:', err);
      }
    );

    return () => unsubscribe();
  }, [activeConvId, user]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <MessageSquare className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Sign In Required for Messenger
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Please sign in to your campus account to view messages and chat with item owners.
        </p>
      </div>
    );
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Determine other participant
  const otherParticipantId = activeConv?.participants.find((id) => id !== user.id) || '';
  const otherParticipantDetail = activeConv?.participantDetails?.[otherParticipantId];
  const otherUserDoc = allUsers.find((u) => u.id === otherParticipantId);

  const isOtherOnline = Boolean(
    otherUserDoc?.isOnline ||
    (otherUserDoc?.lastActive &&
      new Date().getTime() - new Date(otherUserDoc.lastActive).getTime() < 300000)
  );

  const isOtherTyping = Boolean(activeConv?.typingStatus?.[otherParticipantId]);

  // Handle typing indicator updates
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (activeConvId && user) {
      chatService.setTypingStatus(activeConvId, user.id, true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTypingStatus(activeConvId, user.id, false);
      }, 2000);
    }
  };

  // Handle Image Upload Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Image file size must be less than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !activeConvId || isSending) return;

    const textToSend = inputText.trim();
    const imageToSend = selectedImage;

    setInputText('');
    setSelectedImage(null);
    setIsSending(true);

    try {
      await chatService.sendMessage(activeConvId, user, textToSend, imageToSend || undefined);
    } catch (err) {
      console.error('Error sending message:', err);
      showToast('Failed to send message. Please check connection.');
      setInputText(textToSend);
      setSelectedImage(imageToSend);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const otherId = c.participants.find((p) => p !== user.id) || '';
    const otherName = c.participantDetails?.[otherId]?.name || '';
    return (
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className={`flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden ${
      isEmbedded ? 'h-[600px]' : 'h-[calc(100vh-140px)] min-h-[550px]'
    }`}>
      {/* LEFT SIDE: Conversations List */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 ${
        activeConvId && !isEmbedded ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Campus Chat
              </h2>
              <span className="text-[10px] font-semibold text-slate-400">
                Real-Time Messaging
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or contacts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                No active conversations
              </p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                Click "Contact Owner" or "Contact Finder" on any report to start chatting!
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const otherId = conv.participants.find((p) => p !== user.id) || '';
              const otherDetail = conv.participantDetails?.[otherId];
              const otherUserDoc = allUsers.find((u) => u.id === otherId);
              const isOnline = Boolean(
                otherUserDoc?.isOnline ||
                (otherUserDoc?.lastActive &&
                  new Date().getTime() - new Date(otherUserDoc.lastActive).getTime() < 300000)
              );
              const unread = conv.unreadCount?.[user.id] || 0;
              const isSelected = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full p-3 rounded-2xl transition-all text-left flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {/* Item / Contact Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.itemImageUrl || otherDetail?.avatar || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=200'}
                      alt={conv.itemTitle}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200/50 dark:border-slate-700"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                        isSelected ? 'border-blue-600' : 'border-white dark:border-slate-900'
                      } ${isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {conv.itemTitle}
                      </h4>
                      <span className={`text-[10px] shrink-0 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      <span className="font-semibold">{otherDetail?.name || 'Contact'}: </span>
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {unread > 0 && (
                    <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] shadow-sm animate-bounce">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Active Chat Room */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
        !activeConvId && !isEmbedded ? 'hidden md:flex' : 'flex'
      }`}>
        {activeConv ? (
          <>
            {/* Chat Room Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/40">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative shrink-0">
                  <img
                    src={otherParticipantDetail?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                    alt={otherParticipantDetail?.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      isOtherOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {otherParticipantDetail?.name || 'Campus Contact'}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold capitalize shrink-0">
                      {otherParticipantDetail?.role || 'Verified'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    <span className="flex items-center gap-1">
                      <Circle className={`w-2 h-2 fill-current ${isOtherOnline ? 'text-emerald-500' : 'text-slate-400'}`} />
                      {isOtherOnline ? 'Online now' : 'Offline'}
                    </span>
                    <span>•</span>
                    <span className="truncate">Report: {activeConv.itemTitle}</span>
                  </div>
                </div>
              </div>

              {/* View Item Link */}
              <Link
                to={`/item/${activeConv.itemId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors shrink-0"
              >
                <span>View Item</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20 dark:bg-slate-950/20">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                  <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Start the conversation!
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Coordinate item pickup location, verify features, or schedule a campus security handoff.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[85%] sm:max-w-[70%] ${
                        isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {!isMe && (
                        <img
                          src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                        />
                      )}

                      <div className="space-y-1">
                        {/* Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 shadow-sm ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700'
                          }`}
                        >
                          {/* Image Attachment */}
                          {msg.imageUrl && (
                            <div className="rounded-xl overflow-hidden cursor-pointer bg-slate-900 max-w-xs">
                              <img
                                src={msg.imageUrl}
                                alt="Attachment"
                                onClick={() => setPreviewImageUrl(msg.imageUrl || null)}
                                className="w-full max-h-56 object-cover hover:opacity-90 transition-opacity"
                              />
                            </div>
                          )}

                          {/* Message Text */}
                          {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
                        </div>

                        {/* Timestamp & Read Status */}
                        <div
                          className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <span title={msg.read ? 'Read' : 'Delivered'}>
                              {msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isOtherTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1 px-2 animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                  </div>
                  <span>{otherParticipantDetail?.name || 'Contact'} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Selected Image Preview before sending */}
            {selectedImage && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selectedImage} alt="Upload preview" className="w-12 h-12 object-cover rounded-xl" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Image attached & ready to send
                  </span>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Attach Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="submit"
                disabled={isSending || (!inputText.trim() && !selectedImage)}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-all shadow-md shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <MessageSquare className="w-12 h-12 text-blue-500/40" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Select a conversation to begin chatting
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              All messages are synced in real-time with end-to-end Firestore security.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImageUrl} alt="Full preview" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
