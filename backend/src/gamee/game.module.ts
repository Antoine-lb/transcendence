import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './service/game/game.service';
import { GamePlayedEntity } from './model/gamePlayed.entity';
import { StateEntity } from './model/state.entity';

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
const canvas = { width : 750, height : 585};

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([
      GamePlayedEntity,
      StateEntity,
    ]),
  ],
  providers: [GameGateway, GameService]
})
export class GameModule {}
