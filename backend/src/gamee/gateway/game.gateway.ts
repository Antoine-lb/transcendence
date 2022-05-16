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
import { UserDto } from 'src/entities/users.dto';
import { GameService } from 'src/gamee/service/game/game.service';
import { FRAME_RATE, scoreLimit } from 'src/utils/constants';
import { UserEntity } from 'src/entities/users.entity';
import { MatchHistoryService } from 'src/gamee/service/matchHistory/matchHistory.service'
import { ConnectedUserService } from 'src/chat/service/connected-user/connected-user.service';
import { ConnectedUserI } from 'src/chat/model/connected.user.interface';
import { FriendsService } from 'src/friends/friends.service';

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
    private readonly friendService: FriendsService

  ) { }



  @WebSocketServer() server: Server;
  state = {};
  clientRooms = {};
  liveGame = {};
  stackIndexBasicPong = 2;
  stackIndexPowerUPPong = 500;

  async handleConnection(socket: Socket, payload: string) {
    try {
      console.log('===========CONNECTION============')
      console.log('clientROOMS : ', this.clientRooms);
      console.log('live GAME : ', this.liveGame);
      console.log('State : ', this.state);
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization);
      const user = await this.userService.findById(decodedToken.id);

      if (!user)
        return this.disconnect(socket);
      else {

        const tmp: UserEntity = await this.userService.updateUserStatus(user.id, 1);
        
        socket.data.user = tmp;


        const users = await this.friendService.getFriends(socket.data.user);
        for (const user of users) {
          const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
          for (const connection of connections) {
            this.server.to(connection.socketID).emit('status', tmp.isOnline, tmp.id)
          }
        }        
        return;
      }
    }
    catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    const roomName = this.clientRooms[socket.id];

    let roomSize = 0;
    const room1 = this.server.sockets.adapter.rooms.get(roomName)
  
    if (socket.data.status == "spec")
    {
      socket.leave(roomName)
      return;
    }
    if (this.liveGame[roomName]) {
      clearInterval(this.state[roomName].intervalId);
      // identify witch client is disconnect and give him -42
      if (socket.data.number == 1) {
        this.state[roomName].score.p1 = -42;
        this.state[roomName].score.p2 = scoreLimit;
        this.emitGameState(roomName);
        await this.emitGameOver(roomName, 2, socket.data.user.id);
      }
      else {
        this.state[roomName].score.p2 = -42;
        this.state[roomName].score.p1 = scoreLimit;
        this.emitGameState(roomName);
        await this.emitGameOver(roomName, 1, socket.data.user.id);
      }
     }
     else 
       this.clearQueue(socket);
      
    const tmp = await this.userService.updateUserStatus(socket.data.user.id, 0);

    const users = await this.friendService.getFriends(socket.data.user);
    for (const user of users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
     for (const connection of connections) {
       this.server.to(connection.socketID).emit('status', 0, tmp.id)
      }
    }
    
    if (this.state[roomName])
      delete this.state[roomName];
    if (this.liveGame[roomName])
      delete this.liveGame[roomName];
    if (this.clientRooms[socket.id])
     delete this.clientRooms[socket.id];

    // this.server.sockets.in(room).emit('disconnection');
    socket.leave(roomName)
    
    // refresh the Live Game for the frontend
    this.server.emit('pushLiveGame', this.liveGame);
    
      console.log('===========DISCONNECT============')
      console.log('clientROOMS : ', this.clientRooms);
      console.log('live GAME : ', this.liveGame);
      console.log('State : ', this.state);
      socket.disconnect();
  }

  @SubscribeMessage('check_on_game')
  async check_if_on_game(socket : Socket){
    const roomName = this.clientRooms[socket.id];
    console.log('--->check_on_gamee');
    if (roomName)
    {
      socket.emit('init', socket.data.number);
    }
  }

  @SubscribeMessage('test')
  async clearQueue(socket: Socket) {
    const roomName = this.clientRooms[socket.id];

    if (socket.data.status == "spec")
    {
      socket.leave(roomName)
      return;
    }

    if (roomName && this.state[roomName] && this.liveGame[roomName]?.player2 && (this.state[roomName]?.score?.p1 || this.state[roomName]?.score?.p2 != scoreLimit)) {
      clearInterval(this.state[roomName].intervalId);
      // identify witch client is disconnect and give him -42
      if (socket.data.number == 1) {
       
        this.state[roomName].score.p1 = -42;
        this.state[roomName].score.p2 = scoreLimit;
        this.emitGameState(roomName);
        await this.emitGameOver(roomName, 2, socket.data.user.id);
      }
      else {
        this.state[roomName].score.p2 = -42;
        this.state[roomName].score.p1 = scoreLimit;
        this.emitGameState(roomName);
        await this.emitGameOver(roomName, 1, socket.data.user.id);
      }
    } 
    
    socket.leave(roomName);
    if (roomName) {
      console.log('powerUp before -> ', this.stackIndexPowerUPPong);
      console.log('basic before -> ', this.stackIndexBasicPong);
      if (this.liveGame[roomName]?.is_special_game) {
        this.stackIndexPowerUPPong--
      }
      else if (this.liveGame[roomName])
        this.stackIndexBasicPong--
      console.log('powerUp after -> ', this.stackIndexPowerUPPong);
      console.log('basic after -> ', this.stackIndexBasicPong);
    }
    if (this.state[roomName])
      delete this.state[roomName];
    if (this.liveGame[roomName])
      delete this.liveGame[roomName];
    if (this.clientRooms[socket.id])
      delete this.clientRooms[socket.id];
      console.log('===========UNMOUNT============')
      console.log('clientROOMS : ', this.clientRooms);
      console.log('live GAME : ', this.liveGame);
      console.log('State : ', this.state);
  }


  @SubscribeMessage('getLiveGame')
  async sendLiveGame(socket: Socket)
  {
    this.server.emit('pushLiveGame', this.liveGame);
  }




  @SubscribeMessage('newGame')
  async handleNewGame(socket: Socket, roomCode: string) {
    if (socket.data.status == "play") {
      socket.emit('already_playing')
      return;
    }
    // create random ID for the new room
    let roomName = roomCode ? roomCode : this.GameService.makeid(5);
    // emit the new game ID to other player;
    this.clientRooms[socket.id] = roomName;
    // Store the username to render OnLiveGame player
    this.liveGame[roomName] = {player1 : socket.data.user.username};
    socket.emit('gameCode', roomName);

    this.state[roomName] = this.GameService.initGame(false);
    socket.data.number = 1;
    socket.join(roomName);
    socket.emit('init', 1);
    this.state[this.clientRooms[socket.id]].gameState = "play"
    this.liveGame[roomName] = { player1 : socket.data.user.username, is_special_game : 0 };
    socket.data.status = "play"
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(socket: Socket, roomName: string) {

    let roomSize = 0;
    const room = this.server.sockets.adapter.rooms.get(roomName)

    if (room)
      roomSize = room.size;
    if (roomSize === 0) {
      socket.emit('unknownCode');
      return;
    }
    else if (roomSize > 1) {
      socket.emit('tooManyPlayers');
      return;
    }
      
    else if (socket.data.status == "play") {
      socket.emit('already_playing')
      return;
    }

    this.clientRooms[socket.id] = roomName;
    // set the creator to player 1
    socket.data.number = 2;
    // join the room socket
    await socket.join(roomName);
    // init the front for player 2
    socket.emit('init', 2);
    socket.data.status = "play"
    // start the game when both player are connected
    
    // Store the username to render OnLiveGame player
    if (this.liveGame[roomName])
      this.liveGame[roomName].player2 = socket.data.user.username;
    // maj des onLiveGame vers les autres clients
    this.server.emit('pushLiveGame', this.liveGame);
      
    // --------------------- Change Users Status -----------------------------
    await this.GameService.changeUsersStatus(this.server, roomName);
    // -----------------------------------------------------------------------

    // start the game when both player are connected
    console.log('//// START GAME INTERVAL //// ')
    this.startGameInterval(roomName, false);
    
  }

  @SubscribeMessage('joinQueue')
  async handleJoinQueue(socket: Socket, playWithPowerUP: boolean) {

    let roomName = Math.floor((playWithPowerUP ? this.stackIndexPowerUPPong : this.stackIndexBasicPong) / 2).toString();
    console.log('=====BEFORE QUEU=======')
    console.log('powerUp after -> ', this.stackIndexPowerUPPong);
    console.log('basic after -> ', this.stackIndexBasicPong);

    for (let index = 0; index < this.stackIndexBasicPong / 2; index++) {
      if (this.liveGame[index] && ((this.liveGame[index]?.player1 == socket?.data?.user?.username) || (this.liveGame[index]?.player2 == socket?.data?.user?.username)))
        return;
    } 
    for (let index = 250; index < this.stackIndexPowerUPPong/2; index++) {
      if (this.liveGame[index] && ((this.liveGame[index]?.player1 == socket?.data?.user?.username) || (this.liveGame[index]?.player2 == socket?.data?.user?.username)))
        return;
    } 
    if (this.state[roomName] && this.state[roomName]?.userID == socket?.data?.user?.id) {
      // socket.disconnect(); // Faut pas disconnecte sinon ça bug... sais pas pk...
      return;
    }
    this.clientRooms[socket.id] = roomName;

    // [CREATE] game state and wait other player if(nobody is in queue)
    if (!((playWithPowerUP ? this.stackIndexPowerUPPong : this.stackIndexBasicPong) % 2)) {
      (playWithPowerUP ? this.stackIndexPowerUPPong++ : this.stackIndexBasicPong++);

      // init the game state 
      this.state[roomName] = this.GameService.initGame(true);
      if (this.state[roomName])
        this.state[roomName].userID = socket.data.user.id;

      // set the creator to player 1
      socket.data.number = 1;
      this.clientRooms[socket.id] = roomName;
      // Store the username to render OnLiveGame player
      this.liveGame[roomName] = { player1 : socket.data.user.username, is_special_game : playWithPowerUP };
      // join the room socket
      await socket.join(roomName);
      // init the front for player 1
      socket.emit('init', 1);
      // set the creator to player mode
      socket.data.status = "play";
      console.log('===========AFTER CREATE============')
      console.log('clientROOMS : ', this.clientRooms);
      console.log('live GAME : ', this.liveGame);
      console.log('State : ', this.state);
    }
    // [JOIN] the game if somebody is already in queue
    else {
      (playWithPowerUP ? this.stackIndexPowerUPPong++ : this.stackIndexBasicPong++)
      if (this.state[roomName])
        this.state[roomName].userID = socket.data.user.id;
      // set the creator to player 1
      socket.data.number = 2;
      this.clientRooms[socket.id] = roomName;
      // Store the username to render OnLiveGame player
      if (this.liveGame[roomName])
        this.liveGame[roomName].player2 = socket.data.user.username;
      // join the room socket
      await socket.join(roomName);

      socket.emit('init', 2);
      // init the front for player 2

      // --------------------- Change Users Status -----------------------------
      await this.GameService.changeUsersStatus(this.server, roomName);
      // -----------------------------------------------------------------------

      // Animation to warn players the game is starting
      // set the creator to player mode
      socket.data.status = "play"
      // maj des onLiveGame vers les autres clients
      this.server.emit('pushLiveGame', this.liveGame);
      console.log('===========AFTER START============')
      console.log('clientROOMS : ', this.clientRooms);
      console.log('live GAME : ', this.liveGame);
      console.log('State : ', this.state);
        // await this.startGameAnimation()
      if (this.liveGame[roomName].is_special_game)
        this.server.to(roomName).emit('startGameAnimation')
      else
        this.startGameInterval(roomName, false);
      console.log('start game ANIIIIFFFF')

    }
  }

  // start the game when both player are connected and animation is finished
  @SubscribeMessage('startGame')
  startGame(socket: Socket) {
    const roomName = this.clientRooms[socket.id];
    this.startGameInterval(roomName, this.liveGame[roomName])
  }

  @SubscribeMessage('spec')
  handleSpecGame(socket: Socket, roomName: string) {

    let   roomSize = 0;
    const room = this.server.sockets.adapter.rooms.get(roomName)

    if (room)
      roomSize = this.server.sockets.adapter.rooms.get(roomName).size;
    if (roomSize === 0) {
      socket.emit('unknownCode');
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
        text: "Game Paused.",
        duration: 6000
      });
    }
    else {
      console.log('gandlePause')
      console.log( this.liveGame[this.clientRooms[socket.id]].is_special_game)
      this.startGameInterval(this.clientRooms[socket.id], this.liveGame[this.clientRooms[socket.id]].is_special_game);
      this.server.sockets.in(this.clientRooms[socket.id]).emit('notify', {
        title: "Important message",
        text: "Game Resumed by player",
        duration: 6000
      });
    }
  }

  @SubscribeMessage('keydown')
  async handleKeyDown(socket: Socket, keyCode: string) {

    let keyCodeInt: number
    const roomName: string = this.clientRooms[socket.id];

    if (!roomName || socket.data.status != "play")
      return;
    try {
      keyCodeInt = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }
    if (roomName)
      this.GameService.getUpdatedVelocity(false, keyCodeInt, this.state[roomName].players[socket.data.number - 1], socket.data.number);
  }

  @SubscribeMessage('keyup')
  async handleKeyup(socket: Socket, keyCode: string) {
    const roomName: String = this.clientRooms[socket.id];
    if (!roomName || socket.data.status != "play")
      return;

    this.GameService.getUpdatedVelocity(true, parseInt(keyCode), this.state[this.clientRooms[socket.id]].players[socket.data.number - 1], socket.data.number);
  }

  @SubscribeMessage('getStatus')
  async senddStatus(socket: Socket, userId: number) {
    const user: UserEntity = await this.userService.findById(userId);
    
    socket.emit("status", user.isOnline, user.id)
  }

  @SubscribeMessage('msg')
  broadcastMsg(socket: Socket, msg: string) {
    const room = [this.clientRooms[socket.id]];
    this.server.sockets.in(room).emit('broadcastMsg', msg);
  }

  @SubscribeMessage('getLiveGame')
  async myMessage (socket: Socket) {
     return {
      clientRooms : this.clientRooms
     }
  }

  // C'est celui qui marche


  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  startGameInterval(roomName: string, playWithPowerUP : boolean) {
    this.state[roomName].intervalId = setInterval(() => {

      const winner = this.GameService.gameLoop(this.state[roomName], playWithPowerUP);
      if (!winner) {
        this.emitGameState(roomName);
      }
      else {
        this.emitGameState(roomName);
        this.emitGameOver(roomName, winner, -1);
        clearInterval(this.state[roomName].intervalId);
      }
    }, 1000 / FRAME_RATE);
  }

  emitGameState(roomName: string) {
    // Send this event to everyone in the room.
    this.server.to(roomName)
      .emit('gameState', JSON.stringify(this.state[roomName]));
  }

  async emitGameOver(roomName: string, winner: number, disconnectedPlayerId: number) {
    const room = [];
    room.push(roomName) // parce qu'on peut pas passer de string direct apparemment...

 
    // --------------------- Change Users Status -----------------------------
    await this.GameService.changeUsersStatus(this.server, roomName);
    // -----------------------------------------------------------------------

    let playersSockets = this.server.sockets.adapter.rooms.get(roomName);
    let winnerId, loserId;


    if (disconnectedPlayerId != -1)
      loserId = disconnectedPlayerId; // je garde l 'id du mec qui a deco vue que j ai plus acces a son socket

    // Disconnect both players to the room 
    if (!playersSockets)
      return;
    for (const playerId of playersSockets) {
      //this is the socket of each client in the room.
      const clientSocket = this.server.sockets.sockets.get(playerId);

      clientSocket.data.status = "connected";

      delete this.clientRooms[playerId];
      if (winner == clientSocket.data.number)
        winnerId = clientSocket.data.user.id;
      else
        loserId = clientSocket.data.user.id;
    }
    const players: UserEntity[] = await this.userService.findManyIds([winnerId, loserId]);

    let score: number = (this.state[roomName].score.p1 > this.state[roomName].score.p2) ? this.state[roomName].score.p2 : this.state[roomName].score.p1;

    // save the game score for Match History 
    this.MatchHistoryService.create({
      players: players,
      winnerId: winnerId,
      loserId: loserId,
      score: score,
    })
    // Modif xp & match history for the players
    this.userService.updateUserScore(players, winnerId);// <-- C'est ça qui cause les CORS à la fin du jeu
    if (roomName && this.state[roomName].is_public == true) {
      console.log('powerUp before -> ', this.stackIndexPowerUPPong);
      console.log('basic before -> ', this.stackIndexBasicPong);
      if (this.liveGame[roomName]?.is_special_game) {
        this.stackIndexPowerUPPong -= 2;
      }
      else if (this.liveGame[roomName])
        this.stackIndexBasicPong -= 2;

    }

    if (this.liveGame[roomName]) {
      this.server.sockets.in(room).emit('gameOver', winner === 1 ? this.liveGame[roomName].player1 : this.liveGame[roomName].player2);
      this.server.sockets.in(room).emit('reset');
    }
    
    if (this.liveGame[roomName])
      delete this.liveGame[roomName];
    if (this.state[roomName])
      delete this.state[roomName];
    
    // refresh the Live Game for the frontend
    this.server.emit('pushLiveGame', this.liveGame);
  

    console.log('===========OVEEEER============')
    console.log('clientROOMS : ', this.clientRooms);
    console.log('live GAME : ', this.liveGame);
    console.log('State : ', this.state);
    console.log('powerUp after -> ', this.stackIndexPowerUPPong);
    console.log('basic after -> ', this.stackIndexBasicPong);
  }
} 