import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './gateway/chat.gateway';
import { RoomEntity } from './model/room.entity';
import { RoomService } from './service/room-service/room.service';
import { ConnectedUserService } from './service/connected-user/connected-user.service';
import { ConnectedUserEntity } from './model/connected.user.entity';
import { JoinedRoomService } from './service/joined-room/joined-room.service';
import { MessageService } from './service/message/message.service';
import { UserRoomService } from './service/user-room/user-room.service';
import { MessageEntity } from './model/message.entity';
import { JoinedRoomEntity } from './model/joined-room.entity';
import { UserRoomEntity } from './model/user-room.entity';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([
    RoomEntity,
    ConnectedUserEntity,
    MessageEntity,
    JoinedRoomEntity,
    UserRoomEntity
    ]),
  ],
  providers: [ChatGateway, RoomService, ConnectedUserService, JoinedRoomService, UserRoomService, MessageService]
})
export class ChatModule {}
