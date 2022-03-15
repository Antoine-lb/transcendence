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
import { RoomService } from '../service/room-service/room.service';
import { RoomI } from '..//model/room.interface';
import { RoomEntity } from '../model/room.entity';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { ConnectedUserI } from 'src/chat/model/connected.user.interface';
 

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
     private roomSerice: RoomService,
     private connectedUserService: ConnectedUserService
    ) { }
  
   
   
  @WebSocketServer() server: Server;
 
  async handleConnection(socket: Socket, payload: string) {

    try {
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization);

      const user = await this.userService.findById(decodedToken.id);

      if (!user) {
        return this.disconnect(socket);
      }
      else {

        socket.data.user = user;
        const rooms = await this.roomSerice.getRoomForUser(user.id, { page: 1, limit: 100 })
        
        // Save connection to DB 
        await this.connectedUserService.create({ socketID: socket.id, user });


        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms)
      }
    }
    catch {
      return this.disconnect(socket);
    }
  }
   
  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomEntity) {
    const createRoom: RoomI = await this.roomSerice.createRoom(room, socket.data.user);

    for (const user of createRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomSerice.getRoomForUser(user.id, { page: 1, limit: 100 })

      for (const connection of connections) {
        await this.server.to(connection.socketID).emit('rooms', rooms)
      }
    }
  }
 
  async handleDisconnect(socket: Socket) {
    // remove client to connected repository
    await this.connectedUserService.deleteBySocketID(socket.id);
    socket.disconnect()
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
}