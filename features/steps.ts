import {Routers, routers} from "../src/router";
//const { Given, When, Then } = require('cucumber');
import { binding, given, when, then } from "cucumber-tsflow";
const request = require('supertest');
const { expect } = require('chai');
import {App} from "../src/gameserver";
import * as express from "express";
import {authService} from "../src/services/auth-service";
import {GameController} from "../src/controller";

let lastError = null;

let gameapp: App = null;
let controller: GameController = null;
let firstTurn = true;

const initApp = () => {
    const newController = new GameController();
    gameapp = new App(new Routers(newController, express.Router(), authService), 2000); 
    controller = newController;
    firstTurn = true;
};

@binding()
class Steps {
    
    @given('игрок {string} начинает игру с пустым полем')
    emptyFields(login: string) {
        initApp();
        const user = authService.findUserByLogin(login);
        controller.setState(null, user);
    }

    @given("игрок {string} начинает игру с полем {string}")
    setFields(login: string, save: string) {
        initApp();
        const user = authService.findUserByLogin(login);
        controller.setState(parseSave(save), user);
    }

    @given("игрок {string} присоединяется к игре игрока {string}")
    joinInGame(login, loginOwner) {
        const user = authService.findUserByLogin(login);
        const owner = authService.findUserByLogin(loginOwner);
        controller.joinInGame(owner.id, user);
    }

    @given("зарегистрирован игрок логин {string} пароль {string}")
    registerPlayer(login: string, password: string) {
        authService.register(login, password);
    }
    
    @when("игрок {string} ходит в клетку {int}, {int}")
    movePlayer(login: string, x: number, y: number) {
        const user = authService.findUserByLogin(login);
        if (firstTurn) {
            controller.selectPlayer(user);
            firstTurn = false;
        }
        return request(gameapp.app)
            .post('/move')
            .set('Authorization', user.id)
            .send({x, y})
            .expect(200)
            .then((res) => {
                lastError = null;
            })
            .catch((err) => {
                lastError = err;
            });
    }

    @then("поле игрока {string} становится {string}")
    fieldsState(login: string, save: string) {
        const user = authService.findUserByLogin(login);
        return request(gameapp.app)
            .get('/getField')
            .set('Authorization', user.id)
            .expect(200)
            .then((res) => {
                console.log(res.body);
                expect(serializeGame(res.body.fields)).to.eql(save);
            });
    }

    @then("возвращается ошибка")
    getError() {
        expect(lastError).to.not.be.null;
    }
    
    @then("победил игрок {string}")
    winPlayer(login: string) {
        const user = authService.findUserByLogin(login);
        expect(controller.getWinner(user.id).id).to.eql(user.id);
    }
    
    @then("между игроками {string} и {string} ничья")
    draw(login, secondLogin) {
        const user = authService.findUserByLogin(login);
        expect(controller.getWinner(user.id)).to.be.null;
    }
    
}

function parseSave(save) {
    const lines = save.split('|');
    return lines.map( x => x.split('').map(d => +d));
}

function serializeGame(game) {
    if (game.constructor === String) game = JSON.parse(game);
    const lines = game.map(x => x.join(''));
    return lines.join('|');
}