import { PlayerI } from "./player.interfae"

export interface StateI {
    
    id: number;
    gameState: string;
    score: { p1: number, p2:number },
    ball:  { 
        x: number;
        y: number;
        dx: number;
        dy: number;
        resetting: Boolean;
        }
    
    players: PlayerI[],
    
    powerUp: [{
        x: number;
        y: number;
      },
      {
        x: number;
        y: number;  
    }],
    powerUp_t: string;
    launchPowerUp: Boolean;
}