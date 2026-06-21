import { haptics } from './HapticService';

export interface RichNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai' | 'finance';
  layout?: 'default' | 'chart' | 'progress' | 'action_list' | 'ai_code';
  icon?: string;
  sound?: boolean;
  duration?: number;
  data?: any; 
  actionLabel?: string;
  onAction?: () => void;
}

type NotificationListener = (notification: RichNotification) => void;

class NotificationService {
  private listeners: NotificationListener[] = [];
  private permissionRequested: boolean = false;

  async requestPermission() {
    if ('Notification' in window && !this.permissionRequested) {
      this.permissionRequested = true;
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (e) {
        console.warn('Erro ao solicitar permissão de notificação');
        return false;
      }
    }
    return false;
  }

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Dispara uma notificação multissensorial
   */
  notify(notification: Omit<RichNotification, 'id'>) {
    const fullNotification: RichNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9)
    };

    // 1. Feedback Hápico e Sonoro conforme o tipo
    if (notification.sound !== false) {
      switch (notification.type) {
        case 'success': haptics.success(); break;
        case 'info': haptics.notification(); break;
        case 'error': haptics.error(); break;
        case 'ai': haptics.open(); break;
        default: haptics.mediumClick();
      }
    }

    // 2. Notificação Interna (Rich Experience)
    this.listeners.forEach(listener => listener(fullNotification));

    // 3. Notificação de Sistema (Se tiver permissão e app em background)
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification(fullNotification.title, {
        body: fullNotification.body,
        icon: '/pwa-192x192.png'
      });
    }
  }
}

export const notificationService = new NotificationService();
