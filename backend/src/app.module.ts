import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TwoFAModule } from './twoFA/twoFA.module';
import { TwoFAController } from './twoFA/twoFA.controller';
import { TwoFAService } from './twoFA/twoFA.service';
import { UserEntity } from './entities/users.entity';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users/users.controller';
import { FriendRequestEntity } from './entities/friends.entity';
import { FriendsController } from './friends/friends.controller';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { RoomEntity } from './chat/model/room.entity';
import { MulterModule } from '@nestjs/platform-express';
import { testMiddleware } from './middleware/test-middleware';
import { ConnectedUserEntity } from './chat/model/connected.user.entity';
import { MessageEntity } from './chat/model/message.entity';
import { JoinedRoomEntity } from './chat/model/joined-room.entity';
import { UserRoomEntity } from './chat/model/user-room.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
			// https://docs.nestjs.com/techniques/database
			type: 'postgres',
			host: 'database',
			port: Number(5432),
			username: 'ft_root',
			password: 'admin',
			database: 'transcendance',
			entities: [
				UserEntity,
				FriendRequestEntity,
				RoomEntity,
				ConnectedUserEntity,
				MessageEntity,
				JoinedRoomEntity,
				UserRoomEntity
			],
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
	export class AppModule implements NestModule {
		configure(consumer: MiddlewareConsumer) {
		  consumer
			.apply(testMiddleware)
			.forRoutes('*');
		}
}