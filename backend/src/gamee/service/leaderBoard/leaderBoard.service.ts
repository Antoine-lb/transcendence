import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderBoardI } from 'src/gamee/model/leaderBoard.interface';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { LeaderBoardEntity } from 'src/gamee/model/leaderBoard.entity';
import { UserDto } from 'src/entities/users.dto';

@Injectable()
export class LeaderBoard {

    constructor(
        @InjectRepository(LeaderBoardEntity)
        private readonly leaderBoardRepository: Repository<LeaderBoardEntity>
    ) { }
    
    async create(gameStatus: LeaderBoardI): Promise<LeaderBoardI> {
        return this.leaderBoardRepository.save(this.leaderBoardRepository.create(gameStatus));
    }

    async findGamesForRoom(user: UserDto, options: IPaginationOptions): Promise<Pagination<LeaderBoardI>> {
        const query = this.leaderBoardRepository
            .createQueryBuilder('leaderBoard')
            .where('leaderBoard.winner.id = :userID', { userID: user.id })
            .andWhere('leaderBoard.loser.id = :userID', { userID: user.id })
            .leftJoinAndSelect('message.user', 'user')
            .orderBy('message.created_at', 'ASC');
        
        return paginate(query, options);
    }
}
