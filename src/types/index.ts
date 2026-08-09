export type ItemType = 'lost' | 'found';

export type ItemCategory = 
  | 'Electronics'
  | 'Books & Notes'
  | 'Cards & IDs'
  | 'Keys'
  | 'Bags & Backpacks'
  | 'Clothing & Shoes'
  | 'Accessories'
  | 'Sports & Gym'
  | 'Other';

export type ItemStatus = 'active' | 'pending' | 'claimed' | 'resolved';

export interface Item {
  id: string;
  title: string;
  type: ItemType;
  category: ItemCategory;
  status: ItemStatus;
  description: string;
  location: string; // Campus location name
  building?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  imageUrl?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  reporterId: string;
  reporterRole: 'student' | 'faculty' | 'staff' | 'security' | 'admin';
  reward?: string;
  verificationQuestion?: string; // Secret detail question to prove ownership
  color?: string;
  brand?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  createdAt: string;
  viewsCount?: number;
  verified?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: 'student' | 'faculty' | 'staff' | 'security' | 'admin';
  department: string;
  phone: string;
  avatar: string;
  joinedDate: string;
  isAdmin?: boolean;
  isOnline?: boolean;
  lastActive?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImageUrl?: string;
  itemType?: ItemType;
  participants: string[];
  participantDetails: {
    [userId: string]: {
      name: string;
      avatar: string;
      role?: string;
      email?: string;
    };
  };
  lastMessage: string;
  lastMessageSenderId: string;
  updatedAt: string;
  unreadCount?: {
    [userId: string]: number;
  };
  typingStatus?: {
    [userId: string]: boolean;
  };
}

export interface ClaimRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  claimerId: string;
  claimerName: string;
  claimerEmail: string;
  claimerPhone: string;
  proofDescription: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  targetUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'match' | 'claim' | 'status' | 'system';
  link?: string;
  createdAt?: string;
}

export interface ItemComment {
  id: string;
  itemId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  text: string;
  createdAt: string;
}
