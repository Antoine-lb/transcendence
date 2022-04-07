import { UserDto } from "src/entities/users.dto";

export interface LeaderBoardI {
    
    id?: number;
    winner: UserDto;
    loser: UserDto;
    score: number;
    created_at: Date;
}