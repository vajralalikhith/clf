import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { Item, User, NotificationItem, ItemStatus } from '../types';
import { INITIAL_ITEMS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { chatService } from '../services/chatService';

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  allUsers: User[];
  authLoading: boolean;
  items: Item[];
  notifications: NotificationItem[];
  unreadChatCount: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, name?: string) => void;
  register: (userData: Partial<User>) => void;
  addItem: (itemData: Omit<Item, 'id' | 'createdAt' | 'viewsCount'>) => Item;
  updateItemStatus: (id: string, status: ItemStatus) => void;
  toggleVerifyItem: (id: string) => void;
  deleteItem: (id: string) => void;
  updateUserRole: (userId: string, role: User['role']) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type'], link?: string, targetUserId?: string) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const isAdmin = Boolean(
    user && (
      user.role === 'admin' ||
      user.role === 'security' ||
      user.isAdmin === true ||
      user.email === 'vajralalikhith@gmail.com' ||
      user.email.toLowerCase().includes('admin')
    )
  );

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('clf_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('clf_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  // Sync user presence status
  useEffect(() => {
    if (!user) return;

    chatService.updateUserPresence(user.id, true);

    const handleBeforeUnload = () => {
      chatService.updateUserPresence(user.id, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const interval = setInterval(() => {
      chatService.updateUserPresence(user.id, true);
    }, 120000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      chatService.updateUserPresence(user.id, false);
    };
  }, [user?.id]);

  // Sync unread chat messages count from Firestore conversations
  useEffect(() => {
    if (!user) {
      setUnreadChatCount(0);
      return;
    }

    const convsRef = collection(db, 'conversations');
    const q = query(convsRef, where('participants', 'array-contains', user.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const count = data.unreadCount?.[user.id] || 0;
        totalUnread += count;
      });
      setUnreadChatCount(totalUnread);
    }, (err) => {
      console.warn('Chat unread count sync warning:', err);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('clf_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUser(userDocSnap.data() as User);
          } else {
            const newUserProfile: User = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Campus Member',
              email: fbUser.email || '',
              studentId: 'STU-' + fbUser.uid.substring(0, 6).toUpperCase(),
              role: 'student',
              department: 'General Campus',
              phone: fbUser.phoneNumber || '(555) 123-4567',
              avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            };
            await setDoc(userDocRef, newUserProfile);
            setUser(newUserProfile);
          }
        } catch (err) {
          console.error('Error fetching/creating user profile in Firestore:', err);
          // Fallback to basic auth object user
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Campus Member',
            email: fbUser.email || '',
            studentId: 'STU-' + fbUser.uid.substring(0, 6).toUpperCase(),
            role: 'student',
            department: 'General Campus',
            phone: '(555) 123-4567',
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
            joinedDate: 'Joined recently',
          });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of items from Firestore
  useEffect(() => {
    const itemsCollectionRef = collection(db, 'items');
    const unsubscribe = onSnapshot(itemsCollectionRef, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreItems = snapshot.docs.map(docSnap => docSnap.data() as Item);
        setItems(prev => {
          // Merge firestore items with initial items to prevent duplicates
          const firestoreIds = new Set(firestoreItems.map(i => i.id));
          const nonDuplicateInitial = INITIAL_ITEMS.filter(i => !firestoreIds.has(i.id));
          return [...firestoreItems, ...nonDuplicateInitial];
        });
      }
    }, (err) => {
      console.warn('Firestore items sync warning:', err);
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of users from Firestore
  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      if (!snapshot.empty) {
        const fetchedUsers = snapshot.docs.map(docSnap => docSnap.data() as User);
        setAllUsers(fetchedUsers);
      }
    }, (err) => {
      console.warn('Firestore users sync warning:', err);
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of notifications from Firestore
  useEffect(() => {
    const notifsRef = collection(db, 'notifications');
    const unsubscribe = onSnapshot(notifsRef, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreNotifs = snapshot.docs.map(docSnap => docSnap.data() as NotificationItem);
        setNotifications(prev => {
          const filtered = firestoreNotifs.filter(n =>
            !n.targetUserId ||
            n.targetUserId === 'all' ||
            (user && n.targetUserId === user.id) ||
            (!user && (!n.targetUserId || n.targetUserId === 'usr_101' || n.targetUserId === 'usr_102'))
          );

          filtered.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });

          const firestoreIds = new Set(filtered.map(n => n.id));
          const nonDupLocal = prev.filter(n => !firestoreIds.has(n.id));
          return [...filtered, ...nonDupLocal];
        });
      }
    }, (err) => {
      console.warn('Firestore notifications sync warning:', err);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clf_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('clf_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('clf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Firebase Auth Methods
  const loginWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    showToast(`Welcome back, ${fbUser.displayName || fbUser.email}!`);
  };

  const registerWithEmail = async (email: string, password: string, userData: Partial<User>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    const displayName = userData.name || email.split('@')[0];
    await updateFirebaseProfile(fbUser, { displayName });

    const newUserProfile: User = {
      id: fbUser.uid,
      name: displayName,
      email: email,
      studentId: userData.studentId || 'STU-' + fbUser.uid.substring(0, 6).toUpperCase(),
      role: userData.role || 'student',
      department: userData.department || 'General Campus',
      phone: userData.phone || '(555) 123-4567',
      avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    try {
      await setDoc(doc(db, 'users', fbUser.uid), newUserProfile);
    } catch (e) {
      console.error('Error saving profile to Firestore:', e);
    }

    setUser(newUserProfile);
    showToast(`Account successfully created for ${newUserProfile.name}!`);
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const fbUser = userCredential.user;
    showToast(`Signed in with Google as ${fbUser.displayName || fbUser.email}`);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    showToast(`Password reset link sent to ${email}`);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    showToast('Signed out successfully.');
  };

  // Legacy fallback handlers if used without password
  const login = (email: string, name?: string) => {
    loginWithEmail(email, 'password123').catch(() => {
      // Fallback for fast demo login if account doesn't exist
      setUser({
        id: 'usr_' + Date.now(),
        name: name || email.split('@')[0],
        email,
        studentId: 'STU-DEMO-001',
        role: 'student',
        department: 'Campus Member',
        phone: '(555) 000-0000',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        joinedDate: 'Demo Mode',
      });
      showToast(`Welcome, ${name || email}!`);
    });
  };

  const register = (userData: Partial<User>) => {
    if (userData.email) {
      registerWithEmail(userData.email, 'password123', userData).catch(() => {
        showToast('Registration complete.');
      });
    }
  };

  const addNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'] = 'system',
    link?: string,
    targetUserId?: string
  ) => {
    const recipientId = targetUserId || (user ? user.id : 'all');
    const notif: NotificationItem = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      targetUserId: recipientId,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type,
      link,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [notif, ...prev]);

    // Save notification to Firestore
    setDoc(doc(db, 'notifications', notif.id), notif).catch(err => {
      console.error('Error saving notification to Firestore:', err);
    });
  };

  const addItem = (itemData: Omit<Item, 'id' | 'createdAt' | 'viewsCount'>): Item => {
    const newItem: Item = {
      ...itemData,
      id: 'item_' + Date.now(),
      createdAt: new Date().toISOString(),
      viewsCount: 1,
    };

    setItems(prev => [newItem, ...prev]);

    // Save report document to Firestore items collection
    setDoc(doc(db, 'items', newItem.id), newItem).catch(err => {
      console.error('Error saving item to Firestore:', err);
    });

    showToast(`New ${newItem.type} item reported: "${newItem.title}"`);

    // 1. Notify reporter
    addNotification(
      'New Report Published',
      `Your ${newItem.type} item "${newItem.title}" is now visible to campus.`,
      'status',
      `/item/${newItem.id}`,
      newItem.reporterId
    );

    // 2. Check for possible matches between lost and found items
    if (newItem.type === 'found') {
      const potentialLostMatches = items.filter(
        i => i.type === 'lost' && i.status === 'active' && (
          i.category === newItem.category ||
          (i.location && newItem.location && i.location.toLowerCase().includes(newItem.location.toLowerCase())) ||
          i.title.toLowerCase().split(' ').some(w => w.length > 3 && newItem.title.toLowerCase().includes(w))
        )
      );

      potentialLostMatches.forEach(lostItem => {
        addNotification(
          'Possible Match Found! 🔍',
          `A found item "${newItem.title}" matching your lost report "${lostItem.title}" was reported at ${newItem.location}.`,
          'match',
          `/item/${newItem.id}`,
          lostItem.reporterId
        );
      });
    } else if (newItem.type === 'lost') {
      const potentialFoundMatches = items.filter(
        i => i.type === 'found' && i.status === 'active' && (
          i.category === newItem.category ||
          (i.location && newItem.location && i.location.toLowerCase().includes(newItem.location.toLowerCase())) ||
          i.title.toLowerCase().split(' ').some(w => w.length > 3 && newItem.title.toLowerCase().includes(w))
        )
      );

      potentialFoundMatches.forEach(foundItem => {
        addNotification(
          'Possible Match Suggestion! 🔍',
          `We found an active report "${foundItem.title}" at ${foundItem.location} that matches your new lost report "${newItem.title}".`,
          'match',
          `/item/${foundItem.id}`,
          newItem.reporterId
        );
      });
    }

    return newItem;
  };

  const updateItemStatus = (id: string, status: ItemStatus) => {
    setItems(prev => {
      const targetItem = prev.find(item => item.id === id);
      if (targetItem && (status === 'claimed' || status === 'resolved')) {
        addNotification(
          'Item Marked as Returned! 🎉',
          `Your item report "${targetItem.title}" has officially been marked as returned and resolved.`,
          'status',
          `/item/${id}`,
          targetItem.reporterId
        );
      }
      return prev.map(item => item.id === id ? { ...item, status } : item);
    });

    updateDoc(doc(db, 'items', id), { status }).catch(err => {
      console.error('Error updating status in Firestore:', err);
    });

    showToast(`Item status updated to ${status}`);
  };

  const toggleVerifyItem = (id: string) => {
    let nextVerified = false;
    setItems(prev => {
      const target = prev.find(i => i.id === id);
      nextVerified = !(target?.verified);

      if (target && nextVerified) {
        addNotification(
          'Report Verified! 🛡️',
          `Your report "${target.title}" has been officially verified by Campus Security & Administration.`,
          'status',
          `/item/${id}`,
          target.reporterId
        );
      }
      return prev.map(item => item.id === id ? { ...item, verified: nextVerified } : item);
    });

    updateDoc(doc(db, 'items', id), { verified: nextVerified }).catch(err => {
      console.error('Error toggling verification in Firestore:', err);
    });

    showToast(`Report ${nextVerified ? 'Verified' : 'Unverified'}`);
  };

  const deleteItem = (id: string) => {
    const targetItem = items.find(i => i.id === id);
    if (targetItem) {
      addNotification(
        'Report Removed',
        `Your report "${targetItem.title}" was removed by an administrator.`,
        'system',
        '/',
        targetItem.reporterId
      );
    }
    setItems(prev => prev.filter(item => item.id !== id));
    deleteDoc(doc(db, 'items', id)).catch(err => {
      console.error('Error deleting item from Firestore:', err);
    });
    showToast('Report deleted successfully');
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      if (user && user.id === userId) {
        setUser(prev => prev ? { ...prev, role } : null);
      }
      showToast(`User role updated to ${role}`);
    } catch (err) {
      console.error('Error updating user role in Firestore:', err);
      showToast('Failed to update user role');
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notifications.forEach(n => {
      if (!n.read) {
        updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {});
      }
    });
    showToast('All notifications marked as read');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
      } catch (err) {
        console.error('Error updating profile in Firestore:', err);
      }
    }
    showToast('Profile updated successfully');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAdmin,
        allUsers,
        authLoading,
        items,
        notifications,
        unreadChatCount,
        darkMode,
        toggleDarkMode,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        sendPasswordReset,
        logout,
        login,
        register,
        addItem,
        updateItemStatus,
        toggleVerifyItem,
        deleteItem,
        updateUserRole,
        markNotificationAsRead,
        markAllNotificationsRead,
        addNotification,
        updateProfile,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
