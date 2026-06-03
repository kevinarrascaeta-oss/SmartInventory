"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Settings,
  Search,
  Menu,
  ChevronRight,
  Boxes,
  BarChart3,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const navItems = [
  {
    group: "Core",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, api: "GET /v1/analytics/summary" },
      { id: "products", label: "Products", icon: Package, api: "GET /v1/products" },
      { id: "inventory", label: "Inventory", icon: Boxes, api: "GET /v1/inventory" },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3, api: "GET /v1/analytics" },
    ],
  },
  {
    group: "System",
    items: [
      { id: "api-config", label: "API Config", icon: Shield, api: "GET /v1/system/status" },
      { id: "settings", label: "Settings", icon: Settings, api: "GET /v1/settings" },
    ],
  },
]

export function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-foreground flex flex-col transition-all duration-200 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-foreground">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
              <Boxes className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tighter">IntelliStock</h1>
              <span className="text-[10px] text-muted-foreground tracking-tight">v1.0.0-beta</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 border border-foreground/20 rounded-sm"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-foreground/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm border-foreground/30 rounded-sm bg-muted/50"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((group) => (
          <div key={group.group} className="mb-4">
            {!collapsed && (
              <div className="px-4 py-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                  {group.group}
                </span>
              </div>
            )}
            {group.items
              .filter((item) =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                      "hover:bg-muted border-l-2",
                      isActive
                        ? "border-l-[var(--retro-terracotta)] bg-muted font-medium"
                        : "border-l-transparent"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-[var(--retro-terracotta)]")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left tracking-tight">{item.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </>
                    )}
                  </button>
                )
              })}
          </div>
        ))}
      </nav>

      {/* Footer gradient stripe */}
      <div className="h-1.5 retro-gradient" />
    </aside>
  )
}
