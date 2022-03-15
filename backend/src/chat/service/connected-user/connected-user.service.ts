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
        return this.connectedUserRepository.save(connectedUser);
    }

    async findByUser(user: UserDto): Promise<ConnectedUserI[]> {
        return this.connectedUserRepository.find({user});
    }

    async deleteBySocketID(socketID: string) {
        return this.connectedUserRepository.delete({socketID})
    }
}
