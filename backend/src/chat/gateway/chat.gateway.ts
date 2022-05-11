import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
import { Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
import { FriendsService } from 'src/friends/friends.service';

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
     private friendsService: FriendsService,
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
        const myRooms = await this.userRoomService.getAllRoomsForUser(user)
        // Save connection to database 
        await this.connectedUserService.create({ socketID: socket.id, user });
        // Only emit rooms to the specific connected client
        this.server.to(socket.id).emit('rooms', myRooms)
        this.server.to(socket.id).emit('getRoomsForUser', myRooms)
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
      const rooms = await this.userRoomService.getAllRoomsForUser(user)
      for (const connection of connections) {
        await this.server.to(connection.socketID).emit('rooms', rooms)
        await this.server.to(connection.socketID).emit('getRoomsForUser', rooms)
      }
    }
  }

  async emitRoomsForOneUser(socket: Socket, user: UserDto) {
    const rooms = await this.userRoomService.getAllRoomsForUser(user);
    await this.server.to(socket.id).emit('rooms', rooms);
    await this.server.to(socket.id).emit('getRoomsForUser', rooms);
  }

  async emitRolesForConnectedUsers(room: RoomI) {
    var roles = await this.userRoomService.getAllRolesForRoom(room);
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
    var allUsers = await this.userService.findAll();
    if (room.status == true)
    {
      for (var user of allUsers)
        await this.userRoomService.create({ user: user, room: room, role: UserRoomRole.AVAILABLE });
    }
    else
    {
      for (var user of allUsers)
        await this.userRoomService.create({ user: user, room: room, role: UserRoomRole.FORBIDDEN });
    }
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    const newRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);
    await this.createUserRooms(newRoom, socket.data.user, newRoom.users); // that will actually be in the room
    await this.emitRoomsForConnectedUsers(newRoom);
    await this.emitRolesForConnectedUsers(newRoom);
  }

  @SubscribeMessage('getRoomsForUser')
  async onGetRoomsForUser(socket: Socket, user: UserDto) {
    const rooms = await this.userRoomService.getAllRoomsForUser(user);
    await this.server.to(socket.id).emit('getRoomsForUser', rooms);
  }

  @SubscribeMessage('quitRoom')
  async onQuitRoom(socket: Socket, { room, user }) {
    // TODO : Check validity of all users before quit the room
    try {
      await this.userRoomService.updateRole(room, user, user, UserRoomRole.AVAILABLE);
      await this.emitRoomsForOneUser(socket, user); // emit to current user not in room anymore
      await this.emitRoomsForConnectedUsers(room);
      await this.emitRolesForConnectedUsers(room);
    }
    catch (e) {
      socket.emit('error', e);
      await this.server.to(socket.id).emit('errorQuitRoom');
    }

  }

  @SubscribeMessage('enterRoom')
  async onEnterRoom(socket: Socket, { room, user }) {
    // TODO : Check validity of all users before enter the room
    await this.userRoomService.updateRole(room, user, user, UserRoomRole.LAMBDA);
    await this.emitRoomsForOneUser(socket, user); // emit to current user not in room anymore
    await this.emitRoomsForConnectedUsers(room);
    await this.emitRolesForConnectedUsers(room);
  }

  @SubscribeMessage('selectRoom')
  async onSelectRoom(socket: Socket, { room, password }) {
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
    await this.server.to(socket.id).emit('updateSelected', room);

    var roles = await this.userRoomService.getAllRolesForRoom(room);
    await this.server.to(socket.id).emit('getRoles', roles); // peut-etre redondant
    var users = await this.userRoomService.getUsersForRoom(room);
    await this.server.to(socket.id).emit('getUsers', users)
    await this.server.to(socket.id).emit('getMessages', messages);
    await this.emitRolesForConnectedUsers(room);
    return await this.emitRoomsForConnectedUsers(room);
  }
   
  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket, room: RoomI) {
    // Remove connection for Joined Room
    await this.joinedRoomService.deleteBySocketID(socket.id);
    await this.server.to(socket.id).emit('updateSelected', room);
    await this.emitRolesForConnectedUsers(room);
    return await this.emitRoomsForConnectedUsers(room);
  }
      
  //////////////////////////////////////// PASSWORD FUNCTIONS ////////////////////////////////////////////////////////////

  @SubscribeMessage('deletePassword')
  async onDeletePassword(socket: Socket, { room, modifier }) {
    try {
      await this.roomService.deletePassword(room, modifier);
      await this.emitRoomsForConnectedUsers(room);
      return await this.server.to(socket.id).emit('deletingPasswordSuccess', room);
    }
    catch (e) {
      socket.emit('error', e);
    }
  }

  @SubscribeMessage('modifyPassword')
  async onModifyPassword(socket: Socket, { room, modifier, password }) {
    try {
      await this.roomService.modifyPassword(room, modifier, password);
      await this.emitRoomsForConnectedUsers(room);
      return await this.server.to(socket.id).emit('modifyingPasswordSuccess', room);
    }
    catch (e) {
      socket.emit('error', e);
    }
  }

  @SubscribeMessage('addPassword')
  async onAddPassword(socket: Socket, { room, modifier, password }) {
    try {
      await this.roomService.addPassword(room, modifier, password);
      await this.emitRoomsForConnectedUsers(room);
      return await this.server.to(socket.id).emit('addingPasswordSuccess', room);
    }
    catch (e) {
      socket.emit('error', e);
    }
  }

  //////////////////////////////////////// ROOM RENAMING //////////////////////////////////////////////////////////////////

  @SubscribeMessage('renameRoom')
  async onRenameRoom(socket: Socket, { room, modifier, newName }) {
    try {
      await this.roomService.renameRoom(room, modifier, newName);
      await this.emitRoomsForConnectedUsers(room);
      return await this.server.to(socket.id).emit('renamingRoomSuccess', room);
    }
    catch (e) {
      socket.emit('error', e);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  @SubscribeMessage('getAllInformation')
  async onGetAllInformation(socket: Socket, user: UserDto) {
     return await this.emitRoomsForOneUser(socket, user);
  }

  @SubscribeMessage('getRoles')
  async onGetRoles(socket: Socket, room: RoomI) {

    var roles = await this.userRoomService.getAllRolesForRoom(room);
    return await this.server.to(socket.id).emit('getRoles', roles);
  }

  @SubscribeMessage('getAllRolesForUser')
  async onGetAllRolesForUser(socket: Socket, user: UserDto) {

    // emit all blocked friends
    var blocked = await this.friendsService.getBlockedFriends(user);
    await this.server.to(socket.id).emit('getBlockedFriends', blocked);

    // emit all roles for user
    var rooms = await this.userRoomService.getAllRolesForUser(user);
    return await this.server.to(socket.id).emit('getAllRolesForUser', rooms);
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
      await this.emitRolesForConnectedUsers(room);
      await this.emitRoomsForConnectedUsers(room); // JUST ADDED
    }
    catch {
      socket.emit('error', new UnauthorizedException());
    }
  }

  @SubscribeMessage('blockUser')
  async onBlockUser(socket: Socket, room: RoomI){}
  
  async afterInit() {}

  //////////////////////////////////////// MESSAGES FUNCTIONS ////////////////////////////////////////////////////////////
 
  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, { message, role }) {
    if (role == UserRoomRole.MUTED)
      return;
    const createdMessage: MessageI = await this.messageService.create({ ...message, user: socket.data.user });
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    // Send New Message to all joineds Users (online on the room)
    // console.log("joinedUsers : ", joinedUsers);
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
    socket.emit('Error', new UnauthorizedException()); // With or without capital E
    socket.disconnect();
  }
      
    ////////////////////////////////////////// CHAT GAME SPECIFIC FUNCTIONS ////////////////////////////////////////////////////////////
  
    @SubscribeMessage('sendInvit')
    async sendInvit(socket: Socket, [user_defié , user_defiant]) {
      var opponentSocket = await this.connectedUserService.findByUser(user_defié);
      await this.server.to(opponentSocket[0].socketID).emit('invit', user_defiant, Math.random().toString().substring(2,7)); //<- hash de 5 chiffres random
    }
    
    @SubscribeMessage('acceptInvit')
    async acceptInvit(socket: Socket, [adversaire, roomCode]) {
      // console.log(">>>>>> acceptInvit "/* roomCode : ",  roomCode, "adversaire : ", adversaire */);
      var opponentSocket = await this.connectedUserService.findByUser(adversaire);
      this.server.to(opponentSocket[0].socketID).emit('acceptInvit', roomCode);
    }
  
    @SubscribeMessage('declineGameInvit')
    async declineGameInvit(socket: Socket, adversaire : UserDto) {
      // console.log(">>>>>> declineGameInvit "/* adversaire : ", adversaire */);
      var opponentSocket = await this.connectedUserService.findByUser(adversaire);
      this.server.to(opponentSocket[0].socketID).emit('declineGameInvit');
    }
 }
