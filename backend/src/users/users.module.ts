import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { FriendRequestEntity } from '../entities/friends.entity';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}