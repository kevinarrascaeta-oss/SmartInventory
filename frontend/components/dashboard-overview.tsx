"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Warehouse,
  Brain,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { useApiLogger, simulateApiCall } from "./api-logger-context"
import { useEffect, useState, useCallback } from "react"

// Mock data for charts
const forecastData = [
  { month: "Jan", actual: 420, forecast: 400 },
  { month: "Feb", actual: 380, forecast: 420 },
  { month: "Mar", actual: 510, forecast: 450 },
  { month: "Apr", actual: 470, forecast: 500 },
  { month: "May", actual: 540, forecast: 520 },
  { month: "Jun", actual: null, forecast: 580 },
  { month: "Jul", actual: null, forecast: 620 },
  { month: "Aug", actual: null, forecast: 590 },
]

const engagementData = [
  { week: "W1", views: 1200, edits: 45 },
  { week: "W2", views: 1400, edits: 62 },
  { week: "W3", views: 980, edits: 38 },
  { week: "W4", views: 1650, edits: 71 },
  { week: "W5", views: 1320, edits: 55 },
]

// Restock suggestions mock data
const restockSuggestions = [
  { sku: "SKU-042", name: "Industrial Bearings", quantity: 50, urgency: "high" },
  { sku: "SKU-128", name: "Steel Fasteners Set", quantity: 200, urgency: "medium" },
  { sku: "SKU-089", name: "Hydraulic Pump Kit", quantity: 15, urgency: "high" },
]

// Anomaly alerts mock data
const anomalyAlerts = [
  { id: 1, type: "spike", message: "Unusual 340% increase in SKU-007 demand detected", time: "2 hours ago" },
  { id: 2, type: "discrepancy", message: "Physical count mismatch: SKU-156 (Expected: 120, Actual: 98)", time: "5 hours ago" },
  { id: 3, type: "pattern", message: "Seasonal pattern detected: Summer product surge beginning", time: "1 day ago" },
]

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

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  status?: "normal" | "warning" | "critical"
  api: string
}

function KPICard({ title, value, change, icon: Icon, status = "normal", api }: KPICardProps) {
  const statusColors = {
    normal: "border-foreground/20",
    warning: "border-[var(--retro-orange)]",
    critical: "border-[var(--retro-red)]",
  }

  return (
    <Card className={cn("border rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]", statusColors[status])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium tracking-tight">{title}</CardTitle>
          <ApiBadge endpoint={api} />
        </div>
        <Icon className={cn(
          "w-5 h-5",
          status === "warning" && "text-[var(--retro-orange)]",
          status === "critical" && "text-[var(--retro-red)]"
        )} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tighter">{value}</div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-1",
            change >= 0 ? "text-green-600" : "text-[var(--retro-red)]"
          )}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(change)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardOverview() {
  const { addLog } = useApiLogger()
  const [isLoading, setIsLoading] = useState(true)
  const [kpiData, setKpiData] = useState({
    totalSku: 0,
    lowStock: 0,
    warehouseCapacity: 0,
    avgTurnover: 0,
  })

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    await simulateApiCall(addLog, "GET", "/v1/analytics/summary")
    setKpiData({
      totalSku: 1247,
      lowStock: 23,
      warehouseCapacity: 78,
      avgTurnover: 4.2,
    })
    setIsLoading(false)
  }, [addLog])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleApproveRestock = async (sku: string) => {
    await simulateApiCall(addLog, "POST", `/v1/inventory/restock/${sku}`)
  }

  const handleDismissAlert = async (id: number) => {
    await simulateApiCall(addLog, "DELETE", `/v1/alerts/${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground tracking-tight">
            Real-time inventory analytics and AI insights
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          className="border-foreground rounded-sm gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total SKUs"
          value={isLoading ? "—" : kpiData.totalSku.toLocaleString()}
          change={12}
          icon={Package}
          api="GET /v1/products/count"
        />
        <KPICard
          title="Low Stock Items"
          value={isLoading ? "—" : kpiData.lowStock}
          change={-8}
          icon={AlertTriangle}
          status={kpiData.lowStock > 20 ? "warning" : "normal"}
          api="GET /v1/inventory/low-stock"
        />
        <KPICard
          title="Warehouse Capacity"
          value={isLoading ? "—" : `${kpiData.warehouseCapacity}%`}
          change={5}
          icon={Warehouse}
          status={kpiData.warehouseCapacity > 90 ? "critical" : kpiData.warehouseCapacity > 80 ? "warning" : "normal"}
          api="GET /v1/warehouse/capacity"
        />
        <KPICard
          title="Avg. Turnover Rate"
          value={isLoading ? "—" : `${kpiData.avgTurnover}x`}
          change={18}
          icon={TrendingUp}
          api="GET /v1/analytics/turnover"
        />
      </div>

      {/* AI Intelligence Center */}
      <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
        <CardHeader className="border-b border-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[var(--retro-burgundy)] to-[var(--retro-terracotta)] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="tracking-tight">AI Intelligence Center</CardTitle>
              <p className="text-xs text-muted-foreground">Powered by predictive analytics engine</p>
            </div>
            <ApiBadge endpoint="GET /v1/ai/insights" className="ml-auto" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-foreground/10">
            {/* Stock Forecasting */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm tracking-tight">Stock Forecasting</h4>
                <ApiBadge endpoint="POST /v1/inventory/predict" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--retro-terracotta)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--retro-terracotta)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #1c1917",
                        borderRadius: "2px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stroke="var(--retro-terracotta)"
                      fill="url(#colorForecast)"
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="var(--retro-burgundy)"
                      strokeWidth={2}
                      dot={{ fill: "var(--retro-burgundy)", r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Projected demand increase of <span className="font-semibold text-[var(--retro-terracotta)]">+15%</span> for Q3
              </p>
            </div>

            {/* Predictive Restocking */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm tracking-tight">Predictive Restocking</h4>
                <ApiBadge endpoint="GET /v1/restock/suggestions" />
              </div>
              <div className="space-y-3">
                {restockSuggestions.map((item) => (
                  <div
                    key={item.sku}
                    className={cn(
                      "p-3 border rounded-sm",
                      item.urgency === "high" ? "border-[var(--retro-red)] bg-red-50/50" : "border-foreground/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
                          {item.urgency === "high" && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0 rounded-sm">
                              URGENT
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium tracking-tight truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          AI Suggests: Reorder <span className="font-semibold">{item.quantity}</span> units
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApproveRestock(item.sku)}
                        className={cn(
                          "h-7 px-2 text-xs rounded-sm shrink-0",
                          item.urgency === "high"
                            ? "bg-[var(--retro-terracotta)] hover:bg-[var(--retro-red)] text-white"
                            : "bg-foreground text-background hover:bg-foreground/90"
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomaly Detection */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm tracking-tight">Anomaly Detection Log</h4>
                <ApiBadge endpoint="GET /v1/alerts/anomalies" />
              </div>
              <div className="space-y-2">
                {anomalyAlerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    className={cn(
                      "py-2 rounded-sm border",
                      alert.type === "spike" && "border-[var(--retro-red)] bg-red-50/50",
                      alert.type === "discrepancy" && "border-[var(--retro-orange)] bg-orange-50/50",
                      alert.type === "pattern" && "border-foreground/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <AlertTitle className="text-xs font-semibold tracking-tight mb-0.5 flex items-center gap-1">
                          {alert.type === "spike" && <TrendingUp className="w-3 h-3 text-[var(--retro-red)]" />}
                          {alert.type === "discrepancy" && <AlertTriangle className="w-3 h-3 text-[var(--retro-orange)]" />}
                          {alert.type === "pattern" && <Brain className="w-3 h-3" />}
                          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                        </AlertTitle>
                        <AlertDescription className="text-[11px] text-muted-foreground leading-tight">
                          {alert.message}
                        </AlertDescription>
                        <span className="text-[10px] text-muted-foreground/60">{alert.time}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissAlert(alert.id)}
                        className="h-6 w-6 p-0 rounded-sm hover:bg-muted shrink-0"
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm tracking-tight">Documentation Engagement Trend</CardTitle>
              <ApiBadge endpoint="GET /v1/analytics/engagement" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #1c1917",
                      borderRadius: "2px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--retro-burgundy)"
                    strokeWidth={2}
                    dot={{ fill: "var(--retro-burgundy)", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm tracking-tight">Views & Edits by Week</CardTitle>
              <ApiBadge endpoint="GET /v1/analytics/activity" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--retro-burgundy)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--retro-burgundy)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEdits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--retro-ochre)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--retro-ochre)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #1c1917",
                      borderRadius: "2px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="var(--retro-burgundy)"
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="edits"
                    stroke="var(--retro-ochre)"
                    fill="url(#colorEdits)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
