import { Interface } from "readline";
import { UserDto } from "src/entities/users.dto";
import { RoomI } from "src/chat/model/room.interface";
import { UserRoomRole } from "./user-room.entity";

export interface UserRoomI {
 
    id?: number;
    user: UserDto;
    room: RoomI;
    role: UserRoomRole;
}