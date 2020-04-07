import {authService, AuthService} from "../services/auth-service";
import {AuthorizedRequest} from "../lib/request";
import {NextFunction, Response} from "express";
import {HTTP_CODES} from "../constants";
import {GameError} from "../game/error";

class ErrorsMiddleware {
    constructor() {
    }

    get build() { return () => this.use.bind(this); }

    use(err: Error, req: AuthorizedRequest, res: Response, next: NextFunction) {
        if (err instanceof GameError) {
            console.log(`ERROR: ${err.message}`);
            res.status(HTTP_CODES.BadRequest).send(err.message);
        } else {
            next(err);
        }
    }
}

export const errorsMiddleware = new ErrorsMiddleware();