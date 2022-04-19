import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { RoomService } from 'src/chat/service/room-service/room.service';
import { UserRoomService } from 'src/chat/service/user-room/user-room.service';
import { RoomEntity } from 'src/chat/model/room.entity';
import { UserRoomEntity } from 'src/chat/model/user-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoomEntity, UserRoomEntity])],
  providers: [UsersService, RoomService, UserRoomService],
  exports: [UsersService]
})
export class UsersModule {}