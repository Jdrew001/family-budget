import { Injectable, OnModuleInit } from '@nestjs/common';
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
      origin: '*',
    },
    
})
export class WebSocketService {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: Socket, ...args: any[]): any {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket): any {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    sendEventToClients(eventName: string, payLoad: any): void {
      this.server.emit(eventName, payLoad);
    }
}

