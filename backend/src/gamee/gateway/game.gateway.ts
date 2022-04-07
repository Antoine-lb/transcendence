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


   state: StateI[] = [];
   

   
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
        socket.data.roomId = 0;
        return;
      }
    }
    catch {
      console.log('disconnect socket')
      return this.disconnect(socket);
    }
  }
   
  @SubscribeMessage('joinGame')
   handleJoinGame(socket: Socket, roomName: string) {

    let roomSize = 0;
    console.log('------------after Join------------------------')

    console.log(this.state);
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

    let roomNameINT: number = parseInt(roomName);
    let index: number =  this.GameService.getRoomById(this.state, roomNameINT);


    this.state[index].id = roomNameINT;
    // set the creator to player 1
    socket.data.number = 2;
    // set the room game id to the current user socket
    socket.data.roomId = roomName;

    // join the room socket
    socket.join(roomName);


    // init the front for player 2
    socket.emit('init', 2);

    // start the game when both player are connected
    this.startGameInterval(roomName, roomNameINT);
  }
   
  @SubscribeMessage('newGame')
  handleNewGame(socket: Socket) {

    let roomName = this.GameService.makeid(5);
	
    // clientRooms[socket.id] = roomName;
    socket.emit('gameCode', roomName);

    let newState: StateI =  this.GameService.initGame()

    newState.gameState = "play";
    newState.id = parseInt(roomName);

    this.state.push(newState);

    // set the creator to player 1
    socket.data.number = 1;
    // set the room game id to the current user socket
    socket.data.roomId = roomName;

    // join the room socket
    socket.join(roomName);

    // init the front for player 1
    socket.emit('init', 1);
  }
     
  // @SubscribeMessage('pause')
  // async handlePause(socket: Socket) {
  //   // let room = this.state[clientRooms[socket.id]];
  //   let room = this.state;
  //   if (!room)
  //     return;
  //   room.gameState = room.gameState === "paused" ? "play" : "paused";

  // 	if (room.gameState === "paused") {
  // 		clearInterval(this.intervalId);
  //     socket.broadcast.emit('notify', {
  //       title: "Important message",
  //       text: "Game Paused by your opponent",
  //       duration : 6000
  //     });
  // 	}
  // 	else {
  // 		console.log("Pas paused")
  //     this.startGameInterval(this.state.id);
  // 	}
  // }
   
  @SubscribeMessage('keydown')
  async handleKeyDown(socket: Socket, keyCode: string) {

    let keyCodeInt: number;
    let index: number = await this.GameService.getRoomById(this.state,  socket.data.roomId);
    if (!this.state[index]) {
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
      this.state[index].players[socket.data.number - 1].y += vel;
    }
    // prevent paddles from going through walls
    if ( this.state[index].players[socket.data.number - 1].y < grid) {
      this.state[index].players[socket.data.number - 1].y = grid;
    }
    else if ( this.state[index].players[socket.data.number - 1].y > maxPaddleY) {
      this.state[index].players[socket.data.number - 1].y = maxPaddleY;
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

   startGameInterval(roomName, roomId: number) {
      
    let index: number = this.GameService.getRoomById(this.state, roomId);
     
    this.state[index].intervalId = setInterval(() =>  {
    
      let index: number = this.GameService.getRoomById(this.state, roomId);
      
      const winner = this.GameService.gameLoop(this.state[index]);
        
      if (!winner) {
        this.emitGameState(this.state, roomId);
      }
      else {
        this.emitGameOver(this.state, winner, roomId);

          // TODO : save the score
        clearInterval(this.state[index].intervalId);
        this.state.splice(index, 1);

      }
    }, 1000 / FRAME_RATE);
    }
   
   emitGameState(state: StateI[], roomId: number) {

     let index: number = this.GameService.getRoomById(this.state, roomId);
     
    // Send this event to everyone in the room.
    this.server.to(state[index].id.toString())
      .emit('gameState', JSON.stringify(state[index]));
    }
    
    emitGameOver(state: StateI[], winner, roomId: number) {

      let index: number = this.GameService.getRoomById(this.state, roomId);

      this.server.to(state[index].id.toString())
      .emit('gameOver', JSON.stringify({ winner }));
    }
 }