import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './gateway/chat.gateway';
import { RoomEntity } from './model/room.entity';
import { RoomService } from './service/room-service/room.service';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { ConnectedUserEntity } from './model/connected.user.entity';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([RoomEntity, ConnectedUserEntity])],
  providers: [ChatGateway, RoomService, ConnectedUserService]
})
export class ChatModule {}
