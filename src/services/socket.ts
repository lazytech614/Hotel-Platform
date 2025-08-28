import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join-room', room);
    }
  }

  leaveRoom(room: string) {
    if (this.socket) {
      this.socket.emit('leave-room', room);
    }
  }

  onOrderUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('order-update', callback);
    }
  }

  emitOrderUpdate(orderId: string, status: string) {
    if (this.socket) {
      this.socket.emit('order-status-update', { orderId, status });
    }
  }
}

export default new SocketService();
