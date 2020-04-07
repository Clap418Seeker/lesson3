import {GameError} from "./game/error";

export class Sessions<T> {
    map: Map<string, T>;
    constructor(private readonly timeout: number) {
        this.map = new Map();
    }
    
    get(key): T {
        if (!this.map.has(key)) return null;
        return this.map.get(key);
    }
    
    set(key: string, value: T) {
        this.map.set(key, value);
        this.gc(key);
    }
    
    has(key: string): boolean {
        return this.map.has(key);
    }
    
    gc(key: string) {
        setTimeout(() => {
            if (this.map.has(key))
                this.map.delete(key);
        }, this.timeout);
    }
    
    filter(invoke: (val: T) => boolean): T[] {
        return Array.from(this.map.values()).filter(invoke);        
    }
    
    gcForce(key: string) {
        if (this.map.has(key))
            this.map.delete(key);
    }
}