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
import { FRAME_RATE, maxPaddleY, grid, canvas, paddleHeight, } from 'src/utils/constants';
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

  intervalId: NodeJS.Timer;

   state: StateI;
   

   
   async onModuleInit() {
   }
 
  async handleConnection(socket: Socket, payload: string) {
    try {
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization);

      const user = await this.userService.findById(decodedToken.id);

      if (!user)
        return this.disconnect(socket);
      else {
        socket.data.user = user;
        socket.data.number = null;
        return;
      }
    }
    catch {
      console.log('disconnect socket')
      return this.disconnect(socket);
    }
  }
   
  @SubscribeMessage('joinGame')
  async handleJoinGame(socket: Socket, roomName: string) {

    let roomSize = 0;
  	const room = this.server.sockets.adapter.rooms.get(roomName)

    if (room)
      roomSize = this.server.sockets.adapter.rooms.get(roomName).size;
      console.log("room", room)

    if (roomSize === 0) {
      socket.emit('unknownCode');
      return;
    } else if (roomSize > 1) {
      socket.emit('tooManyPlayers');
      return;
    }

    this.state.id = parseInt(roomName);

    socket.join(roomName);
    socket.data.number = 2;
    socket.emit('init', 2);

    console.log("room", room)

    this.startGameInterval(roomName);
  }
   
  @SubscribeMessage('newGame')
  async handleNewGame(socket: Socket) {


    let roomName = this.GameService.makeid(5);
	
    // clientRooms[socket.id] = roomName;
    socket.emit('gameCode', roomName);

    this.state = await this.GameService.initGame();
    this.state.gameState = "play"
    socket.data.number = 1;

    socket.join(roomName);

    socket.emit('init', 1);
  }
     
  @SubscribeMessage('pause')
  async handlePause(socket: Socket) {
    // let room = this.state[clientRooms[socket.id]];
    let room = this.state;
    if (!room)
      return;
    room.gameState = room.gameState === "paused" ? "play" : "paused";

  	if (room.gameState === "paused") {
  		clearInterval(this.intervalId);
      socket.broadcast.emit('notify', {
        title: "Important message",
        text: "Game Paused by your opponent",
        duration : 6000
      });
  	}
  	else {
  		console.log("Pas paused")
      this.startGameInterval(this.state.id);
  	}
  }
   
  @SubscribeMessage('keydown')
  async handleKeyDown(socket: Socket, keyCode: string) {

    let keyCodeInt: number;
    const roomName = this.state;
    if (!this.state) {
      return;
    }
    try {
      keyCodeInt = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = this.GameService.getUpdatedVelocity(keyCodeInt);

    // if (keyCodeInt == 68) { // 'd'isconnect
    //   // socket.disconnect();
  
    // }
    // if (keyCodeInt == 67) { // 'c'onnect
    //   // socket.disconnect();
    //   this.startGameInterval(roomName.id);
    // }
  
      if (vel) {
        this.state.players[socket.data.number - 1].y += vel;
      }
      // prevent paddles from going through walls
      if ( this.state.players[socket.data.number - 1].y < grid) {
        this.state.players[socket.data.number - 1].y = grid;
      }
      else if ( this.state.players[socket.data.number - 1].y > maxPaddleY) {
        this.state.players[socket.data.number - 1].y = maxPaddleY;
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
   
   async afterInit() { }

  startGameInterval(roomName) {
    this.intervalId = setInterval(() => {
      const winner = this.GameService.gameLoop(this.state);
      if (!winner) {
        this.emitGameState(roomName, this.state.id.toString(), this.state)
      } else {
        this.emitGameOver(roomName, this.state.id.toString(), winner);
        this.state = null;
        clearInterval(this.intervalId);
      }
    }, 1000 / FRAME_RATE);
    }
    
    emitGameState(socket: Socket, roomid: string, gameState: StateI) {
    // Send this event to everyone in the room.
      
    console.log(this.state.id.toString());
    this.server.to(this.state.id.toString())
      .emit('gameState', JSON.stringify(gameState));
    }
    
    emitGameOver(socket: Socket, roomid: string, winner) {
      this.server.to(this.state.id.toString())
      .emit('gameOver', JSON.stringify({ winner }));
    }
 }