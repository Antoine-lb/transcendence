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
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
 
 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
 export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 
  constructor(private authService: AuthService, private userService: UsersService){}
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
    console.log('dicornnect')
    this.logger.log(`Client disconnected: ${client.id}`);
    client.disconnect()
  }
 
  handleConnection(client: Socket, ...args: any[]) {
    console.log('connection')

   this.logger.log(`Client connected: ${client.id}`);
  }
 }
