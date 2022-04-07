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
import { UserInterface } from 'src/entities/users.interface';
import { UserRoomService } from '../service/user-room/user-room.service';
import { UserRoomRole } from '../model/user-room.entity';

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
     private roomService: RoomService,
     private connectedUserService: ConnectedUserService,
     private joinedRoomService: JoinedRoomService,
     private messageService: MessageService,
     private userRoomService: UserRoomService
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
        const rooms = await this.roomService.getRoomForUser(user.id, { page: 1, limit: 100 })
        
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

  async emitRoomsForConnectedUsers(room: RoomI) {
    const users = await this.userRoomService.getUsersForRoom(room);
    for (const user of users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomForUser(user.id, { page: 1, limit: 100 })
      for (const connection of connections) {
        await this.server.to(connection.socketID).emit('rooms', rooms)
      }
    }
  }

  async emitRolesForConnectedUsers(room: RoomI) {
    var roles = await this.userRoomService.getRoles(room);
    const users = await this.userRoomService.getUsersForRoom(room);
    for (const user of users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      for (const connection of connections) {
        await this.server.to(connection.socketID).emit('getRoles', roles)
      }
    }
  }

  async createUserRooms(room: RoomI, owner: UserDto, users: UserDto[]) {
    for (const user of users) {
      if (user.id == owner.id)
        await this.userRoomService.create({ user: user, room: room, role: UserRoomRole.OWNER });
      else
        await this.userRoomService.create({ user: user, room: room, role: UserRoomRole.LAMBDA });
    }
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    // TODO : Check validity of all users before create the room
    const newRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);
    await this.createUserRooms(newRoom, socket.data.user, newRoom.users);
    await this.emitRoomsForConnectedUsers(newRoom);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, { room, password }) {
    if (room.protected == true) {
       if (!password) {
         socket.emit('WrongPassword', new UnauthorizedException());
         return;
       }
      const matched = comparePassword(password, room.password)
       if (!matched) {
         socket.emit('WrongPassword', new UnauthorizedException());
         return;
       }
    }
    // Find previous Room Messages
    const messages = await this.messageService.findMessageForRoom(room, { page: 1, limit: 100 });
     // check if already join (for if the client switch between)
    var found = await this.joinedRoomService.findByRoomSocket(socket.data.user, room, socket.id); // check socket id too ?
    // Save Connection to Room in DB
    if (found.length == 0)
      await this.joinedRoomService.create({ socketID: socket.id, user: socket.data.user, room: room });
    // Send Last Message to User
    await this.server.to(socket.id).emit('messages', messages);
  }
   
  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket, room: RoomI) {
    // Remove connection for Joined Room
    await this.joinedRoomService.deleteBySocketID(socket.id);
  }
      
  //////////////////////////////////////// PASSWORD FUNCTIONS ////////////////////////////////////////////////////////////

  @SubscribeMessage('deletePassword')
  async onDeletePassword(socket: Socket, { room, modifier }) {
    await this.roomService.deletePassword(room, modifier);
    this.emitRoomsForConnectedUsers(room);
    return await this.server.to(socket.id).emit('updateSelectedRoom', room);
  }

  @SubscribeMessage('modifyPassword')
  async onModifyPassword(socket: Socket, { room, modifier, password }) {
      await this.roomService.modifyPassword(room, modifier, password);
      this.emitRoomsForConnectedUsers(room);
      return await this.server.to(socket.id).emit('modifyingPasswordSuccess', room);
  }

  @SubscribeMessage('addPassword')
  async onAddPassword(socket: Socket, { room, modifier, password }) {
    await this.roomService.addPassword(room, modifier, password);
    this.emitRoomsForConnectedUsers(room);
    return await this.server.to(socket.id).emit('addingPasswordSuccess', room);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  @SubscribeMessage('getRoles')
  async onGetRoles(socket: Socket, room: RoomI) {

    var roles = await this.userRoomService.getRoles(room);
    return await this.server.to(socket.id).emit('getRoles', roles);
  }

  @SubscribeMessage('getUsers')
  async onGetUsers(socket: Socket, room: RoomI, users: UserDto[]) {
    users = await this.userRoomService.getUsersForRoom(room);
    return this.server.to(socket.id).emit('getUsers', users)
  }

  @SubscribeMessage('updateRole')
  async onUpdateRole(socket: Socket, { room, user, modifier, newRole }) {
    try {
      await this.userRoomService.updateRole(room, user, modifier, newRole);
      this.emitRolesForConnectedUsers(room);
    }
    catch {
      socket.emit('Error', new UnauthorizedException());
    }
  }

  @SubscribeMessage('blockUser')
  async onBlockUser(socket: Socket, room: RoomI){}

  //////////////////////////////////////// MESSAGES FUNCTIONS ////////////////////////////////////////////////////////////
 
  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {

    const createdMessage: MessageI = await this.messageService.create({ ...message, user: socket.data.user });
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    // Send New Message to all joineds Users (online on the room)
    for (const user of joinedUsers) {
      await this.server.to(user.socketID).emit('messageAdded', createdMessage);
    }
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
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

