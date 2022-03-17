import { UserDto } from "src/entities/users.dto";

export interface RoomI {

    id?: number;
    name?: string;
    users?: UserDto[];
    created_at?: Date;
    updated_at?: Date;
}