import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './entities/users.entity';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users/users.controller';
import { FriendRequestEntity } from './entities/friends.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
			// https://docs.nestjs.com/techniques/database
			type: 'postgres',
			host: 'database',
			port: Number(5432),
			username: 'ft_root',
			password: 'admin',
			database: 't_db',
			entities: [ UserEntity, FriendRequestEntity],
			synchronize: true,
			keepConnectionAlive: true,
		}),
    AuthModule,
    UsersModule,],
  controllers: [UserController],
})
export class AppModule {}