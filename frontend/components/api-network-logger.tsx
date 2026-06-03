"use client"

import { useApiLogger } from "./api-logger-context"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, Trash2, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ApiNetworkLogger() {
  const { logs, clearLogs, isExpanded, setIsExpanded } = useApiLogger()

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-700 bg-green-50"
    if (status >= 400 && status < 500) return "text-[var(--retro-orange)] bg-orange-50"
    return "text-[var(--retro-red)] bg-red-50"
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-blue-700 bg-blue-50"
      case "POST": return "text-green-700 bg-green-50"
      case "PUT": return "text-[var(--retro-orange)] bg-orange-50"
      case "DELETE": return "text-[var(--retro-red)] bg-red-50"
      default: return "text-muted-foreground bg-muted"
    }
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t border-foreground bg-card transition-all duration-200",
      isExpanded ? "h-64" : "h-10"
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 h-10 cursor-pointer hover:bg-muted/50 border-b border-foreground/10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-mono text-xs tracking-tighter font-medium">API Network Logger</span>
          <span className="api-badge">{logs.length} requests</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                clearLogs()
              }}
              className="h-6 px-2 text-xs border border-foreground/20 rounded-sm"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Logs */}
      {isExpanded && (
        <div className="h-[calc(100%-2.5rem)] overflow-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No API requests logged yet. Interact with the dashboard to see activity.
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-muted border-b border-foreground/10">
                <tr className="text-left">
                  <th className="px-4 py-2 w-24">Time</th>
                  <th className="px-4 py-2 w-20">Method</th>
                  <th className="px-4 py-2">Endpoint</th>
                  <th className="px-4 py-2 w-28">Status</th>
                  <th className="px-4 py-2 w-20 text-right">Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-foreground/5 hover:bg-muted/30">
                    <td className="px-4 py-1.5 text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-1.5">
                      <span className={cn("px-1.5 py-0.5 rounded-sm text-[10px] font-bold", getMethodColor(log.method))}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 text-foreground">{log.endpoint}</td>
                    <td className="px-4 py-1.5">
                      <span className={cn("px-1.5 py-0.5 rounded-sm text-[10px]", getStatusColor(log.status))}>
                        {log.status} {log.statusText}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 text-right text-muted-foreground">{log.duration}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
