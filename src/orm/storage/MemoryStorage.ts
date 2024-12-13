import { RepositoryStorageInterface } from "../repository/Repository"

export class MemoryStorage implements RepositoryStorageInterface {
    private data: { [key: string]: any[] } = {}
    constructor() {
        this.data = {}
    }

  getItem(key: string): any[] {
      return  this.data[key] || []
  }
  setItem(key: string, value: any[]): void {
      this.data[key] = value
  }
  removeItem(key: string): void {
      delete this.data[key]
  }
  clear(): void {
      this.data = {}
  }
  getAllItems(): any[] {
      return Object.values(this.data)
  }
  deleteItem(key: string): void {
      delete this.data[key]
  }
  hasItem(key: string): boolean {
     return this.data[key] !== undefined
  }
  size(): number {
     return Object.keys(this.data).length
  }
}