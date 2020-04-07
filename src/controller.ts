import {Sessions} from "./sessions";
import {SESSION_TIMEOUT} from "./constants";
import {GameError} from "./game/error";
import {GameSession} from "./game/game-session";
import {IUser, User} from "./user";
import {GameStatuses} from "./game/game-statuses";
import {GameDto} from "./types/game-dto";
import {WinStatus} from "./types/win-status";

export class GameController {
    
    private readonly sessions: Sessions<GameSession>;
    
    constructor() {
        this.sessions = new Sessions<GameSession>(SESSION_TIMEOUT);
    }
    
    getGame(user: IUser): GameSession {
        if (!(user && user.id)) throw new GameError(`Игрок не авторизирован`);
        return this.sessions.get(user.id);
    }

    move(x: number, y: number, user: User): void {
        const game = this.getGame(user);
        if (!game) throw new GameError('Игровая сессия не найдена');
        game.turn(x, y, user);
    }

    getField(user: User): GameDto {
        const game = this.getGame(user);
        if (!game)  {
            return null;
        }
        switch (game.Status) {
            case GameStatuses.pendingTurn:
            case GameStatuses.waitingPlayer:
                return { fields: game.getFields(), status: WinStatus.None};
            case GameStatuses.draw:
                return { fields: game.getFields(), status: WinStatus.Draw};
            case GameStatuses.existWinner:
                const status = game.Winner.id == user.id ? WinStatus.Win : WinStatus.Fail;
                return { fields: game.getFields(), status };
        }
    }

    setState(state: number[][], user: User) {
        this.sessions.set(user.id, new GameSession(user, state));
    }

    getWinner(gameId) {
        return this.sessions.get(gameId)?.Winner;
    }

    selectPlayer(player: User) {
        this.sessions.get(player.id)?.selectPlayer(player);
    }
    
    listGames(): {gameId: string, ownerName: string}[] {
        return this.sessions
            .filter((gs) => gs.Status === GameStatuses.waitingPlayer)
            .map(x => ({gameId: x.Owner.id, ownerName: x.Owner.login}));
    }
    
    joinInGame(gameId: string, user: User) {
        const game = this.getGame({ id: gameId });
        if (!game) throw new GameError('Игровая сессия не найдена');
        game.addPlayer(user);
        this.sessions.set(user.id, game);
    }

    exitFromGame(user: User) {
        const game = this.getGame(user);
        if (!game) return;
        game.setWinner(game.getAnother(user));
        this.sessions.gcForce(user.id);
    }
    
    newGame(user: User) {
        if (this.getGame(user)) throw new GameError("Вы уже состоите в игровой сессии, прежде, чем начать новую - завершите старую или выйдите из нее");
        this.sessions.set(user.id, new GameSession(user, null));
    }
}
