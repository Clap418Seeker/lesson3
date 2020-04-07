import {getRange} from "./range";
import {GameError} from "./error";


export class Game {
    
    private readonly _MATRIX_LENGTH = 2;
    private readonly _game: number[][];
    private _winner = 0;
    get GameData() { return this._game; }
    get Winner() { return this._winner; }
    // getGameData = () => this._game;
    // getWinner = () => this._winner;
    
    CurrentPlayer: 1 | 2;
    
    
    constructor(save: number[][] = null) {
        this._game = save ? save : this.newGame();
        this.CurrentPlayer = 1;
    }
    
    newGame = () => Array(this._MATRIX_LENGTH + 1)
        .fill(0)
        .map(x => Array(this._MATRIX_LENGTH + 1).fill(0));
    
    
    turn(y: number, x: number): boolean {
        if (this._winner !== 0) return false;
        const player = this.CurrentPlayer;
        x--; y--;
        if (x < 0 || x > this._MATRIX_LENGTH || y < 0 || y > this._MATRIX_LENGTH) throw new GameError(`Так нельзя ходить ${y+1}, ${x+1}`);
        if (this._game[x][y] !== 0) throw new GameError(`Клетка занята игроком ${this._game[x][y]}`);
        this._game[x][y] = player;

        this._winner = this.checkWinner(this._game, player);
        this.switchPlayer();
        return (this._winner === 0);
    }
    
    checkWinner(game: number[][], player: 1 | 2): number {
        const range = getRange(0, this._MATRIX_LENGTH);
        for (let i of range) {
            if (this._game[i].every(x => x === player)
                || this._game.map(g => g[i]).every(x => x === player)
                || this._game.map((g, ind) => g[ind]).every(x => x === player)
                || this._game.map((g, ind) => g[this._MATRIX_LENGTH - ind]).every(x => x === player))
                return player;
        }
        
        return this.checkNil(game) ? -1 : 0;
    }
    
    checkNil(elem: number[][] | number[] | number) {
        if (Array.isArray(elem))
            return elem.every(x => this.checkNil(x));
        return elem !== 0;
        
    }
    
    switchPlayer () {
        this.CurrentPlayer = this.CurrentPlayer === 1 ? 2 : 1;
    }
    
    setWinner(win: 1 | 2): void {
        if (this._winner == 0)
            this._winner = win;
    }
}