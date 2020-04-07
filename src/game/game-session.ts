import {GameStatuses} from "./game-statuses";
import {Game} from "./tictactoe";
import {User} from "../user";
import {GameError} from "./error";


export class  GameSession {
    private readonly _game: Game;
    private readonly _owner: User;
    private _secondPlayer: User;
    
    get Owner() { return this._owner; }
    
    get CurrentPlayer() { return this._game.CurrentPlayer === 1 ? this._owner : this._secondPlayer; }
    get Winner() {
        return this.Status == GameStatuses.draw ? null :this._game.Winner === 1 ? this._owner : this._secondPlayer;
    }
    
    getAnother(user: User) {
        return this._owner.id == user.id ? this._secondPlayer : this._owner;
    }
    
    constructor(owner: User, save: number[][] = null) {
        this._game = new Game(save);
        this._owner = owner;
    }
    
    getMessage(status: GameStatuses) {
        switch(status) {
            case GameStatuses.pendingTurn: return `Сейчас очередь игрока: ${this.CurrentPlayer.login}`;
            case GameStatuses.draw: return "Игра завершена: ничья";
            case GameStatuses.waitingPlayer: return "Ожидание второго игрока";
            case GameStatuses.existWinner: 
                return `Игра завершена: победил игрок ${this.Winner.login}`;
        }
    }

    get Status(): GameStatuses {
        if (!this._secondPlayer) {
            return GameStatuses.waitingPlayer;
        }
        
        switch(this._game.Winner) {
            case 0: return GameStatuses.pendingTurn;
            case 1: 
            case 2: return GameStatuses.existWinner;
            case -1: return GameStatuses.draw;
        }
        
        throw new Error("Неожиданный статус");
    }
    
    
    
    turn(x: number, y: number, player: User) {
        if (this.CurrentPlayer.id != player.id || this.Status !== GameStatuses.pendingTurn) 
            throw new GameError(this.getMessage(this.Status));
        
        this._game.turn(x, y);
    }
    
    getFields() {
        return this._game.GameData;
    }
    
    selectPlayer(player: User) {
        if (this._owner.id == player.id) {
            this._game.CurrentPlayer = 1;
            return;
        }
        if (this._secondPlayer.id == player.id) {
            this._game.CurrentPlayer = 2;
            return;
        }

        throw new Error("Неверный пользователь");
    }
    
    addPlayer(player) {
        this._secondPlayer = player;
    }
    
    setWinner(user: User) {
        this._game.setWinner(this.Owner.id == user.id ? 1 : 2);
    }
}