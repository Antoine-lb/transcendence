import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { Guard42 } from './auth.guard';
import { SessionSerializer } from './serializer';
import { JwtModule } from '@nestjs/jwt';
import { OAuth2Strategy } from './auth.strategy';
import { Jwt2FAStrategy} from './jwt2FA.strategy'
import { JwtStrategy } from './jwt.strategy'
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'REPLACE_THIS_SECRET',
      signOptions: { expiresIn: 800000 }}),
    ],
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer, OAuth2Strategy, Guard42, JwtStrategy, JwtAuthGuard, Jwt2FAStrategy],
  exports: [AuthService, JwtStrategy, JwtAuthGuard, Jwt2FAStrategy]
})
export class AuthModule {}
