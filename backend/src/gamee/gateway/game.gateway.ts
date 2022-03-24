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
 

 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
 
   constructor(
     private authService: AuthService,
     private userService: UsersService,
    ) { }
  
   
   
   @WebSocketServer() server: Server;
   
   async onModuleInit() {
   }
 
  async handleConnection(socket: Socket, payload: string) {

    console.log('GAME!');
    socket.emit('test', {data: "hello form server"});

    try {
      const decodedToken = await this.authService.verifyToken(socket.handshake.headers.authorization);

      const user = await this.userService.findById(decodedToken.id);

      if (!user) {
        return this.disconnect(socket);
      }
      else {

        console.log('user in handleConnection', user)

      }
    }
    catch {
      console.log('disconnect socket', )
      return this.disconnect(socket);
    }

  }
   
//   @SubscribeMessage('keydown')
//   async handleKeydown(socket: Socket) {
//     console.log('keydown')
//     const roomName = clientRooms[client.id];
//     if (!roomName) {
//       return;
//     }
//     try {
//       keyCode = parseInt(keyCode);
//     } catch(e) {
//       console.error(e);
//       return;
//     }
  
//     const vel = getUpdatedVelocity(keyCode);
  
//     if (vel) {
//       state[roomName].players[client.number - 1].vel = vel;
//     }
//     // prevent paddles from going through walls
//     if (state[roomName].players[client.number - 1].y < grid) {
//       state[roomName].players[client.number - 1].y = grid;
//     }
//     else if (state[roomName].players[client.number - 1].y > maxPaddleY) {
//       state[roomName].players[client.number - 1].y = maxPaddleY;
//     }
//   }
   
//   @SubscribeMessage('joinGame')
//   async handleJoinGame(socket: Socket) {

//     const room = io.sockets.adapter.rooms[roomName];

//     let allUsers;
//     if (room) {
//       allUsers = room.sockets;
//     }
  
//     let numClients = 0;
//     if (allUsers) {
//       numClients = Object.keys(allUsers).length;
//     }
  
//     if (numClients === 0) {
//       client.emit('unknownCode');
//       return;
//     } else if (numClients > 1) {
//       client.emit('tooManyPlayers');
//       return;
//     }
  
//     clientRooms[client.id] = roomName;
  
//     client.join(roomName);
//     client.number = 2;
//     client.emit('init', 2);
    
//     startGameInterval(roomName);
//   }
   
//   @SubscribeMessage('newGame')
//   async handleNewGame(socket: Socket) {
//   let roomName = makeid(5);
//   console.log("handleNewGame : ", roomName);
//   clientRooms[client.id] = roomName;
//   client.emit('gameCode', roomName);

//   state[roomName] = initGame();

//   client.join(roomName);
//   client.number = 1;
//   client.emit('init', 1);

//   }
     
//   @SubscribeMessage('keyDown')
//   async handleKeyDown(socket: Socket) {
//     const roomName = clientRooms[client.id];
//   if (!roomName) {
//     return;
//   }
//   try {
//     keyCode = parseInt(keyCode);
//   } catch(e) {
//     console.error(e);
//     return;
//   }

//   const vel = getUpdatedVelocity(keyCode);

//   if (vel) {
//     state[roomName].players[client.number - 1].vel = vel;
//   }
//   // prevent paddles from going through walls
//   if (state[roomName].players[client.number - 1].y < grid) {
//     state[roomName].players[client.number - 1].y = grid;
//   }
//   else if (state[roomName].players[client.number - 1].y > maxPaddleY) {
//     state[roomName].players[client.number - 1].y = maxPaddleY;
//   }
  
//   }
   
//   @SubscribeMessage('keyDown')
//   async handleKeyDown(socket: Socket) {
  
  
  
//   }

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

//  function startGameInterval(roomName) {
//   const intervalId = setInterval(() => {
//     const winner = gameLoop(state[roomName]);
//     console.log("startGameInterval winner :", winner)
//     if (!winner) {
//       emitGameState(roomName, state[roomName])
//     } else {
//       emitGameOver(roomName, winner);
//       state[roomName] = null;
//       clearInterval(intervalId);
//     }
//   }, 1000 / FRAME_RATE);
//   }
  
//   function emitGameState(room, gameState) {
//   // Send this event to everyone in the room.
//   io.sockets.in(room)
//     .emit('gameState', JSON.stringify(gameState));
//   }
  
//   function emitGameOver(room, winner) {
//   io.sockets.in(room)
//     .emit('gameOver', JSON.stringify({ winner }));
//   }