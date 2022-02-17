import { Module } from '@nestjs/common';
import { TwoFAService } from './twoFA.service';
import { TwoFAController } from './twoFA.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [TwoFAController],
    providers: [TwoFAService],
})
export class TwoFAModule { }
