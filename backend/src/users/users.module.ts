import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { FriendRequestEntity } from 'src/entities/friends.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FriendRequestEntity])],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
