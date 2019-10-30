"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_1 = __importDefault(require("node-cache"));
class Cache {
    constructor(ttlSeconds) {
        this.cache = new node_cache_1.default({
            stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }
    get(key) {
        const value = this.cache.get(key);
        return value;
    }
    listAllKeys(page, storeFunction) {
        console.log("Cache service listAllKeys.");
        let allKeys = this.cache.get('sortedKeys') || [];
        if (allKeys.length == 0) { //Write data to the cache if does not exist.
            console.log("In if : ");
            console.log("Calling parse file.");
            let keyValsList = storeFunction();
            const success = this.cache.mset(keyValsList);
            console.log("Cache value set now : ", success);
            allKeys = this.cache.keys().sort();
            this.cache.set('sortedKeys', allKeys);
        }
        let maxpage = Math.floor(allKeys.length / 10);
        page = page > maxpage ? maxpage : page;
        let start = page * 10;
        return allKeys.slice(start, start + 10);
    }
    remove(key) {
        this.cache.del(key);
    }
    flush() {
        this.cache.flushAll();
    }
}
exports.default = Cache;
//# sourceMappingURL=cache.service.js.map