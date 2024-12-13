import { afterEach, assert, beforeEach, describe, it } from 'poku'
import { j, TableSchema, TableSchemaFields } from './Schema'

interface TestSchema {
    id: string
    name: string
    age: number
}
describe("Schema", () => {

    let schema: TableSchema<TestSchema>
    beforeEach(() => {
        schema = j.table<TestSchema>('test', {
            id: j.string().primaryKey("cuid"),
            name: j.string().unique(),
            age: j.number()
        })
    })


    it("should create a new schema", () => {
        assert(schema.tableName === "test", "schema has a table name")
        assert(schema.fields.id.type === "string", "schema has a id field")
        assert(schema.fields.name.type === "string", "schema has a name field")
        assert(schema.fields.age.type === "number", "schema has a age field")
        assert(schema.fields.id.primaryKey, "schema has a id field")
        assert(schema.fields.id.isUnique, "schema has a id field")
    })

    
})