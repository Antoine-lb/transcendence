import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { GamePlayedEntity } from 'src/gamee/model/gamePlayed.entity';
import { GamePlayedI } from 'src/gamee/model/gamePlayed.interface';

@Injectable()
export class MatchHistoryService {

    constructor(
        @InjectRepository(GamePlayedEntity)
        private readonly GamePlayedRepository: Repository<GamePlayedEntity>
    ) { }
    
    async create(gameStatus: GamePlayedI): Promise<GamePlayedI> {
        return this.GamePlayedRepository.save(this.GamePlayedRepository.create(gameStatus));
    }

    async findGamesForUser(userID: number, options: IPaginationOptions): Promise<Pagination<GamePlayedI>> {
        const query = this.GamePlayedRepository
            .createQueryBuilder('gamePlayed')
            .leftJoin('gamePlayed.players', 'players')
            .where('players.id = :userID', { userID })
            .orderBy('gamePlayed.created_at', 'DESC');
        return paginate(query, options);
    }
}
