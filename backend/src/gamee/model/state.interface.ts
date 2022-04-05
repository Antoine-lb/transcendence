export interface StateI {
    
    id?: number;
    gameState: string;
    score: { p1: number, p2:number },
    ball:  { 
        x: number;
        y: number;
        dx: number;
        dy: number;
        resetting: Boolean;
        }
    
    players: [{
        x: number;
        y: number;
        vel: number;
        option : null

        },{
        x: number;
        y: number;
        vel: number;
        option: null;
        }], 
    
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