import { Module } from '@nestjs/common';
import { TwoFAService } from './twoFA.service';
import { TwoFAController } from './twoFA.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [UsersModule, AuthModule],
    controllers: [TwoFAController],
    providers: [TwoFAService],
})
export class TwoFAModule { }