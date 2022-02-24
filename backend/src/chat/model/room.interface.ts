import { BasicUser } from "src/users/users.dto";

export interface RoomI {

    id?: number;
    name?: string;
    description?: String;
    users?: BasicUser[];
    created_at?: Date;
    updated_at?: Date;

}