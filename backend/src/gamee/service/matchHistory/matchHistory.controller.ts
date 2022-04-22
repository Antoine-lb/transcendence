import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, UseGuards, Res, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Jwt2FAGuard } from 'src/auth/jwt2FA.guard';
import { MatchHistoryService } from 'src/gamee/service/matchHistory/matchHistory.service';
import { ParseIntPipe, NotFoundException, UnsupportedMediaTypeException, PayloadTooLargeException} from '@nestjs/common';



@ApiTags('history')
@Controller('history')
@UseGuards(JwtAuthGuard)
export class MatchHistoryController {
    constructor(
        private readonly MatchHistoryService: MatchHistoryService
    ) { }
    
    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Get(':id')
    async findHistory(@Param('id', new ParseIntPipe()) id: number): Promise<any> {
        return await this.MatchHistoryService.findGamesForUser(id, { page: 1, limit: 100 });
    }
}
 