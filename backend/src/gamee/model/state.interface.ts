export interface StateI {
    
    id: number;

    score?: { p1?: number, p2?:number },
    ball?:  { 
        x?: number;
        y?: number;
        dx?: number;
        dy?: number;
        }
    
    players?: [{
        x?: number;
        y?: number;
        vel: number;
        },{
        x?: number;
        y?: number;
        vel?: number;
    }]
}
