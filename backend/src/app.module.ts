import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TwoFAModule } from './twoFA/twoFA.module';
import { TwoFAController } from './twoFA/twoFA.controller';
import { TwoFAService } from './twoFA/twoFA.service';
import { UserEntity } from './entities/users.entity';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users/users.controller';
import { FriendRequestEntity } from './entities/friends.entity';
// import { PostsModule } from './posts/posts.module';
import { FriendsController } from './friends/friends.controller';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { RoomEntity } from './chat/model/room.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forRoot({
			// https://docs.nestjs.com/techniques/database
			type: 'postgres',
			host: 'database',
			port: Number(5432),
			username: 'ft_root',
			password: 'admin',
			database: 'transcendence',
			entities: [UserEntity, FriendRequestEntity, RoomEntity],
			synchronize: true,
			keepConnectionAlive: true,
		}),
		AuthModule,
		TwoFAModule,
		UsersModule,
		FriendsModule,
		ChatModule,
		MulterModule
	],
	controllers: [UserController, TwoFAController, FriendsController],
	providers: [TwoFAService]
})
export class AppModule {}