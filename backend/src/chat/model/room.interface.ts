import { UserDto } from "src/entities/users.dto";

export interface RoomI {

    id?: number;
    name?: string;
    users?: UserDto[];
    admins?:  UserDto[];
    status?: boolean;
    protected?: boolean;
    created_at?: Date;
    updated_at?: Date;
}