import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TwoFAModule } from './twoFA/twoFA.module';
import { TwoFAController } from './twoFA/twoFA.controller';
import { TwoFAService } from './twoFA/twoFA.service';
import { UserEntity } from './users/users.entity';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users/users.controller';
// import { PostsModule } from './posts/posts.module';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			// https://docs.nestjs.com/techniques/database
			type: 'postgres',
			// host: 'localhost',
			host: 'database',
			port: Number(5432),
			username: 'ft_root',
			password: 'admin',
			database: 'transcendence',
			entities: [UserEntity,],
			synchronize: true,
			keepConnectionAlive: true,
		}),
		AuthModule,
		TwoFAModule,
		// PostsModule,
		UsersModule],
	controllers: [UserController, TwoFAController],
	providers: [TwoFAService]
})
export class AppModule { }