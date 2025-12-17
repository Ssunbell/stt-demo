import { ClientMessage, ServerMessage } from '../types';
import { logger } from '../utils/logger';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;
  private url: string;
  private messageHandler?: (message: ServerMessage) => void;
  private connectionHandler?: (connected: boolean) => void;
  private errorHandler?: (error: string) => void;
  private isManualDisconnect = false; // 수동 종료 여부 플래그

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 새로운 연결 시작 시 수동 종료 플래그 초기화
        this.isManualDisconnect = false;
        
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          logger.ws.connected();
          this.reconnectAttempts = 0;
          this.connectionHandler?.(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: ServerMessage = JSON.parse(event.data);
            logger.ws.received(message);
            this.messageHandler?.(message);
          } catch (error) {
            logger.error('Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          logger.ws.error(error);
          this.errorHandler?.('WebSocket 연결 오류가 발생했습니다.');
        };

        this.ws.onclose = () => {
          logger.ws.disconnected();
          this.connectionHandler?.(false);
          
          // 수동 종료가 아닌 경우에만 재연결 시도
          if (!this.isManualDisconnect) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        logger.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect().catch((error) => {
          logger.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay);
    } else {
      this.errorHandler?.('최대 재연결 횟수를 초과했습니다. 다시 시도해주세요.');
    }
  }

  send(message: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      logger.ws.sent(message);
      this.ws.send(JSON.stringify(message));
    } else {
      logger.error('WebSocket is not connected');
      this.errorHandler?.('WebSocket이 연결되지 않았습니다.');
    }
  }

  disconnect() {
    logger.info('Disconnecting WebSocket...');
    
    // 수동 종료 플래그 설정
    this.isManualDisconnect = true;
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // 재연결 중지
    this.reconnectAttempts = this.maxReconnectAttempts;
    
    // 연결 상태 핸들러 즉시 호출
    this.connectionHandler?.(false);
    
    logger.info('WebSocket disconnected successfully');
  }

  onMessage(handler: (message: ServerMessage) => void) {
    this.messageHandler = handler;
  }

  onConnection(handler: (connected: boolean) => void) {
    this.connectionHandler = handler;
  }

  onError(handler: (error: string) => void) {
    this.errorHandler = handler;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

