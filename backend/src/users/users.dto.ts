import { IsNumber, IsString } from "class-validator";

export class BasicUser {
    @IsNumber()
    id: number;

    @IsString()
    username: string;

    @IsString()
    avatar?: string;
}