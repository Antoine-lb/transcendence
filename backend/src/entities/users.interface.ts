import { GameEntity } from 'src/gamee/model/game.entity';

export interface UserInterface {
    id?: number;
    username?: string;
    avatar?: string;
    isTwoFA?: boolean;
    secret?: string;
    isOnline?: boolean;
    game?: GameEntity;
}
