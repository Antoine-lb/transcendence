import { Injectable } from '@nestjs/common';
import { ConnectedUserEntity } from 'src/chat/model/connected.user.entity';
import { ConnectedUserI } from 'src/chat/model/connected.user.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/entities/users.dto';

@Injectable()
export class ConnectedUserService {

    constructor(
        @InjectRepository(ConnectedUserEntity)
        private readonly connectedUserRepository: Repository<ConnectedUserEntity>
    ) { }
    
    async create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
        return await this.connectedUserRepository.save(connectedUser);
    }

    async findByUser(user: UserDto): Promise<ConnectedUserI[]> {
        var ret = await this.connectedUserRepository.find({
            where: {
                user: user,
            },
        });
        return ret;
    }

    async deleteBySocketID(socketID: string) {
        return await this.connectedUserRepository.delete({socketID})
    }

    async deleteAll() {
        await this.connectedUserRepository
            .createQueryBuilder()
            .delete()
            .execute();
    }
}
