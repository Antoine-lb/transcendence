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
import { UserDto } from 'src/entities/users.dto';
import { comparePassword } from 'src/utils/bcrypt';
 

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
    ) { }
  
   
   
   @WebSocketServer() server: Server;
   
   async onModuleInit() {
   }


 
  async handleConnection(socket: Socket, payload: string) {

    console.log('GAME!');
    socket.emit('test', {data: "hello form server"});

  }
   
  @SubscribeMessage('createGame')
  async onCreateRoom(socket: Socket) {

    // TODO : Check validity of all users before create the room

    // const createRoom: RoomI = await this.roomSerice.createRoom(room, socket.data.user);

    // for (const user of createRoom.users) {
    //   const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
    //   const rooms = await this.roomSerice.getRoomForUser(user.id, { page: 1, limit: 100 })

    //   for (const connection of connections) {
    //     await this.server.to(connection.socketID).emit('rooms', rooms)
    //   }
    // }
  }
   
   
  @SubscribeMessage('joinGame')
  async onJoinRoom(socket: Socket) {

    // if (room.protected == true) {
    //   const matched = comparePassword(password, room.password)
    //   if (!matched) {
    //     socket.emit('WrongPassword', new UnauthorizedException());
    //   }
    // }
    
    // Find previous Room Messages
    // const messages = await this.messageService.findMessageForRoom(room, { page: 1, limit: 100 });
    // // Save Connection to Room in DB
    // await this.joinedRoomService.create({ socketID: socket.id, user: socket.data.user, room });
    // // Send Last Message to User
    // await this.server.to(socket.id).emit('messages', messages);
  }
   
  @SubscribeMessage('leaveGame')
  async onLeaveRoom(socket: Socket) {

    // Remove connection for Joined Room
    // await this.joinedRoomService.deleteBySocketID(socket.id);
  }
   
     
   
  async handleDisconnect(socket: Socket) {
    // remove client to connected repository
    socket.disconnect()
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }
   
 async afterInit() {}
   
 }

