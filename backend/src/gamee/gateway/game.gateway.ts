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
import { UserEntity } from 'src/entities/users.entity';
import { MatchHistoryService } from 'src/gamee/service/matchHistory/matchHistory.service'
import { RouterModule } from '@nestjs/core';



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
  clientRooms = {};
  stackIndex = 2;

  async handleConnection(socket: Socket, payload: string) {
    try {
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization);

      const user = await this.userService.findById(decodedToken.id);

      if (!user)
        return this.disconnect(socket);
      else {
        socket.data.user = user;
        return;
      }
    }
    catch {
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

    this.clientRooms[socket.id] = roomName;

    // set the creator to player 1
    socket.data.number = 2;
    // join the room socket
    socket.join(roomName);
    // init the front for player 2
    socket.emit('init', 2);

    // start the game when both player are connected
    this.startGameInterval(roomName);
  }

  @SubscribeMessage('joinQueue')
  handleJoinQueue(socket: Socket) {

    let roomName = Math.floor(this.stackIndex / 2).toString();
    this.clientRooms[socket.id] = roomName;
    // [CREATE] game state and wait other player if(nobody is in queue)
    if (!(this.stackIndex % 2)) {
      this.stackIndex++;
      // init the game state 
      this.state[roomName] = this.GameService.initGame(true)
      this.state[roomName].status = 1;

      // set the creator to player 1
      socket.data.number = 1;
      this.clientRooms[socket.id] = roomName;
      // join the room socket
      socket.join(roomName);
      // init the front for player 1
      socket.emit('init', 1);
    }
    // [JOIN] the game if somebody is already in queue
    else {

    //   console.log(this.server.sockets.adapter.rooms.get(roomName));
      
    //   for (const playerId of this.server.sockets.adapter.rooms.get(roomName) ) {
  
    //     //this is the socket of each client in the room.
    //     const clientSocket = this.server.sockets.sockets.get(playerId);

    //     if (clientSocket == socket)
    //       return;
    // }
      this.stackIndex++;
      this.state[roomName].status = 2;
      // set the creator to player 1
      socket.data.number = 2;
      this.clientRooms[socket.id] = roomName;
      // join the room socket
      socket.join(roomName);

      console.log(this.server.sockets.adapter.rooms.get(roomName));

      // init the front for player 2
      socket.emit('init', 2);

      // Animation to warn players the game is starting
      this.server.to(roomName).emit('startGameAnimation')
      // start the game when both player are connected
      setTimeout(() => {
        // console.log('roomName', roomName);
        this.startGameInterval(roomName)
      }, 7000);
    }
  }

  @SubscribeMessage('launchGame')
  launchGame(/* roomId: number */) {
    // console.log(`socket.data.user.id ${this.socket.data.user.id}`);
    // console.log(`socket.data.user.id`);

    // let roomName: number = this.GameService.getRoomById(this.state, roomId);
    // this.startGameInterval(this.state[roomName].id);
  }

  @SubscribeMessage('newGame')
  handleNewGame(socket: Socket) {

    // create random ID for the new room
    let roomName = this.GameService.makeid(5);

    // emit the new game ID to other player;
    this.clientRooms[socket.id] = roomName;
    socket.emit('gameCode', roomName);

    this.state[roomName] = this.GameService.initGame(false);
    socket.data.number = 1;
    socket.join(roomName);
    socket.emit('init', 1);
    this.state[this.clientRooms[socket.id]].gameState = "play"
  }

  @SubscribeMessage('pause')
  handlePause(socket: Socket) {
    let room = this.state[this.clientRooms[socket.id]];
    if (!room) {
      return;
    }
    room.gameState = room.gameState === "paused" ? "play" : "paused";

    if (room.gameState === "paused") {
      clearInterval(this.state[this.clientRooms[socket.id]].intervalId);
      socket.broadcast.emit('notify', {
        title: "Important message",
        text: "Game Paused by your opponent",
        duration: 6000
      });
    }
    else {
      this.startGameInterval(this.clientRooms[socket.id]);
      socket.broadcast.emit('notify', {
        title: "Important message",
        text: "Game Resumed by your opponent",
        duration: 6000
      });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnection(socket: Socket) {
    console.log("socket handleDisconnect[ION]!!!:", socket.id, " juts disconnected")
    if (this.clientRooms[socket.id] && this.state[this.clientRooms[socket.id]].intervalId)
      clearInterval(this.state[this.clientRooms[socket.id]].intervalId);
    // socket.broadcast.emit('disconnection')
  }

  @SubscribeMessage('keydown')
  async handleKeyDown(socket: Socket, keyCode: string) {

    let keyCodeInt: number;
    const roomName: string = this.clientRooms[socket.id];
    if (!roomName) {
      return;
    }
    try {
      keyCodeInt = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    this.GameService.getUpdatedVelocity(false, keyCodeInt, this.state[roomName].players[socket.data.number - 1], socket.data.number);
  }

  @SubscribeMessage('keyup')
  async handleKeyup(socket: Socket, keyCode: string) {
    const roomName: String = this.clientRooms[socket.id];
    if (!roomName)
      return;

    this.GameService.getUpdatedVelocity(true, parseInt(keyCode), this.state[this.clientRooms[socket.id]].players[socket.data.number - 1], socket.data.number);
  }

  @SubscribeMessage('msg')
  broadcastMsg(socket: Socket, msg: string) {
    const room = [this.clientRooms[socket.id]];
    this.server.sockets.in(room).emit('broadcastMsg', msg);
  }

  // C'est celui qui marche
  handleDisconnect(socket: Socket) {
    console.log("socket handleDisconnect:", socket.id, " juts disconnected")
    const room = [this.clientRooms[socket.id]];
    this.server.sockets.in(room).emit('disconnection');
    socket.disconnect()
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  async afterInit() { }

  startGameInterval(roomName: string) {

    this.state[roomName].intervalId = setInterval(() => {

      const winner = this.GameService.gameLoop(this.state[roomName]);

      if (!winner) {
        this.emitGameState(roomName, this.state[roomName]);
      }
      else {
        clearInterval(this.state[roomName].intervalId);
        this.emitGameOver(roomName, winner);

        // TODO : save the score
      }
    }, 1000 / FRAME_RATE);
  }

  emitGameState(roomName: string, state: StateI) {
    // Send this event to everyone in the room.
    this.server.to(roomName)
      .emit('gameState', JSON.stringify(this.state[roomName]));
  }

  async emitGameOver(roomName: string, winner: number) {

    const room = [];
    room.push(roomName) // parce qu'on peut pas passer de string direct apparemment...
    this.server.sockets.in(room).emit('gameOver', JSON.stringify({ winner }));

    let playersSockets = this.server.sockets.adapter.rooms.get(roomName);

    let winnerId, loserId;

    // Disconnect both players to the room 
    for (const playerId of playersSockets ) {
  
        //this is the socket of each client in the room.
        const clientSocket = this.server.sockets.sockets.get(playerId);

        if (winner == clientSocket.data.number)
          winnerId = clientSocket.data.user.id;
        else
          loserId = clientSocket.data.user.id; 
        //both player leave the room
        clientSocket.leave(roomName)
    }
    
    const players: UserEntity[] = await this.userService.findManyIds([winnerId, loserId]);
    let score: number = this.state[roomName].score.p1 + this.state[roomName].score.p2;
    
    // save the game score for Match History
    this.MatchHistoryService.create({
      players: players,
      winnerId: winnerId,
      score: score,
    })
  }
}