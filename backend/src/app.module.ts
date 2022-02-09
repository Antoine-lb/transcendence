import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
			// https://docs.nestjs.com/techniques/database
			type: 'postgres',
			host: 'localhost',
			port: Number(5432),
			username: 'ft_root',
			password: 'admin',
			database: 'db',
			entities: [ User, ],
			synchronize: true,
		}),
    
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
