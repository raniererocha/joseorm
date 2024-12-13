import { Repository} from "./repository/Repository";
import { TableSchema, j } from "./schema/Schema";
import type { InferSchema } from "./schema/Schema";
import { MemoryStorage } from "./storage";
import { LocalStorage } from "./storage/LocalStorage";
import { SessionStorage } from "./storage/SessionStorage";


type StorageType = "localStorage" | "memory" | "sessionStorage";

interface Options {
    storage: StorageType
}

export default class Jose {
    private static _instance: Jose;
    private _storageType: StorageType;

    public static create(options?: Options): Jose {
        if (!this._instance) {
            if (!options) {
                options = {
                    storage: "localStorage"
                }
            }
            this._instance = new Jose(options);
        }
        return this._instance;
        
    } 
    private constructor(options?: Options) {
        this._storageType = options?.storage || "memory" 
    }
    
   

    private getStorage() {
        switch (this._storageType) {
            case "localStorage":
                return new LocalStorage()
            case "memory":
                return new MemoryStorage()
            case "sessionStorage":
                return new SessionStorage()
        }
    }
    
    public createRepository<T extends {id: string | number}>(Schema: TableSchema<T>) {
         const storage = this.getStorage() 
        return new Repository<T>(Schema, storage)
                
    }
}

export { j }
export {InferSchema}