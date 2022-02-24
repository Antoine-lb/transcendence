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
			entities: [UserEntity, FriendRequestEntity],
			synchronize: true,
			keepConnectionAlive: true,
		}),
		AuthModule,
		TwoFAModule,
		UsersModule,
		FriendsModule],
	controllers: [UserController, TwoFAController, FriendsController],
	providers: [TwoFAService]
})
export class AppModule {}