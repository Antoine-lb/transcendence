import { UserDto } from "src/entities/users.dto";

export interface GameI {

    id?: number;
    name?: string;
    password?: string;
    player1?: UserDto;
    player2?: UserDto;
    spectators?:  UserDto[];
    status?: boolean;
    protected?: boolean;
    created_at?: Date;
    updated_at?: Date;
}