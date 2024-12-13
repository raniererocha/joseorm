import { BooleanTypeError, EnumTypeError, FieldValidationError, NotFoundError, NotFoundFieldsError, NotFoundPrimaryKeyError, NumberTypeError, StringTypeError } from "../../assets/Errors";
import { TableSchema } from "../schema/Schema";

export interface RepositoryStorageInterface {
    getItem(key: string): any[]
    setItem(key: string, value: any[]): void
    deleteItem(key: string): void
    hasItem(key: string): boolean
    getAllItems(): any[]
    clear(): void
    size(): number
}

type QueryOperators<T> = {
    equals?: T;
    greaterThan?: T;
    lessThan?: T;
    contains?: string;
    in?: T[]
}


type WhereQuery<T> = {
    [K in keyof T]?: T[K] extends number
    ? QueryOperators<number>
    : T[K] extends string
    ? QueryOperators<string>
    : T[K] extends boolean
    ? { equals?: boolean }
    : QueryOperators<T[K]>
}



type UpdateSystemTableActions = "create" | "update"


export class Repository<T extends { id: string | number, createdAt?: string, updatedAt?: string }> {

    private modelConstructor: TableSchema<T>
    private storage: RepositoryStorageInterface
    private tableName: string
    private systemTableId?: string

    constructor(modelConstructor: TableSchema<T>, storage: RepositoryStorageInterface) {
        this.storage = storage
        this.modelConstructor = modelConstructor
        this.tableName = this.getTableName()
        this.ensureTable()
    }

    private getTableName(): string {
        return this.modelConstructor.tableName
    }
    private ensureTable(): void {
        const systemStorage = this.storage.getItem('system')
        const SystemTableData = systemStorage.find(item => item.table === this.tableName)
        if (!this.systemTableId) {
            this.systemTableId = Math.random().toString(36).substring(2, 9)
        }
        const createPayload = {
            id: this.systemTableId,
            table: this.tableName,
            tableLastId: 0,
            tableCreatedDate: new Date().toISOString(),
            tableUpdatedDate: undefined
        }
        if (!SystemTableData) {
            this.storage.setItem("system", [createPayload])
        }
        if (!this.storage.getItem(this.tableName)) {
            this.storage.setItem(this.tableName, [])
        }

    }
    private validateData(data: Partial<T>): void {
        const fields = this.modelConstructor.fields


        for (const [key, fieldMeta] of Object.entries(fields)) {

            //Valida se o campo é obrigatório.
            if (fieldMeta.required && !data[key as keyof T] && fieldMeta.defaultValue === undefined) {
                throw new FieldValidationError(`O campo ${key} é obrigatório.`)
            }

            // Validação de campos únicos
            if (fieldMeta.isUnique && data[key as keyof T] !== undefined) {


                for (const item of this.findMany()) {
                    if (item[key as keyof T] === data[key as keyof T]) {
                        throw new Error(`Campo ${key} deve ser único`)
                    }
                }
            }

            //Validação de tipos
            if (data[key as keyof T]) {
                const actualType = typeof data[key as keyof T]

                switch (fieldMeta.type) {
                    case "string":
                        if (actualType !== "string") {
                            throw new StringTypeError(key)
                        }
                        break
                    case "number":
                        if (actualType !== "number") {
                            throw new NumberTypeError(key)
                        }
                        break
                    case "boolean":
                        if (actualType !== "boolean") {
                            throw new BooleanTypeError(key)
                        }
                        break
                    case "enum":
                        if (!fieldMeta.enumValues?.includes(data[key as keyof T]) && fieldMeta.enumValues) {
                            throw new EnumTypeError(key, fieldMeta.enumValues)
                        }
                }
            }

        }
    }
    private generateId(): string | number {
        const primaryField = Object.values(this.modelConstructor.fields).find((fieldMeta) => fieldMeta.isPrimaryKey)

        if (!primaryField) {
            throw new Error("Não foi possível gerar o ID")
        }
        if (primaryField.primaryKeyType === "cuid") {
            return Math.random().toString(36).substring(2, 9)
        }
        const lastItemId = this.getLastItemId()
        return typeof lastItemId === "number" ? lastItemId + 1 : 1
    }
    private getLastItemId(): string | number {
        const storage = this.storage.getItem("system")
        const systemTableData = storage.find((item) => item.id === this.systemTableId)
        return systemTableData?.tableLastId || 0
    }
    private saveItems(items: T[]): void {
        this.storage.setItem(this.tableName, items)
    }
    private getItems(): T[] {
        return this.storage.getItem(this.tableName) || []
    }
    private updateOnSystemTable(action: UpdateSystemTableActions, lastId?: string | number): void {
        //verifique se a tabela "system" existe, caso exista procure o registro com o nome da tablea atual
        //se não existir registro algum com o nome da tabela, crie um. Caso exista, atualize o registro com o ultimo id gerado e com a data e hora da ultima atualização
        const systemStorage = this.storage.getItem('system')
        if (!this.systemTableId) {
            this.ensureTable()
        }
        const SystemTableData = systemStorage.findIndex(item => item.id === this.systemTableId)

        if (SystemTableData === -1) {
            const createPayload = {
                id: Math.random().toString(36).substring(2, 9),
                table: this.tableName,
                tableLastId: lastId,
                tableCreatedDate: new Date().toISOString(),
                tableUpdatedDate: undefined
            }
            systemStorage.push(createPayload)
        }
        else {
            const updatePayload = {
                id: this.systemTableId,
                table: this.tableName,
                tableLastId: lastId || systemStorage[SystemTableData].tableLastId,
                tableCreatedDate: new Date().toISOString(),
                tableUpdatedDate: new Date().toISOString()
            }
            systemStorage[SystemTableData] = updatePayload
        }
        this.storage.setItem('system', systemStorage)
    }
    private whereFilter(where?: WhereQuery<T>): T[] {
        let items = this.getItems()
        if (where) {
            items = items.filter((item) => {
                for (const [key, condition] of Object.entries(where)) {
                    const fieldValue = item[key as keyof T];
                    if (typeof condition === 'object') {
                        // Verificar lógica condicional com base nos tipos
                        if (condition.equals !== undefined && fieldValue !== condition.equals) {
                            return false;
                        }

                        if ('greaterThan' in condition && typeof fieldValue === 'number' && fieldValue <= condition.greaterThan) {
                            return false;
                        }

                        if ('lessThan' in condition && typeof fieldValue === 'number' && fieldValue >= condition.lessThan) {
                            return false;
                        }

                        if ('contains' in condition && typeof fieldValue === 'string' && !fieldValue.includes(condition.contains)) {
                            return false;
                        }
                    } else if (condition !== undefined && fieldValue !== condition) {
                        return false;
                    }
                }
                return true;
            });
        }
        return items
    }


    create(data: Partial<T>): T {
        this.validateData(data)

        const items = this.getItems()
        const newId = this.generateId()
        const newItem = {
            ...data,
            id: data.id || newId,
            createdAt: new Date().toISOString()
        } as unknown as T


        items.push(newItem)
        this.updateOnSystemTable('create', newId)
        this.saveItems(items)
        return newItem
    }


    createMany(data: Partial<T>[]): T[] {
        const items = this.getItems()
        const newItems = data.map((item) => {
            this.validateData(item)
            const newId = this.generateId()
            const newItem = {
                ...item,
                id: item.id || newId,
                createdAt: new Date().toISOString()
            } as unknown as T
            items.push(newItem)
            this.updateOnSystemTable('create', newId)
            return newItem
        })
        this.saveItems(items)
        return newItems
    }


    findMany(where?: WhereQuery<T>): T[] {
        let items = this.getItems();

        if (where) {
            items = this.whereFilter(where)
        }

        return items;
    }

    findUnique(where: Partial<T>): T | null {
        const items = this.getItems()
        const item = items.find((item) => {
            for (const [key, value] of Object.entries(where)) {
                if (item[key as keyof T] !== value) {
                    return false
                }
            }
            return true
        })
        return item || null
    }


    update(where: WhereQuery<T>, data: Partial<T>): void {
        const items = this.getItems();

        const updatedItems = items.map((item) => {
            let shouldUpdate = true;

            // Verificar condições de filtragem com base no `where`
            for (const [key, condition] of Object.entries(where)) {
                const fieldValue = item[key as keyof T];

                if (typeof condition === 'object') {
                    if (condition.equals !== undefined && fieldValue !== condition.equals) {
                        shouldUpdate = false;
                        break;
                    }

                    if ('greaterThan' in condition && typeof fieldValue === 'number' && fieldValue <= condition.greaterThan) {
                        shouldUpdate = false;
                        break;
                    }

                    if ('lessThan' in condition && typeof fieldValue === 'number' && fieldValue >= condition.lessThan) {
                        shouldUpdate = false;
                        break;
                    }

                    if ('contains' in condition && typeof fieldValue === 'string' && !fieldValue.includes(condition.contains)) {
                        shouldUpdate = false;
                        break;
                    }
                } else if (condition !== undefined && fieldValue !== condition) {
                    shouldUpdate = false;
                    break;
                }
            }

            if (shouldUpdate) {
                return {
                    ...item,
                    ...data,
                    updatedAt: new Date().toISOString()
                } as unknown as T;
            }

            return item;
        });

        this.updateOnSystemTable('update');
        this.saveItems(updatedItems);
        
        
    }


    upsert(data: Partial<T>): T {
        const items = this.getItems()
        const itemIndex = items.findIndex((item) => item.id === data.id)
        const newItem = {
            ...data,
            updatedAt: new Date().toISOString()
        } as unknown as T
        if (itemIndex === -1) {
            items.push(newItem)
            this.updateOnSystemTable('create')
        } else {
            items[itemIndex] = newItem
            this.updateOnSystemTable('update')
        }
        this.saveItems(items)
        return newItem
    }


    delete(where: WhereQuery<T>): T[] {
        let items = this.whereFilter(where)
        const deletedItems = items as unknown as T[]

        items = this.getItems().filter((item) => !deletedItems.includes(item))
        
        this.updateOnSystemTable('update')
        this.saveItems(items)
        console.log('items: ', items)
        return deletedItems
    }

    count(where?: WhereQuery<T>): number {

        if (where) {
            return this.whereFilter(where).length
        }
        return this.getItems().length
    }

}
