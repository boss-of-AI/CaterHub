import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// cors: '*' allows all three of your frontends to connect to this one hub
@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`📡 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  /**
   * Broadcasts a live notification to a specific Caterer
   */
  notifyCaterer(catererId: string, payload: any) {
    this.server.emit(`caterer-${catererId}`, payload);
  }

  /**
   * Broadcasts a live notification to all connected Admins
   */
  notifyAdmins(payload: any) {
    this.server.emit('admin-alerts', payload);
  }

  /**
   * Broadcasts to a specific Customer
   */
  notifyCustomer(customerId: string, payload: any) {
    this.server.emit(`customer-${customerId}`, payload);
  }
}