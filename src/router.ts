// ﻿const router = require('express').Router();
// const controller = require('./controller');
// const appRoot = require('../app-root-path');
import {appRoot} from '../app-root-path';
import * as express from 'express'
import {GameController} from "./controller";
import * as core from "express-serve-static-core";
import {authorizationMiddleware} from "./middlewares/authorization";
import {AuthorizedRequest} from "./lib/request";
import {AuthService, authService} from "./services/auth-service";

export interface ISharedRouter {
    build(): express.Router;
}

export class Routers implements ISharedRouter  {
    
    //private readonly controller: GameController;
    constructor(
        private readonly controller: GameController, 
        private readonly router: express.Router, 
        private readonly authService: AuthService) {
        //this.controller = new GameController();
        this.init();
    }
    
    build() { return this.router; }
    
    private init() {
        this.router.get('/', (req, res) => {
            if(appRoot)
                res.sendFile('/wwwroot/index.html', { root: appRoot });
            else
                res.status(200).send(appRoot);
        });

        this.router.get('/getField', authorizationMiddleware.build(), (req: AuthorizedRequest, res) => {
            res.status(200).send(this.controller.getField(req.user));
        });

        this.router.post('/move', authorizationMiddleware.build(), (req: AuthorizedRequest, res) => {
            const {x, y} = req.body;
            this.controller.move(x, y, req.user);
            res.status(200).send();
        });
        
        this.router.post('/login',(req, res) => {
            const user = this.authService.login(req.body.login, req.body.password);
            if (user) {
                res.status(200).send({id: user.id});
            }
            else
            {
                res.status(400).send('Неверный логин или пароль');
            }
        });

        this.router.post('/register',(req, res) => {
            const user = this.authService.register(req.body.login, req.body.password);
            if (user) {
                res.status(200).send({id: user.id});
            }
            else
            {
                res.status(400).send('Пользователь с таким логином уже существует');
            }
        });

        this.router.get('/listGames', authorizationMiddleware.build(), (req: AuthorizedRequest, res) => {
            res.status(200).send(this.controller.listGames());
        });

        this.router.post('/join', authorizationMiddleware.build(), (req: AuthorizedRequest, res) => {
            this.controller.joinInGame(req.body.id, req.user);
            res.status(200).send();
        });

        this.router.post('/newGame', authorizationMiddleware.build(), (req: AuthorizedRequest, res) => {
            this.controller.newGame(req.user);
            res.status(200).send();
        });

        this.router.delete('/exit', authorizationMiddleware.build(), (req: AuthorizedRequest, res) => {
            this.controller.exitFromGame(req.user);
            res.status(200).send();
        });
    }
}

export const routers = new Routers(new GameController(), express.Router(), authService);