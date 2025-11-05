import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Notification } from '$lib/api/notifications';

// Store para as notificações
export const notifications = writable<Notification[]>([]);

// Store derivado para notificações não lidas (não entregues)
export const unreadNotifications = derived(notifications, ($notifications) =>
  $notifications.filter((n) => !n.delivered)
);

// Store derivado para contagem de notificações não lidas
export const unreadCount = derived(unreadNotifications, ($unreadNotifications) => $unreadNotifications.length);

// Store derivado para as notificações mais recentes (últimas 10)
export const recentNotifications = derived(notifications, ($notifications) =>
  [...$notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
);

// Funções para gerenciar notificações
export const notificationActions = {
  /**
   * Adiciona uma nova notificação
   */
  addNotification(notification: Notification): void {
    notifications.update((current) => {
      // Verifica se a notificação já existe (evita duplicatas)
      const exists = current.some((n) => n.id === notification.id);
      if (exists) return current;

      return [notification, ...current];
    });
  },

  /**
   * Marca uma notificação como lida
   */
  markAsRead(notificationId: string): void {
    notifications.update((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, delivered: true } : notification
      )
    );
  },

  /**
   * Marca todas as notificações como lidas
   */
  markAllAsRead(): void {
    notifications.update((current) => current.map((notification) => ({ ...notification, delivered: true })));
  },

  /**
   * Remove uma notificação
   */
  removeNotification(notificationId: string): void {
    notifications.update((current) => current.filter((notification) => notification.id !== notificationId));
  },

  /**
   * Limpa todas as notificações
   */
  clearAll(): void {
    notifications.set([]);
  },

  /**
   * Remove notificações antigas (mais de 30 dias)
   */
  clearOldNotifications(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    notifications.update((current) => current.filter((notification) => new Date(notification.created_at) > thirtyDaysAgo));
  }
};

// Persistência no localStorage (apenas no browser)
if (browser) {
  // Carrega notificações do localStorage na inicialização
  const savedNotifications = localStorage.getItem('notifications');
  if (savedNotifications) {
    try {
      const parsed = JSON.parse(savedNotifications);
      notifications.set(parsed);
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }

  // Salva notificações no localStorage sempre que mudarem
  notifications.subscribe((current) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(current));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  });
}
