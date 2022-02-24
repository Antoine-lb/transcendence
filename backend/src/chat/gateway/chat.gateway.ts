import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer} from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { Socket, Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/users.entity';
import { runInThisContext } from 'vm';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({cors: {origin: 'https://hoppscotch.io'}})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;
  
  title: string[] = [];

  constructor (private authService: AuthService, private userService: UsersService){}
 
  async handleConnetion(socket: Socket) {

    try {
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization)
      const user: UserEntity = await this.userService.findById(decodedToken.user.id)

      if (!user) {
        return this.disconnect(socket);
      }
      else {
        this.title.push('Value ' + Math.random().toString());
        this.server.emit('message', this.title);
      }
    }
    catch { return this.disconnect(socket); }
    
    console.log('On Connect');
  }
  handleDisconnect(socket: Socket) {
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
}
