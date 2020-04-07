import {v4 as uuid} from 'uuid';
import * as crypto from 'crypto-js';

export interface IUser {
    id: string;
    login?: string; //HACK???
    hash?: string;
}

export class User implements IUser {
    id: string;
    login: string;
    hash: string;
    constructor(login: string, password: string) {
        this.id = uuid();
        this.login = login;
        this.hash = crypto.MD5((password)).toString();
    }
    
    checkPassword(password) {
        return this.hash === crypto.MD5(password).toString();
    }
}