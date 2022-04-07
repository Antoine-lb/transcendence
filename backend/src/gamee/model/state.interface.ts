import { PlayerI } from "./player.interfae"

export interface StateI {
    
    id?: number;
    gameState: string;
    score: { p1: number, p2: number };
    ball: {
        x: number;
        y: number;
        dx: number;
        dy: number;
        resetting: Boolean;
    }; 
    players: [{
        x: number,
        y: number,
        vel: number,
        option: string,
    }, {
        x: number,
        y: number,
        vel: number,
        option: string,
    }];
    powerUp: [{
        x: number;
        y: number;
    },
    {
        x: number;
        y: number;
    }];
    powerUp_t: string;
    launchPowerUp: Boolean;
    intervalId: NodeJS.Timer;
}