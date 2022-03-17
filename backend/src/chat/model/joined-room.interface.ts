import { Interface } from "readline";
import { UserDto } from "src/entities/users.dto";
import { RoomI } from "src/chat/model/room.interface";

export interface JoinedRoomI {
 
    id?: number;
    socketID: string;
    user: UserDto;
    room: RoomI;
}1