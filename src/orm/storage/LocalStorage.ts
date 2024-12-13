import { RepositoryStorageInterface } from "../repository/Repository"

export class LocalStorage implements RepositoryStorageInterface {
    constructor() {
        
        if (!localStorage.getItem("system")) {
            localStorage.setItem('system', "[]")
        }
    }
  getItem(key: string): any[] {
      return JSON.parse(localStorage.getItem(key) || "[]")
  }
  setItem(key: string, value: any[]): void {
      localStorage.setItem(key, JSON.stringify(value))
  }
  removeItem(key: string): void {
      localStorage.removeItem(key)
  }
  clear(): void {
      localStorage.clear()
  }
  getAllItems(): any[] {
      return Object.keys(localStorage).map(key => JSON.parse(localStorage.getItem(key) || "[]"))
  }
  deleteItem(key: string): void {
      localStorage.removeItem(key)
  }
  hasItem(key: string): boolean {
      return localStorage.getItem(key) !== null
  }
  size(): number {
      return localStorage.length
  }
}