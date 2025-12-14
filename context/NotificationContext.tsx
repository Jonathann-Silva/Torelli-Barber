import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { Notification, UserRole } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  sendNotification: (recipientId: string, title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let query = db.collection('notifications');
    const targetId = user.role === UserRole.ADMIN ? 'admin' : user.id;

    // Use onSnapshot for real-time updates
    const unsubscribe = query
      .where('recipientId', '==', targetId)
      .onSnapshot((snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[];
        
        // Sort by createdAt desc (client-side)
        notifs.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        // Limit to 20 recent (client-side)
        setNotifications(notifs.slice(0, 20));
        setLoading(false);
      }, (error) => {
        // Handle permission errors gracefully so app doesn't break
        console.warn("Error fetching notifications (possibly permissions):", error);
        setNotifications([]);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const sendNotification = async (recipientId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    try {
      await db.collection('notifications').add({
        recipientId,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
        type
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await db.collection('notifications').doc(notificationId).update({ read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = db.batch();
      let hasUpdates = false;
      notifications.forEach(n => {
        if (!n.read) {
          const ref = db.collection('notifications').doc(n.id);
          batch.update(ref, { read: true });
          hasUpdates = true;
        }
      });
      if (hasUpdates) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, sendNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};