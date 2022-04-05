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
import { MessageI } from '..//model/message.interface';
import { JoinedRoomI } from '..//model/joined-room.interface';
import { RoomEntity } from '../model/room.entity';
import { ConnectedUserService } from '../service/connected-user/connected-user.service';
import { ConnectedUserI } from 'src/chat/model/connected.user.interface';
import { JoinedRoomService } from '../service/joined-room/joined-room.service';
import { MessageService } from '../service/message/message.service';
import { UserDto } from 'src/entities/users.dto';
import { comparePassword } from 'src/utils/bcrypt';
 

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
     private roomSerice: RoomService,
     private connectedUserService: ConnectedUserService,
     private joinedRoomService: JoinedRoomService,
     private messageService: MessageService,
    ) { }
  
   
   
   @WebSocketServer() server: Server;
   
   async onModuleInit() {
     await this.connectedUserService.deleteAll();
     await this.joinedRoomService.deleteAll();
   }


 
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
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    }
    catch {
      return this.disconnect(socket);
    }
  }
   
  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {

    // TODO : Check validity of all users before create the room

    const createRoom: RoomI = await this.roomSerice.createRoom(room, socket.data.user);

    for (const user of createRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomSerice.getRoomForUser(user.id, { page: 1, limit: 100 })

      for (const connection of connections) {
        await this.server.to(connection.socketID).emit('rooms', rooms)
      }
    }
  }
   
  @SubscribeMessage('blockUser')
  async onBlockUser(socket: Socket, room: RoomI){}
   
  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI, password: string) {

    if (room.protected == true) {
      const matched = comparePassword(password, room.password);
      if (!matched) {
        socket.emit('WrongPassword', new UnauthorizedException());
      }
    }
    
    // Find previous Room Messages
    const messages = await this.messageService.findMessageForRoom(room, { page: 1, limit: 100 });
    // Save Connection to Room in DB
    await this.joinedRoomService.create({ socketID: socket.id, user: socket.data.user, room });
    // Send Last Message to User
    await this.server.to(socket.id).emit('messages', messages);
  }
   
  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket, room: RoomI) {

    // Remove connection for Joined Room
    await this.joinedRoomService.deleteBySocketID(socket.id);
  }
   
  @SubscribeMessage('addAdmins')
  async addAdminsToRoom(socket: Socket, room: RoomI, newAdmins: UserDto[]) {

    // Add admins to the Rooms
    try {
      await this.roomSerice.addAdminsToRoom(room, newAdmins, socket.data.user);
    }
    catch {
      socket.emit('Error', new UnauthorizedException());
    }
  }
   
  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {


    const createdMessage: MessageI = await this.messageService.create({ ...message, user: socket.data.user });


    const room: RoomI = await this.roomSerice.getRoom(createdMessage.room.id);

    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    // Send New Message to all joineds Users (online on the room)
    for (const user of joinedUsers) {
      await this.server.to(user.socketID).emit('messageAdded', createdMessage);
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
   
 async afterInit() {}
   
 }

