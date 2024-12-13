import { RepositoryStorageInterface } from "../repository/Repository"

export class SessionStorage implements RepositoryStorageInterface {
    constructor() {
        
        if (!sessionStorage.getItem("system")) {
            sessionStorage.setItem('system', "[]")
        }
    }
  getItem(key: string): any[] {
      return JSON.parse(sessionStorage.getItem(key) || "[]")
  }
  setItem(key: string, value: any[]): void {
      sessionStorage.setItem(key, JSON.stringify(value))
  }
  removeItem(key: string): void {
      sessionStorage.removeItem(key)
  }
  clear(): void {
      sessionStorage.clear()
  }
  getAllItems(): any[] {
      return Object.keys(sessionStorage).map(key => JSON.parse(sessionStorage.getItem(key) || "[]"))
  }
  deleteItem(key: string): void {
      sessionStorage.removeItem(key)
  }
  hasItem(key: string): boolean {
      return sessionStorage.getItem(key) !== null
  }
  size(): number {
      return sessionStorage.length
  }
}