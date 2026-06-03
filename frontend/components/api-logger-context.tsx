"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface ApiLogEntry {
  id: string
  timestamp: Date
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  status: number
  statusText: string
  duration: number
}

interface ApiLoggerContextType {
  logs: ApiLogEntry[]
  addLog: (entry: Omit<ApiLogEntry, "id" | "timestamp">) => void
  clearLogs: () => void
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}

const ApiLoggerContext = createContext<ApiLoggerContextType | undefined>(undefined)

export function ApiLoggerProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ApiLogEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const addLog = useCallback((entry: Omit<ApiLogEntry, "id" | "timestamp">) => {
    const newEntry: ApiLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }
    setLogs((prev) => [newEntry, ...prev].slice(0, 50))
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return (
    <ApiLoggerContext.Provider value={{ logs, addLog, clearLogs, isExpanded, setIsExpanded }}>
      {children}
    </ApiLoggerContext.Provider>
  )
}

export function useApiLogger() {
  const context = useContext(ApiLoggerContext)
  if (!context) {
    throw new Error("useApiLogger must be used within an ApiLoggerProvider")
  }
  return context
}

export function simulateApiCall(
  addLog: ApiLoggerContextType["addLog"],
  method: ApiLogEntry["method"],
  endpoint: string,
  successRate = 0.95
): Promise<boolean> {
  return new Promise((resolve) => {
    const duration = Math.floor(Math.random() * 200) + 50
    setTimeout(() => {
      const success = Math.random() < successRate
      const status = success ? (method === "POST" ? 201 : method === "DELETE" ? 204 : 200) : Math.random() > 0.5 ? 429 : 500
      const statusText = status === 200 ? "OK" : status === 201 ? "Created" : status === 204 ? "No Content" : status === 429 ? "Too Many Requests" : "Internal Server Error"
      
      addLog({ method, endpoint, status, statusText, duration })
      resolve(success)
    }, duration)
  })
}
