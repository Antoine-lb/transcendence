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
import { RoomService } from '../service/room-service/room/room.service';
import { RoomI } from '..//model/room.interface';
import { RoomEntity } from '../model/room.entity';
 
 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
 
  constructor(private authService: AuthService, private userService: UsersService, private roomSerice: RoomService){}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
 
  async handleConnection(client: Socket, payload: string){

    try {
      const decodedToken = await this.authService.verifyToken(client.handshake.headers.authorization);

      console.log(decodedToken)
      
      const user = await this.userService.findById(decodedToken.id);

      if (!user) {
        return this.disconnect(client);
      }
      else {

        console.log(user)
        client.data.user = user;
        const rooms = this.roomSerice.getRoomForUser(user.id, { page: 1, limit: 10 })
        
        // Only emit rooms to the specific connected client
        return this.server.to(client.id).emit('rooms', rooms)
        // this.server.emit('msgToClient', payload);
      }
    }
    catch {
      console.log("catched")
      return this.disconnect(client);
    }
  }
   
  @SubscribeMessage('createRoom')
  async onCreateRoom(client: Socket, room: RoomEntity): Promise<RoomI> {
    return this.roomSerice.createRoom(room, client.data.user)
  }
 
  handleDisconnect(client: Socket) {
    console.log('dicornnect')
    this.logger.log(`Client disconnected: ${client.id}`);
    client.disconnect()
  }

  private disconnect(client: Socket) {
    client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }
}