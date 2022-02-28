import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './gateway/chat.gateway';
import { RoomEntity } from './model/room.entity';
import { RoomService } from './service/room-service/room/room.service';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([RoomEntity])],
  providers: [ChatGateway, RoomService]
})
export class ChatModule {}
