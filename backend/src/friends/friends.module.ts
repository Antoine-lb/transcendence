import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestEntity } from '../entities/friends.entity';
import { UserEntity } from '../entities/users.entity';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequestEntity]), UsersModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [ FriendsService ]
})
export class FriendsModule {}
