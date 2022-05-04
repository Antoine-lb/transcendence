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
import { ConnectedUserService } from 'src/chat/service/connected-user/connected-user.service';
import { ConnectedUserI } from 'src/chat/model/connected.user.interface';

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
    private MatchHistoryService: MatchHistoryService,
    private connectedUserService: ConnectedUserService,

  ) { }



  @WebSocketServer() server: Server;
  state: StateI[] = [];
  clientRooms = {};
  stackIndex = 2;
  clientDisconnected = {};

  async handleConnection(socket: Socket, payload: string) {
    // console.log(`hello from game`);
    try {
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization);
      console.log("decodedToken game : ", decodedToken);
      const user = await this.userService.findById(decodedToken.id);

      if (!user)
        return this.disconnect(socket);
      else {
        socket.data.user = user;


        // il me faut le socket des que l on clique sur "jeux"

        // connect directly the client to the room if he was in game

        if (this.clientDisconnected[user.id]) {
          socket.data.status = "play"
          // join the room socket
          socket.join(this.clientDisconnected[user.id].roomName);
          socket.data.number = this.clientDisconnected[user.id].player;
          // init the front for player 2
          socket.emit('init', this.clientDisconnected[user.id].player);
        }

        return;
      }
    }
    catch {

      return this.disconnect(socket);
    }
  }

  @SubscribeMessage('test') // to remove
  async test(socket: Socket, user: UserDto) {
    console.log(`Test`);
    var opponentSocket = await this.findChatSocket(user);
    console.log("opponentSocket : ", opponentSocket);
  }

    ////////////////////////////////////////// CHAT GAME SPECIFIC FUNCTIONS ////////////////////////////////////////////////////////////
  
    @SubscribeMessage('sendInvit')
    async sendInvit(socket: Socket, [user_defié , user_defiant]) {
      var opponentSocket = await this.connectedUserService.findByUser(user_defié);
      // console.log(`mySocket : ${socket.id}, opponentSocket :  ${opponentSocket[0].socketID}`);
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
//////////////////////////////////////////////////////////////////////////////////////////////////////
  

  @SubscribeMessage('newGame')
  async handleNewGame(socket: Socket, roomCode : string) {
    // console.log(">>>>>> newGame roomCode : ",  roomCode);
    // create random ID for the new room
    let roomName = roomCode ? roomCode : this.GameService.makeid(5);
    // emit the new game ID to other player;
    this.clientRooms[socket.id] = roomName;
    socket.emit('gameCode', roomName);

    this.state[roomName] = this.GameService.initGame(false);
    socket.data.number = 1;
    socket.join(roomName);
    socket.emit('init', 1);
    this.state[this.clientRooms[socket.id]].gameState = "play"
    socket.data.status = "play"
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(socket: Socket, roomName: string) {
    // console.log(">>>>>> joinGame in ", roomName);

    let roomSize = 0;

    const room = this.server.sockets.adapter.rooms.get(roomName)

    if (room)
      roomSize = room.size;
    // console.log(`roomSize : ${roomSize}`);
    

    if (roomSize === 0) {
      console.log(">>>>>> unknownCode");
      socket.emit('unknownCode');
      return;
    } else if (roomSize > 1) {
      console.log(">>>>>> tooManyPlayers");
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
    socket.data.status = "play"

    // start the game when both player are connected
    // console.log(">>>>>> about to start game in joinGame");
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
      this.state[roomName].userID = socket.data.user.id;

      // set the creator to player 1
      socket.data.number = 1;
      this.clientRooms[socket.id] = roomName;
      // join the room socket
      socket.join(roomName);
      // init the front for player 1
      socket.emit('init', 1);
    // set the creator to player mode
      socket.data.status = "play"
    }
    // [JOIN] the game if somebody is already in queue
    else {

      if (this.state[roomName].userID == socket.data.user.id) {
        // socket.disconnect(); // Faut pas disconnecte sinon ça bug... sais pas pk...
        return;
      }
      this.stackIndex++;
      this.state[roomName].userID = socket.data.user.id;
      // set the creator to player 1
      socket.data.number = 2;
      this.clientRooms[socket.id] = roomName;
      // join the room socket
      socket.join(roomName);
      // init the front for player 2
      socket.emit('init', 2);
      // Animation to warn players the game is starting
      this.server.to(roomName).emit('startGameAnimation')
    // set the creator to player mode
      socket.data.status = "play"
      // start the game when both player are connected
      setTimeout(() => {
        this.startGameInterval(roomName)
      }, 7000);
    }
  }

  @SubscribeMessage('spec')
  handleSpecGame(socket: Socket, roomName: string) {

    let roomSize = 0;

    const room = this.server.sockets.adapter.rooms.get(roomName)

    if (room)
      roomSize = this.server.sockets.adapter.rooms.get(roomName).size;

    if (roomSize === 0) {
      socket.emit('unknownCode');
      return;
    } else if (roomSize != 2) {
      socket.emit('tooManyPlayers');
      return;
    }

    this.clientRooms[socket.id] = roomName;

    // set the creator to spectator mode
    socket.data.status = "spec"
    // join the room socket
    socket.join(roomName);
    // init the front for player 2
    socket.emit('init', 3);

    // start the game when both player are connected
  }

  @SubscribeMessage('launchGame')
  launchGame(/* roomId: number */) {
    // console.log(`socket.data.user.id ${this.socket.data.user.id}`);
    // console.log(`socket.data.user.id`);

    // let roomName: number = this.GameService.getRoomById(this.state, roomId);
    // this.startGameInterval(this.state[roomName].id);
  }


  async findChatSocket(user: UserDto) {
    var connectedUserRooms: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
    var sockets = [];
    for (var connectedUser of connectedUserRooms)
      sockets.push(connectedUser.socketID);
    return sockets;
  }

  @SubscribeMessage('pause')
  handlePause(socket: Socket) {
    let room = this.state[this.clientRooms[socket.id]];
    if (!room || socket.data.status != "play")
      return;
    room.gameState = room.gameState === "paused" ? "play" : "paused";

    if (room.gameState === "paused") {
      clearInterval(this.state[this.clientRooms[socket.id]].intervalId);
      this.server.sockets.in(this.clientRooms[socket.id]).emit('notify', {
        title: "Important message",
        text: "Game Paused by player",
        duration: 6000
      });
    }
    else {
      this.startGameInterval(this.clientRooms[socket.id]);
      this.server.sockets.in(this.clientRooms[socket.id]).emit('notify', {
        title: "Important message",
        text: "Game Resumed by player",
        duration: 6000
      });
    }
  }

  @SubscribeMessage('keydown')
  async handleKeyDown(socket: Socket, keyCode: string) {

    let keyCodeInt: number;
    const roomName: string = this.clientRooms[socket.id];

    if (!roomName || socket.data.status != "play")
      return;
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
    if (!roomName || socket.data.status != "play")
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
    const room = [this.clientRooms[socket.id]];

    const winner = this.GameService.gameLoop(this.state[this.clientRooms[socket.id]]);

    if (winner != -1) {
      this.clientDisconnected[socket.data.user.id] = { player: socket.data.number, roomName: this.clientRooms[socket.id] };
      socket.leave(this.clientRooms[socket.id]);

    }
    else {
      this.server.sockets.in(room).emit('disconnection');
      socket.disconnect();
    }
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());


    socket.disconnect();
  }

  async afterInit() { }

  startGameInterval(roomName: string) {
    // console.log(">>>>>> startGameInterval : ", roomName);
    this.state[roomName].intervalId = setInterval(() => {

      const winner = this.GameService.gameLoop(this.state[roomName]);
      if (!winner) {
        this.emitGameState(roomName, this.state[roomName]);
      }
      else {
        this.emitGameState(roomName, this.state[roomName]);
        this.emitGameOver(roomName, winner);
        clearInterval(this.state[roomName].intervalId);
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
    if (!playersSockets)
      return;
    for (const playerId of playersSockets) {

      //this is the socket of each client in the room.
      const clientSocket = this.server.sockets.sockets.get(playerId);

      clientSocket.data.status = "connected";


      // delete the client of disconnect.Array
      if (this.clientDisconnected[clientSocket.data.user.id])
        if (this.clientDisconnected[clientSocket.data.user.id].roomName == roomName)
          delete this.clientDisconnected[clientSocket.data.user.id];

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
      loserId: loserId,
      score: score,
    })
    // Modif xp & match history for the players
    // this.userService.updateUserScore(players, winnerId); <-- C'est ça qui cause les CORS à la fin du jeu

    this.state.splice(parseInt(roomName), 1);
  }
}