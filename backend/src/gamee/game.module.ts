import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './service/game/game.service';
import { GamePlayedEntity } from './model/gamePlayed.entity';
import { StateEntity } from './model/state.entity';
import { MatchHistoryService } from './service/matchHistory/matchHistory.service';
import { ConnectedUserService } from 'src/chat/service/connected-user/connected-user.service';
import { ConnectedUserEntity } from 'src/chat/model/connected.user.entity';

const FRAME_RATE = 50;
const GRID_SIZE = 20;
///////
const BORDURE = 15;
const GRID_SIZE_H = 117;
const GRID_SIZE_L = 150;
const grid = 15;
const paddleWidth = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = 585 - grid - paddleHeight;
const canvas = { width: 750, height: 585 };

@Module({
  imports: [
    forwardRef(() => UsersModule),
    AuthModule,
    TypeOrmModule.forFeature([
      GamePlayedEntity,
    ]),
  ],
  providers: [GameGateway, GameService, MatchHistoryService, ConnectedUserService]
})
export class GameModule { }
