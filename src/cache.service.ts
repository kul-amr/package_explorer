import NodeCache from "node-cache";

class Cache {

    cache: NodeCache;

    constructor(ttlSeconds: number) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2,
            useClones: false
        })
    }

    get(key: string) {
        const value = this.cache.get(key);
        return value;
    }

    listAllKeys(page: number, storeFunction: any) {

        console.log("Cache service listAllKeys.");

        let allKeys: string[] = this.cache.get('sortedKeys') || [];

        if (allKeys.length == 0) {     //Write data to the cache if does not exist.
            console.log("In if : ")
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

    remove(key: string) {
        this.cache.del(key);
    }

    flush() {
        this.cache.flushAll();
    }

}

export default Cache;