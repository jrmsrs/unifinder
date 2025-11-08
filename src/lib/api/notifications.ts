import { PUBLIC_API_BASE_URL } from '$env/static/public';

/**
 * Interface baseada no formato da API
 */
export interface Notification {
  id: string;
  message: string;
  user_id: string;
  created_at: string;
  delivered: boolean;
}

/**
 * Interface para a resposta da API de listagem
 */
export interface NotificationsResponse {
  items: Notification[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const baseNotificationsApiURL = new URL('/notifys', PUBLIC_API_BASE_URL);

/**
 * Busca notificações do usuário
 */
export const getNotifications = async (params?: { page?: number; size?: number; token?: string }): Promise<NotificationsResponse> => {
  const dataTransformed = new URLSearchParams();
  if (params?.page) dataTransformed.append('page', params.page.toString());
  if (params?.size) dataTransformed.append('size', params.size.toString());

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (params?.token) {
      headers['Authorization'] = `Bearer ${params.token}`;
    }

    const res = await fetch(`${baseNotificationsApiURL}?${dataTransformed.toString()}`, {
      method: 'GET',
      headers
    });

    if (!res.ok) {
      console.error('API error:', res.status, res.statusText);
      return {
        items: [],
        total: 0,
        page: 1,
        size: params?.size || 50,
        pages: 0
      };
    }

    const response = await res.json();
    return response;
  } catch (error: any) {
    console.error('API error:', error?.message);
    return {
      items: [],
      total: 0,
      page: 1,
      size: params?.size || 50,
      pages: 0
    };
  }
};

/**
 * Marca uma notificação como lida
 */
export const markNotificationAsRead = async (notificationId: string, token: string): Promise<boolean> => {
  try {
    const url = `${baseNotificationsApiURL}/${notificationId}/mark-as-read`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error:', res.status, res.statusText, errorText);
      return false;
    }

    const response = await res.json().catch(() => ({}));
    return true;
  } catch (error: any) {
    console.error('API error:', error?.message, error);
    return false;
  }
};

/**
 * Marca todas as notificações como lidas
 */
export const markAllNotificationsAsRead = async (token: string): Promise<boolean> => {
  try {
    const url = `${baseNotificationsApiURL}/mark-all-as-read`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error:', res.status, res.statusText, errorText);
      return false;
    }

    const response = await res.json().catch(() => ({}));
    return true;
  } catch (error: any) {
    console.error('API error:', error?.message, error);
    return false;
  }
};
