import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { OAuth2Strategy } from './auth.strategy';
import { AuthController } from './auth.controller';
import { Guard42 } from './auth.guard';
import { SessionSerializer } from './serializer';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy'
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'REPLACE_THIS_SECRET',
      signOptions: { expiresIn: '24h' }}),
    ],
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer, OAuth2Strategy, Guard42, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtStrategy, JwtAuthGuard]
})
export class AuthModule {}
