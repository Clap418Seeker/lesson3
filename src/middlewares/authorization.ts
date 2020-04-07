import { Response, NextFunction } from 'express'
import {AuthorizedRequest} from "../lib/request";
import {AuthService, authService} from "../services/auth-service";
import {HTTP_CODES} from "../constants";

class AuthorizationMiddleware {
    constructor(private readonly authService: AuthService) {
    }
    
    get build() { return () => this.use.bind(this); }
    
    use(req: AuthorizedRequest, res: Response, next: NextFunction) {
        const userId = req.header('Authorization');
        if (userId) {
            req.user = this.authService.getUser(userId);
            next();
        } else {
            res.status(HTTP_CODES.Unauthorized).send();
        }
    }
}

export const authorizationMiddleware = new AuthorizationMiddleware(authService);