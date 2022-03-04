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
import { runInThisContext } from 'vm';
 
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
  async handleConnection(client: Socket, payload: string){

    try {
      const decodedToken = await this.authService.verifyToken(client.handshake.headers.authorization);


      console.log('-->' )
      console.log(decodedToken)
      
      const user = await this.userService.findById(decodedToken.id);

      if (!user) {
        console.log("no user")
        return this.disconnect(client);
      }
      else {
        this.server.emit('msgToClient', payload);
      }
    }
    catch {
      console.log("catched")
      return this.disconnect(client);
    }

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

  private disconnect(client: Socket) {
    // client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }
}