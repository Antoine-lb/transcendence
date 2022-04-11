import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
import { UnauthorizedException } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { GameService } from 'src/gamee/service/game/game.service';
import { FRAME_RATE, maxPaddleY, grid, canvas, paddleHeight, } from 'src/utils/constants';
import { StateI } from 'src/gamee/model/state.interface';
import { UserEntity } from 'src/entities/users.entity';
import { MatchHistoryService } from 'src/gamee/service/matchHistory/matchHistory.service'

 

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
     private GameService: GameService,
     private MatchHistoryService: MatchHistoryService
    ) { }
  
   
   
   @WebSocketServer() server: Server;
   state: StateI[] = [];
   
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
  	const room = this.server.sockets.adapter.rooms.get(roomName)

    if (room)
      roomSize = this.server.sockets.adapter.rooms.get(roomName).size;

    if (roomSize === 0) {
      socket.emit('unknownCode');
      return;
    } else if (roomSize > 1) {
      socket.emit('tooManyPlayers');
      return;
    }

    let roomNameINT: number = parseInt(roomName);
    let index: number = this.GameService.getRoomById(this.state, roomNameINT);
  
    this.state[index].id = roomNameINT;
    this.state[index].player2Id = socket.data.user.id;

    // set the creator to player 1
    socket.data.number = 2;
    // set the room game id to the current user socket
    socket.data.roomId = roomName;
    // join the room socket
    socket.join(roomName);
    // init the front for player 2
    socket.emit('init', 2);
    // start the game when both player are connected
    this.startGameInterval(roomNameINT);
  }
   
   
   
   @SubscribeMessage('joinQueue')
   handleJoinQueue(socket: Socket) {

    let index: number = this.GameService.getRoomForQueue(this.state);

     // [CREATE] game state and wait other player if(nobody is in queue)
     if (index == -1) {
      // create random ID for the new room
      let roomName = this.GameService.makeid(5);
      // init the game state 
      let newState: StateI = this.GameService.initGame(true)
      newState.gameState = "play";
      newState.status = 1;
      newState.id = parseInt(roomName);
      newState.player1Id = socket.data.user.id; 
      // save the new game state
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
     // [JOIN] the game if somebody is already in queue
     else {
      // set the creator to player 1
      socket.data.number = 2;
      // set the room game id to the current user socket
      socket.data.roomId = this.state[index].id;
      this.state[index].player2Id = socket.data.user.id; 
      // join the room socket
      socket.join(this.state[index].id.toString());
      // init the front for player 2
      socket.emit('init', 2);
      // start the game when both player are connected
      this.startGameInterval(this.state[index].id);
    }
 }
   
  @SubscribeMessage('newGame')
  handleNewGame(socket: Socket) {
    
    // create random ID for the new room
    let roomName = this.GameService.makeid(5);
    // emit the new game ID to other player;
    socket.emit('gameCode', roomName);
    // init the game state 
    let newState: StateI =  this.GameService.initGame(false)
    newState.gameState = "play";
    newState.id = parseInt(roomName);
    // save playerId to state
    newState.player1Id = socket.data.user.id;
    // save the new game state
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
 handleKeyDown(socket: Socket, keyCode: string) {

    let keyCodeInt: number;
    let index: number = this.GameService.getRoomById(this.state,  socket.data.roomId);
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
   
  startGameInterval(roomId: number) {
      
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
    
  async emitGameOver(state: StateI[], winner: number, roomId: number) {

    let index: number = this.GameService.getRoomById(this.state, roomId);

    this.server.to(state[index].id.toString())
      .emit('gameOver', JSON.stringify({ winner }));
     
    const players: UserEntity[] = await this.userService.findManyIds([state[index].player1Id, state[index].player2Id]);
    let loser: number = (winner == state[index].player1Id) ? state[index].player2Id : state[index].player1Id;
    let score: number = state[index].score.p1 + state[index].score.p2;
     
    // save the game score for Match History
     this.MatchHistoryService.create({
        players: players,
        winnerId: winner,
        loserId: loser,
        score: score,
      })
   }
}