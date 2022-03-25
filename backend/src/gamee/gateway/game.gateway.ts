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
import { GameService } from 'src/gamee/service/game/game.service';
import { FRAME_RATE, maxPaddleY, grid } from 'src/utils/constants';
import { RoomEntity } from 'src/chat/model/room.entity';
import { RoomI } from 'src/chat/model/room.interface';
import { StateI } from 'src/gamee/model/state.interface';

 

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
     private GameService: GameService,

    ) { }
  
   
   
   @WebSocketServer() server: Server;

   state: StateI;
   
   async onModuleInit() {
   }
 
  async handleConnection(socket: Socket, payload: string) {

    console.log('GAME!');

    try {
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization);

      const user = await this.userService.findById(decodedToken.id);

      if (!user)
        return this.disconnect(socket);
      else {
        socket.data.user = user;
        socket.data.number = null;
      }
      
    }
    catch {
      console.log('disconnect socket', )
      return this.disconnect(socket);
    }
  }
   
  @SubscribeMessage('keydown')
  async handleKeydown(socket: Socket, keyCode: string) {
    console.log('keydown')

    let keyCodeInt: number;
    const roomName = this.state.id;
    if (!roomName) {
      return;
    }
    try {
      keyCodeInt = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }
  
    const vel = this.GameService.getUpdatedVelocity(keyCodeInt);
  
    if (vel) {
      this.state[roomName].players[socket.data.number - 1].y += vel;
    }
    // prevent paddles from going through walls
    if (this.state[roomName].players[socket.data.number - 1].y < grid) {
      this.state[roomName].players[socket.data.number - 1].y = grid;
    }
    else if (this.state[roomName].players[socket.data.number - 1].y > maxPaddleY) {
      this.state[roomName].players[socket.data.number - 1].y = maxPaddleY;
    }
  }
   
  @SubscribeMessage('joinGame')
  async handleJoinGame(socket: Socket, roomName: string) {

    const room = this.server.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }
  
    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }
  
    if (numClients === 0) {
      socket.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      socket.emit('tooManyPlayers');
      return;
    }
  
    this.state.id = parseInt(roomName);
  
    socket.join(roomName);
    socket.data.number = 2;
    socket.emit('init', 2);
    
    startGameInterval(roomName);
  }
   
  @SubscribeMessage('createGame')
  async handleNewGame(socket: Socket) {
    
    let roomId = this.GameService.makeid(5);
    socket.emit('gameCode', roomId);

    this.state = await this.GameService.initGame();

    console.log(this.state);
    socket.join(roomId);
    socket.data.number = 1;
    socket.emit('init', 1);
  }
     
   
  @SubscribeMessage('keyDown')
  async handleKeyDown(socket: Socket, keyCode: string) {

    let keyCodeInt: number;
    const roomName = this.state.id
    if (!roomName) {
      return;
    }
    try {
      keyCodeInt = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = this.GameService.getUpdatedVelocity(keyCodeInt);

    if (vel) {
      this.state[roomName].players[socket.data.number - 1].y += vel;
    }
    // prevent paddles from going through walls
    if (this.state[roomName].players[socket.data.number - 1].y < grid) {
      this.state[roomName].players[socket.data.number - 1].y = grid;
    }
    else if (this.state[roomName].players[socket.data.number - 1].y > maxPaddleY) {
      this.state[roomName].players[socket.data.number - 1].y = maxPaddleY;
    }
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

 function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = this.GameService.gameLoop(this.state[roomName]);
    console.log("startGameInterval winner :", winner)
    if (!winner) {
      this.emitGameState(roomName, this.state[roomName])
    } else {
      this.emitGameOver(roomName, winner);
      this.state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
  }
  
  function emitGameState(socket: Socket, room, gameState) {
  // Send this event to everyone in the room.
  socket.in(room)
    .emit('gameState', JSON.stringify(gameState));
  }
  
  function emitGameOver(socket: Socket, room, winner) {
  socket.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
  }