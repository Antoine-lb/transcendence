import { UserDto } from "src/entities/users.dto";

export interface GamePlayedI {
    
    id?: number;
    players: UserDto[];
    winnerId: number;
    score: number;
    created_at?: Date;
}