import { UserDto } from "src/entities/users.dto";
import { RoomI } from "src/chat/model/room.interface";
import { DatabaseType } from "typeorm";

export interface MessageI {
    id?: number;
    text: string;
    user: UserDto;
    room: RoomI;
    created_at: Date;
    updated_at: Date;
}