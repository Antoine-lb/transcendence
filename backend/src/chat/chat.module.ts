import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './gateway/chat.gateway';
// import { RoomService } from './service/room-service/room/room.service';
// import { RoomEntity } from './model/room.entity';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [ChatGateway]
})
export class ChatModule {}
