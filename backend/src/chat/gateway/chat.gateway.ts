import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
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

    console.log(payload)
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
 
  async handleConnection(client: Socket, ...args: any[]) {

    // try {
    //   console.log('check token')
    //   console.log(client.handshake.headers.access_token)

      // const decodedToken = await this.authService.verifyToken(client.handshake.headers.Authorization);
    //   const user = await this.userService.findById(decodedToken.user.id);
    //   if (!user) {
    //     return this.disconnect(client);
    //   }
    //   else {
    //     console.log('logged!!!')
        this.server.emit('msgToClient', args)
    //   }
    // }
    // catch {
    //   console.log('Unvailable client TOKEN')

    //   return this.disconnect(client);

    // }
    
    // console.log('connection')

   this.logger.log(`Client connected: ${client.id}`);
  }

  private disconnect(client: Socket) {
    // client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }
}