import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, UseGuards, Res, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Jwt2FAGuard } from 'src/auth/jwt2FA.guard';
import { MatchHistoryService } from 'src/gamee/service/matchHistory/matchHistory.service';


@ApiTags('history')
@Controller('history')
@UseGuards(JwtAuthGuard)
export class MatchHistoryController {
    constructor(
        private readonly MatchHistoryService: MatchHistoryService
    ) { }
    
    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Get(':id')
    async findPHistory(@Res() res, @Request() req): Promise<any> {
        const games = this.MatchHistoryService.findGamesForUser(req.user.id, { page: 1, limit: 100 });
        return res.sendFile(games);
    }
}
 