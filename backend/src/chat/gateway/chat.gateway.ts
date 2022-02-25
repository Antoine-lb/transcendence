import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
 import { Logger } from '@nestjs/common';
 import { Socket, Server } from 'socket.io';
 
 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
 export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
 
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {

    console.log('handle')
   this.server.emit('msgToClient', payload);
  }
 
  afterInit(server: Server) {
    console.log('after init')

   this.logger.log('Init');
  }
 
  handleDisconnect(client: Socket) {
    console.log('sicornnect')

   this.logger.log(`Client disconnected: ${client.id}`);
  }
 
  handleConnection(client: Socket, ...args: any[]) {
    console.log('connection')

   this.logger.log(`Client connected: ${client.id}`);
  }
 }
