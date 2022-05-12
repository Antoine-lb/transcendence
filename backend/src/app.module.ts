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
import { GameModule } from './gamee/game.module';
import { UserRoomEntity } from './chat/model/user-room.entity';
import { MatchHistoryModule } from './gamee/service/matchHistory/matchHistory.module';
import { GamePlayedEntity } from './gamee/model/gamePlayed.entity';
import { MatchHistoryController } from './gamee/service/matchHistory/matchHistory.controller';

@Module({
	
  imports: [
    TypeOrmModule.forRoot({
			// https://docs.nestjs.com/techniques/database
			type: 'postgres',
			host: process.env.POSTGRES_HOST,
			port: Number(process.env.POSTGRES_PORT),
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [
				UserEntity,
				FriendRequestEntity,
				RoomEntity,
				ConnectedUserEntity,
				MessageEntity,
				JoinedRoomEntity,
				UserRoomEntity,
				GamePlayedEntity
			],
			synchronize: true,
			keepConnectionAlive: true,
		}),
		AuthModule,
		TwoFAModule,
		UsersModule,
		FriendsModule,
		ChatModule,
		MulterModule,
		GameModule,
		MatchHistoryModule
	],
	controllers: [UserController, TwoFAController, FriendsController, MatchHistoryController],
	providers: [TwoFAService]
})
	export class AppModule implements NestModule {
		configure(consumer: MiddlewareConsumer) {
		  consumer
			.apply(testMiddleware)
			.forRoutes('*', '/api/auth/islog');
		}
}