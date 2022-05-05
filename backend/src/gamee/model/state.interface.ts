import { PlayerI } from "./player.interfae"

export interface StateI {

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
        paddleH: number,
        x: number,
        y: number,
        vel: number,
    }, {
        paddleH: number,
        x: number,
        y: number,
        vel: number,
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
    is_public: Boolean;
    status: number;
    userID: number;
}