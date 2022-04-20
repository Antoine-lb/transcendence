import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { UserRoomService } from 'src/chat/service/user-room/user-room.service';
import { RoomEntity } from 'src/chat/model/room.entity';
import { UserRoomEntity } from 'src/chat/model/user-room.entity';
import { GameModule } from 'src/gamee/game.module';
import { GamePlayedEntity } from 'src/gamee/model/gamePlayed.entity';
import { MatchHistoryService } from './matchHistory.service';

@Module({
  imports: [
        TypeOrmModule.forFeature([GamePlayedEntity])],
  providers: [MatchHistoryService],
  exports: [MatchHistoryService]
})
export class MatchHistoryModule {}