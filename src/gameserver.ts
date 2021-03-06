﻿import * as express from "express";
import * as fallback from 'express-history-api-fallback'
import {ISharedRouter} from "./router";
import * as cors from 'cors';
import {errorsMiddleware} from "./middlewares/errors";

export class App {
    app: express.Application;
    
    constructor(router: ISharedRouter, private readonly port: number) {
        this.app = express();

        this.initializeMiddlewares();
        this.initializeRouters(router);
        this.initSpaFallback();
        this.initializeErrorHandler();
    }

    private initializeMiddlewares() {
        this.app.use(express.static('wwwroot'));
        this.app.use(cors());
        this.app.use(express.json());
    }

    private initializeRouters(router: ISharedRouter) {
       this.app.use(router.build());
    }
    
    private initializeErrorHandler() {
        this.app.use(errorsMiddleware.build());
    }
    
    private initSpaFallback() {
        this.app.use(fallback('index.html', { root: 'wwwroot' }))
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}