import { requestNotificationPermission, onMessageListener } from '../config/firebase';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async initialize(): Promise<string | null> {
    try {
      this.token = await requestNotificationPermission();
      if (this.token) {
        console.log('Notification token:', this.token);
        this.setupMessageListener();
      }
      return this.token;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return null;
    }
  }

  private setupMessageListener() {
    onMessageListener().then((payload: any) => {
      console.log('Message received:', payload);
      
      // Show browser notification
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/favicon.ico',
          tag: 'sads-notification'
        });
      }
    });
  }

  public async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Mock SMS sending - replace with actual SMS service (Twilio, etc.)
      console.log(`SMS to ${phoneNumber}: ${message}`);
      
      // In a real implementation, you would call your backend API
      // which would then use Twilio or another SMS service
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sads_token')}`
        },
        body: JSON.stringify({
          phoneNumber,
          message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  public async sendPushNotification(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sads_token')}`
        },
        body: JSON.stringify({
          userId,
          notification
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  public getToken(): string | null {
    return this.token;
  }
}

export const notificationService = NotificationService.getInstance();



















