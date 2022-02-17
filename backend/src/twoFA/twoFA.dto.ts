import { IsNumber, IsString } from "class-validator";

export class BasicTwoFA {
    @IsNumber()
    id: number;

    @IsString()
    twoFACode: string;
}