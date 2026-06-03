"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ApiLoggerProvider } from "@/components/api-logger-context"
import { ApiNetworkLogger } from "@/components/api-network-logger"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ProductManagement } from "@/components/product-management"
import { ApiConfig } from "@/components/api-config"
import { User, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

function TopBar() {
  return (
    <header className="h-14 border-b border-foreground bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium tracking-tight text-muted-foreground">
          Intelligent Inventory Management System
        </h2>
        <Badge className="bg-[var(--retro-terracotta)]/10 text-[var(--retro-terracotta)] border-[var(--retro-terracotta)] rounded-sm text-[10px] font-mono">
          ACADEMIC PROTOTYPE
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 rounded-sm"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--retro-red)] rounded-full" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 gap-2 px-2 border-foreground/20 rounded-sm"
            >
              <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
                <User className="w-4 h-4 text-background" />
              </div>
              <span className="text-xs font-medium tracking-tight hidden sm:inline">Admin User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-foreground rounded-sm">
            <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">API Keys</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-[var(--retro-red)]">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function PlaceholderContent({ title, api }: { title: string; api: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
      <div className="w-16 h-16 bg-muted rounded-sm flex items-center justify-center mb-4">
        <Settings className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">This module is under development</p>
      <span className="api-badge">{api}</span>
    </div>
  )
}

function DashboardContent({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "dashboard":
      return <DashboardOverview />
    case "products":
      return <ProductManagement />
    case "inventory":
      return <PlaceholderContent title="Inventory Management" api="GET /v1/inventory" />
    case "analytics":
      return <PlaceholderContent title="Analytics & Reports" api="GET /v1/analytics" />
    case "api-config":
      return <ApiConfig />
    case "settings":
      return <PlaceholderContent title="System Settings" api="GET /v1/settings" />
    default:
      return <DashboardOverview />
  }
}

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <ApiLoggerProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="ml-64 transition-all duration-200 pb-12">
          <TopBar />
          
          <main className="p-6">
            <DashboardContent activeTab={activeTab} />
          </main>
        </div>

        {/* Retro gradient footer accent */}
        <div className="fixed bottom-10 left-0 right-0 h-1 retro-gradient z-40" />

        {/* API Network Logger */}
        <ApiNetworkLogger />
      </div>
    </ApiLoggerProvider>
  )
}
