import { PUBLIC_API_BASE_URL } from '$env/static/public';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info';
  timestamp: string;
  read: boolean;
  data?: any;
}

export interface SSEConnection {
  eventSource: EventSource | null;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

class NotificationSSEService {
  private connection: SSEConnection = {
    eventSource: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
  };

  private listeners: ((notification: Notification) => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Conecta ao endpoint SSE de notificações
   */
  connect(token: string): void {
    if (this.connection.eventSource) {
      this.disconnect();
    }

    const sseUrl = new URL('/notifys/sse', PUBLIC_API_BASE_URL);
    
    // Adiciona o token como query parameter ou header
    const eventSource = new EventSource(`${sseUrl.toString()}?token=${encodeURIComponent(token)}`);
    
    this.connection.eventSource = eventSource;
    this.connection.isConnected = true;
    this.connection.reconnectAttempts = 0;

    // Evento de conexão estabelecida
    eventSource.onopen = () => {
      console.log('SSE connection opened');
      this.connection.isConnected = true;
      this.connection.reconnectAttempts = 0;
    };

    // Evento de erro
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.connection.isConnected = false;
      this.handleReconnect(token);
    };

    // Evento de notificação
    eventSource.addEventListener('notification', (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        this.notifyListeners(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    // Evento de heartbeat (opcional)
    eventSource.addEventListener('heartbeat', (event) => {
      console.log('SSE heartbeat received');
    });
  }

  /**
   * Desconecta do endpoint SSE
   */
  disconnect(): void {
    if (this.connection.eventSource) {
      this.connection.eventSource.close();
      this.connection.eventSource = null;
    }
    this.connection.isConnected = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Adiciona um listener para receber notificações
   */
  addListener(callback: (notification: Notification) => void): () => void {
    this.listeners.push(callback);
    
    // Retorna função para remover o listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica todos os listeners sobre uma nova notificação
   */
  private notifyListeners(notification: Notification): void {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Tenta reconectar em caso de erro
   */
  private handleReconnect(token: string): void {
    if (this.connection.reconnectAttempts >= this.connection.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.connection.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.connection.reconnectAttempts), 30000); // Exponential backoff, max 30s

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.connection.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect(token);
    }, delay);
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.connection.isConnected;
  }

  /**
   * Obtém informações da conexão
   */
  getConnectionInfo(): SSEConnection {
    return { ...this.connection };
  }
}

// Instância singleton do serviço
export const notificationSSEService = new NotificationSSEService();
