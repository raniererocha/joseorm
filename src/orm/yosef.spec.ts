import { afterEach, assert, beforeEach, describe, it, } from 'poku'
import Jose, { j } from '../index'
import { TableSchema } from './schema/Schema'
import { Repository } from './repository/Repository'
import { MemoryStorage } from './storage'

interface TestSchema {id: number, name: string, email: string}
describe('Jose', () => {
    let jose: Jose
    let testSchema: TableSchema<TestSchema>
    let repository: Repository<{ id: number | string, name: string, email: string }>

    beforeEach(() => {
        jose = Jose.create({
            storage: 'memory'
        })
        testSchema = j.table<TestSchema>('test', {
            id: j.number().primaryKey("serial"),
            name: j.string(),
            email: j.string()
        })
        repository = jose.createRepository(testSchema)
        
    })


    it('should create a new instance of Jose', () => {
        assert(jose instanceof Jose, 'jose is an instance of Jose')
    })
    it('should create a new repository', () => {
        assert(repository instanceof Repository, 'repository is an instance of Repository')
    })
    it("should create a new record on the repository", () => {
        const item: { name: string, email: string } =
        {
            name: 'John Doe',
            email: 'johndoe@example.com'
        }

        const newRecord = repository.create(item)
        assert(newRecord.id, 'newRecord has an id')
    })
    it("should find many records on the repository", () => {
        const items: Array<{ name: string, email: string }> = [
            {
                name: 'John Doe',
                email: 'johndoe@example.com'
            },
            {
                name: 'Jane Doe',
                email: 'janedoe@example.com'
            },
            {
                name: 'John Smith',
                email: 'johnsmith@example.com'
            }
        ]
        const newRecords = items.map(item => repository.create(item)).filter(item => item.id)
        assert(newRecords.length === 3, 'newRecords has 3 items')
    })
    it("should find a record on the repository", () => {
        const item: { name: string, email: string } =
        {
            name: 'John Doe',
            email: 'johndoe@example.com'
        }
        const newRecord = repository.create(item)
        const foundRecord = repository.findUnique({ id: newRecord.id })
        assert(foundRecord, 'foundRecord is not null')
    })
    it("findMany should return an empty array if no records are found", () => {
        const foundRecords = repository.findMany()
        assert(foundRecords.length === 0, 'foundRecords is an empty array')
    })
    it("should update a record on the repository", () => {
        const item: { name: string, email: string } =
        {
            name: 'John Doe',
            email: 'johndoe@example.com'
        }
        const newRecord = repository.create(item)
        assert(newRecord.name === 'John Doe', 'newRecord.name is John Doe')
        repository.update({
            id: {
                equals: newRecord.id
            }
        }, {
            name: "Jane Doe",
        })
        assert(repository.findUnique({
            id: newRecord.id
        }), 'updatedRecord.name is Jane Doe')
    })
    it("should delete a record on the repository", () => {
        const item: { name: string, email: string } =
        {
            name: 'John Doe',
            email: 'johndoe@example.com'
        }
        const newRecord = repository.create(item)
        assert(newRecord.name === 'John Doe', 'newRecord.name is John Doe')
        repository.delete({
            id: {
                equals: newRecord.id
            }
        })
        const foundRecord = repository.findUnique({ id: newRecord.id })
        assert(foundRecord === null, 'foundRecord is null')
    })
    it("should return number of records on the repository", () => {
        const item: { name: string, email: string } =
        {
            name: 'John Doe',
            email: 'johndoe@example.com'
        }
        const newRecord = repository.create(item)
        assert(newRecord.name === 'John Doe', 'newRecord.name is John Doe')
        const count = repository.count()
        assert(count === 1, 'count is 1')
    })
})