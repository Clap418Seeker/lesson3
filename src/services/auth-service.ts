import {User} from "../user";

export class AuthService {
    
    private users: Map<string, User>;
    
    constructor() {
        this.users = new Map<string, User>();
    }
    
    getUser(id: string): User {
        if (this.users.has(id)) return this.users.get(id);
        return null;
    }

    register(login: string, password: string): User {
        if (this.findUserByLogin(login)) return null;
        const newUser = new User(login, password);
        this.users.set(newUser.id, newUser);
        return newUser;
    }
    
    findUserByLogin(login: string): User {
        for (const user of this.users.values()) {
            if (user.login === login) return user;
        }
        return null; 
    }
    
    login(login: string, password: string): User {
        const user = this.findUserByLogin(login);
        return user?.checkPassword(password) ? user : null;
    }
}

export const authService = new AuthService();