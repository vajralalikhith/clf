import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Conversation, ChatMessage, Item, User } from '../types';

export const chatService = {
  /**
   * Get or create a chat conversation between current user and item reporter/finder
   */
  async getOrCreateConversation(item: Item, currentUser: User): Promise<string> {
    const reporterId = item.reporterId;
    if (currentUser.id === reporterId) {
      throw new Error("You cannot start a chat with yourself.");
    }

    // Deterministic conversation ID for item + participants
    const sortedParticipants = [currentUser.id, reporterId].sort();
    const conversationId = `chat_${item.id}_${sortedParticipants.join('_')}`;

    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);

    if (convSnap.exists()) {
      return conversationId;
    }

    // Prepare participant details
    const participantDetails: Conversation['participantDetails'] = {
      [currentUser.id]: {
        name: currentUser.name,
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        role: currentUser.role,
        email: currentUser.email
      },
      [reporterId]: {
        name: item.contactName || 'Item Reporter',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        role: item.reporterRole || 'student',
        email: item.contactEmail
      }
    };

    const newConversation: Conversation = {
      id: conversationId,
      itemId: item.id,
      itemTitle: item.title,
      itemImageUrl: item.imageUrl,
      itemType: item.type,
      participants: sortedParticipants,
      participantDetails,
      lastMessage: `Conversation started regarding ${item.title}`,
      lastMessageSenderId: currentUser.id,
      updatedAt: new Date().toISOString(),
      unreadCount: {
        [currentUser.id]: 0,
        [reporterId]: 0
      },
      typingStatus: {
        [currentUser.id]: false,
        [reporterId]: false
      }
    };

    await setDoc(convRef, newConversation);
    return conversationId;
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    sender: User,
    text: string,
    imageUrl?: string
  ): Promise<void> {
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
      throw new Error('Conversation does not exist.');
    }

    const conversationData = convSnap.data() as Conversation;
    const recipientId = conversationData.participants.find(id => id !== sender.id) || sender.id;

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageData: Omit<ChatMessage, 'id'> = {
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text: text.trim(),
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
      read: false
    };

    await addDoc(messagesRef, messageData);

    // Update conversation metadata
    const currentUnread = conversationData.unreadCount?.[recipientId] || 0;
    const lastMsgText = imageUrl ? '📷 [Image attachment]' : text.trim();

    await updateDoc(convRef, {
      lastMessage: lastMsgText,
      lastMessageSenderId: sender.id,
      updatedAt: new Date().toISOString(),
      [`unreadCount.${recipientId}`]: currentUnread + 1,
      [`typingStatus.${sender.id}`]: false
    });
  },

  /**
   * Update typing status for a user in a conversation
   */
  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        [`typingStatus.${userId}`]: isTyping
      });
    } catch (err) {
      console.warn('Error setting typing status:', err);
    }
  },

  /**
   * Mark all unread messages in a conversation as read for a given user
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      
      // Reset unread count for current user
      await updateDoc(convRef, {
        [`unreadCount.${userId}`]: 0
      });

      // Query unread messages sent by other participants
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef, where('read', '==', false));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(docSnap => {
          if (docSnap.data().senderId !== userId) {
            batch.update(docSnap.ref, { read: true });
          }
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Error marking messages as read:', err);
    }
  },

  /**
   * Update user online presence status in Firestore
   */
  async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isOnline,
        lastActive: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error updating user presence:', err);
    }
  }
};
