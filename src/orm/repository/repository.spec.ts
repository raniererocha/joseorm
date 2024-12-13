import { assert, beforeEach, describe, test } from 'poku'
import { TableSchema } from '../schema/Schema'
import { Repository, RepositoryStorageInterface } from './Repository'
import { StringTypeError } from '../../assets/Errors'

// Mock storage implementation
class MockStorage implements RepositoryStorageInterface {
  private storage: Map<string, any[]> = new Map()

  getItem(key: string): any[] {
    return this.storage.get(key) || []
  }

  setItem(key: string, value: any[]): void {
    this.storage.set(key, value)
  }

  deleteItem(key: string): void {
    this.storage.delete(key)
  }

  hasItem(key: string): boolean {
    return this.storage.has(key)
  }

  getAllItems(): any[] {
    return Array.from(this.storage.values()).reduce((acc, val) => acc.concat(val), [])
  }

  clear(): void {
    this.storage.clear()
  }

  size(): number {
    return this.storage.size
  }
}
/* enum TestEnum {
    ADMIN = 'admin',
    USER = 'user'
} */
interface TestSchemaInterface {
    id: string
    name: string
    age: number
    isActive: boolean
    role: "admin" | "user"
}
describe('Repository', () => {
  let repository: Repository<any>
  let storage: MockStorage

  // Test schema
  const testSchema: TableSchema<TestSchemaInterface> = {
    tableName: 'test',
    fields: {
      id: {
        type: 'string',
        required: false,
        isAutoIncrement: true,
        primaryKey: function() {
            return {...this}
        },
        unique: function () {
            return {...this}
        },
        isPrimaryKey: true,
        primaryKeyType: 'cuid',
        isUnique: true
      },
      name: {
        type: 'string',
        required: true,
        primaryKey: function() {
            return {...this}
        },
        unique: function () {
            return {...this}
        },
      },
      age: {
        type: 'number',
        required: true,
        primaryKey: function() {
            return {...this}
        },
        unique: function () {
            return {...this}
        },
      },
      isActive: {
        type: 'boolean',
        defaultValue: true,
        required: false
      },
      role: {
        type: 'enum',
        enumValues: ['admin', 'user'],
        required: false,
      }
    }
  }

  beforeEach(() => {
    storage = new MockStorage()
    repository = new Repository(testSchema, storage)
  })

  test('create - should create new record with valid data', () => {
    const data = {
      name: 'John',
      age: 25,
      role: 'admin'
    }
    
    const result = repository.create(data)
    
    assert(result.name === data.name, 'Name should match')
    assert(result.age === data.age, 'Age should match')
    assert(result.id, 'ID should be defined')
    assert(result.createdAt, 'CreatedAt should be defined')
  })

  test('create - should throw error for invalid type', () => {
    const data = {
      name: 123,
      age: 'invalid',
    }
    
    assert.throws(() => {
      repository.create(data)
    }, 'Invalid type')
  })

  test('findMany - should filter records using where clause', () => {
    repository.create({ name: 'John', age: 25 })
    repository.create({ name: 'Jane', age: 30 })
    
    const results = repository.findMany({
      age: { greaterThan: 27 }
    })
    
    assert(results.length === 1, 'Should return one result')
    assert(results[0].name === 'Jane', 'Name should match')
  })

  test('update - should update matching records', () => {
    const created = repository.create({ 
      name: 'John', 
      age: 25,
      role: 'user' 
    })
    
    repository.update(
      { id: { equals: created.id } },
      { role: 'admin' }
    )
    
    const updated = repository.findUnique({ id: created.id })
    assert(updated?.role === 'admin', 'Role should be updated')
  })

  test('delete - should remove matching records', () => {
    repository.create({ name: 'John', age: 25 })
    repository.create({ name: 'Jane', age: 30 })
    
    const deleted = repository.delete({
      name: { equals: 'John' }
    })
    
    assert(deleted.length === 1, 'Should delete one record')
    assert(repository.count() === 1, 'Should have one record left')
  })

  test('createMany - should create multiple records', () => {
    const data = [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 30 }
    ]
    
    const results = repository.createMany(data)
    
    assert(results.length === 2, 'Should create two records')
    assert(repository.count() === 2, 'Should have two records')
  })

  test('upsert - should update existing or create new record', () => {
    const created = repository.create({ 
      name: 'John', 
      age: 25 
    })
    
    const upserted = repository.upsert({
      id: created.id,
      name: 'John Updated',
      age: 26
    })
    
    assert(upserted.name === 'John Updated', 'Name should be updated')
    assert(repository.count() === 1, 'Should have one record')
  })

  test('findUnique - should return null for non-existent record', () => {
    const result = repository.findUnique({ id: 'non-existent' })
    assert(!result, 'Should return null for non-existent record')
  })

  test('validation - should enforce required fields', () => {
    assert.throws(() => 
      repository.create({ age: 25 })
    )
  })

  test('validation - should enforce enum values', () => {
    assert.throws(() =>
      repository.create({ 
        name: 'John',
        age: 25,
        role: 'invalid-role'
      })
    )
  })
})
