import { UserDto } from "src/entities/users.dto";


export interface ConnectedUserI {

    id?: number;
    socketID: string;
    user: UserDto;
}