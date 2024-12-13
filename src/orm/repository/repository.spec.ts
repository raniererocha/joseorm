import {afterEach, assert, beforeEach, describe, it} from 'poku'
import { Repository } from './Repository'
import { MemoryStorage } from '../storage'
import { TableSchema } from '../schema/Schema'

interface TestInterface {
    id: number
    name: string
    age: number
    isAdult: boolean
}

const repositoryConfig: TableSchema<TestInterface> = {
    tableName: 'test',
    fields: {
        id: {
            type: 'number',
            primaryKeyType: 'serial',
            isPrimaryKey: true,
            isUnique: true,
            required: false,
            primaryKey: function (){
                return {
                    ...this
                }
            },
            unique: function (){
                return {
                    ...this
                }
            }
        },
        name: {
            type: 'string',
            unique: function (){
                return {
                    ...this
                }
            },
            required: false,
            primaryKey: function (){
                return {
                    ...this
                }
            }
        },
        age: {
            type: 'number',
            required: false,
            primaryKey: function (){
                return {
                    ...this
                }
            },
            unique: function (){
                return {
                    ...this
                }
            }
        },
        isAdult: {
            type: 'boolean',
            required: false,
            defaultValue: false
        }
    }
}
describe("Repository", () => {
    let repository: Repository<TestInterface>;

    beforeEach(() => {
        repository = new Repository<TestInterface>(repositoryConfig, new MemoryStorage())
    })

    it("should create a repository", () => {
        assert(repository instanceof Repository, "Repository is an instance of Repository")
    })
    it("should create a new item", () => {
        const item = repository.create({
            name: 'John Doe',
            age: 25
        })

        assert(item.id !== undefined, "Item has an id")
    })
    it("should create a list of items", () => {
        const items: Partial<TestInterface>[] = [
            {
                name: 'John Doe',
                age: 25
            },
            {
                name: 'Jane Doe',
                age: 25
            }
        ]
        const createdItems = repository.createMany(items)
        
         assert(createdItems.length === 2, "Created items length is equal to the items length") 
        assert(createdItems[0].id !== undefined, "Item has an id") 
    })
    it("should upsert an item", () => {
        const payload = {
            name: 'jonh doe'
        }
    })
    it("should update an item", () => {
        const item = repository.create({
            name: 'John Doe',
            age: 25
        })
        assert(item.name === 'John Doe', "Item name is John Doe")
        const updatedItem = repository.update({
            id: {
                equals: item.id
            }
        }, {
            name: 'Jane Doe',
            age: 25
        })
        assert(repository.findUnique({
            id: item.id
        })?.name === 'Jane Doe', "Item name is Jane Doe")
    })
    it("should find many items", () => {
        const items: Partial<TestInterface>[] = [
            {
                name: 'John Doe',
                age: 17
            },
            {
                name: 'Jane Doe',
                age: 23
            },
            {
                name: 'John Smith',
                age: 25
            }
        ]
        const createdItems = repository.createMany(items)
        assert(createdItems.length === 3, "Created items length is equal to the items length")
        const foundItems = repository.findMany({
            age: {
                greaterThan: 18
            }
        })
        assert(foundItems.length === 2, "Found items length is equal to the items length")
    })
    it("should update an list of items", () => {
        const items: Partial<TestInterface>[] = [
            {
                name: 'John Doe',
                age: 17
            },
            {
                name: 'Jane Doe',
                age: 25
            },
            {
                name: 'John Smith',
                age: 25
            }
        ]
        const createdItems = repository.createMany(items)
        assert(createdItems.length === 3, "Created items length is equal to the items length")
        const updatedItems = repository.update({
            age: {
                greaterThan: 17
            }
        }, {
            isAdult: true
        })
        
        assert(repository.findUnique({name: 'John Doe'})?.isAdult !== true, "Item is not an adult")
        assert(repository.findUnique({name: 'Jane Doe'})?.isAdult === true, "Item is an adult")
        assert(repository.findUnique({name: 'John Smith'})?.isAdult === true, "Item is an adult")
    })
    it("should delete many items", () => {
        const items: Partial<TestInterface>[] = [
            {
                name: 'John Doe',
                age: 17
            },
            {
                name: 'Jane Doe',
                age: 25
            },
            {
                name: 'John Smith',
                age: 25
            }
        ]
        const createdItems = repository.createMany(items)
        assert(createdItems.length === 3, "Created items length is equal to the items length")
        const deletedItems = repository.delete({
            age: {
                greaterThan: 17
            }
        })
        assert(repository.findMany().length === 1, "Found items length is equal to the items length")
    })
    
})