import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/chat/model/message.entity';
import { MessageI } from 'src/chat/model/message.interface';
import { RoomI } from 'src/chat/model/room.interface';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';


@Injectable()
export class MessageService {

    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepository: Repository<MessageEntity>
    ) {}
    
    async create(message: MessageI): Promise<MessageI> {
        return this.messageRepository.save(this.messageRepository.create(message));
    }

    async findMessageForRoom(room: RoomI, options: IPaginationOptions): Promise<Pagination<MessageI>> {
        const query = this.messageRepository
            .createQueryBuilder('message')
            .leftJoin('message.room', 'room')
            .where('room.id = :roomID', { roomID: room.id })
            .leftJoinAndSelect('message.user', 'user')
            .orderBy('message.created_at', 'ASC');
        return paginate(query, options);
    }
}
