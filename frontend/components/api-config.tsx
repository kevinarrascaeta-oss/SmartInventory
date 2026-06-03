"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Key,
  Copy,
  RefreshCw,
  Check,
  AlertTriangle,
  Globe,
  Gauge,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from "lucide-react"
import { useApiLogger, simulateApiCall } from "./api-logger-context"

interface ApiBadgeProps {
  endpoint: string
  className?: string
}

function ApiBadge({ endpoint, className }: ApiBadgeProps) {
  return (
    <span className={cn("api-badge", className)}>
      {endpoint}
    </span>
  )
}

export function ApiConfig() {
  const { addLog } = useApiLogger()
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  
  // Config states
  const [apiKey, setApiKey] = useState("sm_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxx")
  const [corsEnabled, setCorsEnabled] = useState(true)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true)
  const [allowedOrigins, setAllowedOrigins] = useState("https://app.intellistock.io, https://admin.intellistock.io")
  
  // Rate limit metrics
  const [rateLimitMetrics, setRateLimitMetrics] = useState({
    current: 42,
    limit: 60,
    window: "1 minute",
    remaining: 18,
    resetTime: 34,
  })

  // System status
  const [systemStatus, setSystemStatus] = useState({
    api: "operational",
    database: "operational",
    cache: "operational",
    queue: "degraded",
  })

  const fetchSystemStatus = useCallback(async () => {
    setIsLoading(true)
    await simulateApiCall(addLog, "GET", "/v1/system/status")
    setIsLoading(false)
  }, [addLog])

  useEffect(() => {
    fetchSystemStatus()
  }, [fetchSystemStatus])

  const handleGenerateKey = async () => {
    await simulateApiCall(addLog, "POST", "/v1/api-keys/generate")
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    const newKey = "sk_live_" + Array.from({ length: 26 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    setApiKey(newKey)
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleCors = async (enabled: boolean) => {
    await simulateApiCall(addLog, "PUT", "/v1/system/cors")
    setCorsEnabled(enabled)
  }

  const handleToggleRateLimit = async (enabled: boolean) => {
    await simulateApiCall(addLog, "PUT", "/v1/system/rate-limit")
    setRateLimitEnabled(enabled)
  }

  const handleUpdateOrigins = async () => {
    await simulateApiCall(addLog, "PUT", "/v1/system/cors/origins")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800 border-green-300"
      case "degraded":
        return "bg-[var(--retro-ochre)]/20 text-[var(--retro-orange)] border-[var(--retro-orange)]"
      case "down":
        return "bg-[var(--retro-red)]/10 text-[var(--retro-red)] border-[var(--retro-red)]"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <Check className="w-3 h-3" />
      case "degraded":
        return <AlertTriangle className="w-3 h-3" />
      case "down":
        return <AlertTriangle className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">API Configuration & Security</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground tracking-tight">
              Manage API access, rate limiting, and security settings
            </p>
            <ApiBadge endpoint="GET /v1/system/status" />
          </div>
        </div>
        <Button
          onClick={fetchSystemStatus}
          variant="outline"
          className="border-foreground rounded-sm gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh Status
        </Button>
      </div>

      {/* System Status */}
      <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
        <CardHeader className="border-b border-foreground/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[var(--retro-burgundy)] to-[var(--retro-terracotta)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="tracking-tight">System Status</CardTitle>
                <CardDescription className="text-xs">Real-time API health monitoring</CardDescription>
              </div>
            </div>
            <ApiBadge endpoint="GET /v1/system/health" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([service, status]) => (
              <div
                key={service}
                className="p-3 border border-foreground/20 rounded-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium tracking-tight capitalize">{service}</span>
                  <Badge className={cn("text-[10px] px-1.5 py-0 rounded-sm flex items-center gap-1", getStatusColor(status))}>
                    {getStatusIcon(status)}
                    {status.toUpperCase()}
                  </Badge>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      status === "operational" && "bg-green-500 w-full",
                      status === "degraded" && "bg-[var(--retro-orange)] w-3/4",
                      status === "down" && "bg-[var(--retro-red)] w-1/4"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Key Management */}
        <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
          <CardHeader className="border-b border-foreground/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <CardTitle className="text-sm tracking-tight">API Key Generator</CardTitle>
              </div>
              <ApiBadge endpoint="POST /v1/api-keys/generate" />
            </div>
            <CardDescription className="text-xs">
              Generate and manage API keys for authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Current API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={showKey ? apiKey : apiKey.replace(/./g, "•")}
                    readOnly
                    className="font-mono text-xs border-foreground/30 rounded-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-sm"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyKey}
                  className="border-foreground/30 rounded-sm shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button
              onClick={handleGenerateKey}
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New API Key
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Warning: Generating a new key will invalidate the current one. Make sure to update your applications.
            </p>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
          <CardHeader className="border-b border-foreground/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <CardTitle className="text-sm tracking-tight">Rate Limiting</CardTitle>
              </div>
              <ApiBadge endpoint="GET /v1/system/rate-limit" />
            </div>
            <CardDescription className="text-xs">
              Monitor and configure request rate limits
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rateLimitEnabled ? (
                  <Lock className="w-4 h-4 text-green-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-[var(--retro-orange)]" />
                )}
                <span className="text-sm font-medium tracking-tight">Rate Limiting</span>
              </div>
              <Switch
                checked={rateLimitEnabled}
                onCheckedChange={handleToggleRateLimit}
              />
            </div>

            {rateLimitEnabled && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Requests this window</span>
                    <span className="font-mono font-medium">
                      {rateLimitMetrics.current} / {rateLimitMetrics.limit}
                    </span>
                  </div>
                  <Progress
                    value={(rateLimitMetrics.current / rateLimitMetrics.limit) * 100}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-2 bg-muted rounded-sm">
                    <span className="text-muted-foreground">Window</span>
                    <p className="font-mono font-medium">{rateLimitMetrics.window}</p>
                  </div>
                  <div className="p-2 bg-muted rounded-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <p className="font-mono font-medium">{rateLimitMetrics.remaining} req</p>
                  </div>
                  <div className="p-2 bg-muted rounded-sm">
                    <span className="text-muted-foreground">Limit</span>
                    <p className="font-mono font-medium">{rateLimitMetrics.limit} req/min</p>
                  </div>
                  <div className="p-2 bg-muted rounded-sm">
                    <span className="text-muted-foreground">Reset in</span>
                    <p className="font-mono font-medium">{rateLimitMetrics.resetTime}s</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CORS Configuration */}
        <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)] lg:col-span-2">
          <CardHeader className="border-b border-foreground/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <CardTitle className="text-sm tracking-tight">CORS Configuration</CardTitle>
              </div>
              <ApiBadge endpoint="PUT /v1/system/cors" />
            </div>
            <CardDescription className="text-xs">
              Configure Cross-Origin Resource Sharing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {corsEnabled ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[var(--retro-red)]" />
                )}
                <span className="text-sm font-medium tracking-tight">CORS Enabled</span>
                {!corsEnabled && (
                  <Badge className="bg-[var(--retro-red)]/10 text-[var(--retro-red)] border-[var(--retro-red)] text-[10px] rounded-sm">
                    SECURITY RISK
                  </Badge>
                )}
              </div>
              <Switch
                checked={corsEnabled}
                onCheckedChange={handleToggleCors}
              />
            </div>

            {corsEnabled && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Allowed Origins</Label>
                <div className="flex gap-2">
                  <Input
                    value={allowedOrigins}
                    onChange={(e) => setAllowedOrigins(e.target.value)}
                    placeholder="https://example.com, https://app.example.com"
                    className="font-mono text-xs border-foreground/30 rounded-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={handleUpdateOrigins}
                    className="border-foreground rounded-sm shrink-0"
                  >
                    Update
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Comma-separated list of allowed origins. Use * for wildcard (not recommended for production).
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Architecture Info */}
      <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
        <CardHeader className="border-b border-foreground/10">
          <CardTitle className="text-sm tracking-tight">API Architecture Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 border border-foreground/20 rounded-sm">
              <span className="text-muted-foreground">Protocol</span>
              <p className="font-mono font-medium mt-1">REST / HTTP/2</p>
            </div>
            <div className="p-3 border border-foreground/20 rounded-sm">
              <span className="text-muted-foreground">Authentication</span>
              <p className="font-mono font-medium mt-1">Bearer Token</p>
            </div>
            <div className="p-3 border border-foreground/20 rounded-sm">
              <span className="text-muted-foreground">Response Format</span>
              <p className="font-mono font-medium mt-1">JSON</p>
            </div>
            <div className="p-3 border border-foreground/20 rounded-sm">
              <span className="text-muted-foreground">API Version</span>
              <p className="font-mono font-medium mt-1">v1.0.0-beta</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
