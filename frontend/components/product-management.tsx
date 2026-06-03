"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react"
import { useApiLogger, simulateApiCall } from "./api-logger-context"

interface Product {
  id: string
  sku: string
  name: string
  category: string
  price: number
  stock_actual: number
  stock_minimo: number
  status: "normal" | "low" | "out"
}

const categories = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Industrial" },
  { id: "3", name: "Automotive" },
  { id: "4", name: "Office Supplies" },
  { id: "5", name: "Safety Equipment" },
]

const initialProducts: Product[] = [
  { id: "1", sku: "SKU-001", name: "Industrial Bearing Set A", category: "Industrial", price: 45.99, stock_actual: 230, stock_minimo: 50, status: "normal" },
  { id: "2", sku: "SKU-002", name: "Steel Fasteners Pack", category: "Industrial", price: 12.50, stock_actual: 890, stock_minimo: 200, status: "normal" },
  { id: "3", sku: "SKU-003", name: "Hydraulic Pump Unit", category: "Automotive", price: 299.00, stock_actual: 15, stock_minimo: 20, status: "low" },
  { id: "4", sku: "SKU-004", name: "Safety Goggles Pro", category: "Safety Equipment", price: 24.99, stock_actual: 0, stock_minimo: 100, status: "out" },
  { id: "5", sku: "SKU-005", name: "Circuit Board Module", category: "Electronics", price: 89.99, stock_actual: 45, stock_minimo: 30, status: "normal" },
  { id: "6", sku: "SKU-006", name: "Thermal Paste Tube", category: "Electronics", price: 8.99, stock_actual: 12, stock_minimo: 50, status: "low" },
  { id: "7", sku: "SKU-007", name: "Office Chair Caster", category: "Office Supplies", price: 15.00, stock_actual: 340, stock_minimo: 100, status: "normal" },
  { id: "8", sku: "SKU-008", name: "LED Panel Light", category: "Electronics", price: 65.00, stock_actual: 78, stock_minimo: 40, status: "normal" },
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

export function ProductManagement() {
  const { addLog } = useApiLogger()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    stock_actual: "",
    stock_minimo: "",
  })

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    const start = Date.now()
    try {
      const res = await fetch("http://localhost:5218/api/products")
      const duration = Date.now() - start
      const data = await res.json()
      addLog({ method: "GET", endpoint: "/api/products", status: res.status, statusText: res.statusText, duration })
      const mapped: Product[] = data.map((p: any) => ({
        id: String(p.id),
        sku: p.sku,
        name: p.name,
        category: p.category,
        price: p.price,
        stock_actual: p.stockActual,
        stock_minimo: p.stockMinimo,
        status: p.status === "Out of Stock" ? "out" : p.status === "Low Stock" ? "low" : "normal",
      }))
      setProducts(mapped)
    } catch {
      addLog({ method: "GET", endpoint: "/api/products", status: 500, statusText: "Error", duration: Date.now() - start })
    }
    setIsLoading(false)
  }, [addLog])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-100 text-green-800 border-green-300 rounded-sm font-mono text-[10px]">NORMAL</Badge>
      case "low":
        return <Badge className="bg-[var(--retro-ochre)]/20 text-[var(--retro-orange)] border-[var(--retro-orange)] rounded-sm font-mono text-[10px]">LOW STOCK</Badge>
      case "out":
        return <Badge className="bg-[var(--retro-red)]/10 text-[var(--retro-red)] border-[var(--retro-red)] rounded-sm font-mono text-[10px]">OUT OF STOCK</Badge>
    }
  }

  const calculateStatus = (actual: number, minimum: number): Product["status"] => {
    if (actual === 0) return "out"
    if (actual < minimum) return "low"
    return "normal"
  }

  const handleSubmit = async () => {
    if (editingProduct) {
      await simulateApiCall(addLog, "PUT", `/v1/products/${editingProduct.id}`)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...formData,
                price: parseFloat(formData.price),
                stock_actual: parseInt(formData.stock_actual),
                stock_minimo: parseInt(formData.stock_minimo),
                status: calculateStatus(parseInt(formData.stock_actual), parseInt(formData.stock_minimo)),
              }
            : p
        )
      )
    } else {
      await simulateApiCall(addLog, "POST", "/v1/products")
      const newProduct: Product = {
        id: crypto.randomUUID(),
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock_actual: parseInt(formData.stock_actual),
        stock_minimo: parseInt(formData.stock_minimo),
        status: calculateStatus(parseInt(formData.stock_actual), parseInt(formData.stock_minimo)),
      }
      setProducts((prev) => [newProduct, ...prev])
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    await simulateApiCall(addLog, "DELETE", `/v1/products/${id}`)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock_actual: product.stock_actual.toString(),
      stock_minimo: product.stock_minimo.toString(),
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      sku: "",
      name: "",
      category: "",
      price: "",
      stock_actual: "",
      stock_minimo: "",
    })
  }

  const handleExport = async () => {
    await simulateApiCall(addLog, "GET", "/v1/products/export?format=csv")
  }

  const handleImport = async () => {
    await simulateApiCall(addLog, "POST", "/v1/products/import")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter">Product Management</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground tracking-tight">
              Manage your inventory products and stock levels
            </p>
            <ApiBadge endpoint="GET, POST, PUT, DELETE /v1/products" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-foreground rounded-sm gap-1"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="border-foreground rounded-sm gap-1"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-sm gap-1">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="border-foreground rounded-sm sm:max-w-[500px]">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="tracking-tight">
                    {editingProduct ? "Edit Product" : "Register New Product"}
                  </DialogTitle>
                  <ApiBadge endpoint={editingProduct ? "PUT /v1/products/:id" : "POST /v1/products"} />
                </div>
                <DialogDescription className="text-xs">
                  Fill in the product details below. All fields map directly to database schema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-xs font-medium">
                      SKU <span className="text-muted-foreground font-mono">(sku)</span>
                    </Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SKU-XXX"
                      className="border-foreground/30 rounded-sm font-mono"
                      disabled={!!editingProduct}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-medium">
                      Category <span className="text-muted-foreground font-mono">(categoria_id)</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="border-foreground/30 rounded-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border-foreground rounded-sm">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Product Name <span className="text-muted-foreground font-mono">(name)</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="border-foreground/30 rounded-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-medium">
                      Price <span className="text-muted-foreground font-mono">(price)</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="border-foreground/30 rounded-sm font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_actual" className="text-xs font-medium">
                      Current Stock <span className="text-muted-foreground font-mono">(stock_actual)</span>
                    </Label>
                    <Input
                      id="stock_actual"
                      type="number"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                      placeholder="0"
                      className="border-foreground/30 rounded-sm font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_minimo" className="text-xs font-medium">
                      Min. Stock <span className="text-muted-foreground font-mono">(stock_minimo)</span>
                    </Label>
                    <Input
                      id="stock_minimo"
                      type="number"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                      placeholder="0"
                      className="border-foreground/30 rounded-sm font-mono"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-foreground rounded-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-sm"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-foreground/30 rounded-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 border-foreground/30 rounded-sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="border-foreground rounded-sm">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 border-foreground/30 rounded-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-foreground rounded-sm">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchProducts}
                className="border-foreground/30 rounded-sm"
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border border-foreground rounded-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,0.1)] overflow-hidden">
        <CardHeader className="border-b border-foreground/10 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm tracking-tight">
              Products ({filteredProducts.length})
            </CardTitle>
            <ApiBadge endpoint="GET /v1/products" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-foreground/10 hover:bg-transparent">
                  <TableHead className="font-semibold text-xs tracking-tight">SKU</TableHead>
                  <TableHead className="font-semibold text-xs tracking-tight">Name</TableHead>
                  <TableHead className="font-semibold text-xs tracking-tight">Category</TableHead>
                  <TableHead className="font-semibold text-xs tracking-tight text-right">Price</TableHead>
                  <TableHead className="font-semibold text-xs tracking-tight text-right">Current Stock</TableHead>
                  <TableHead className="font-semibold text-xs tracking-tight text-right">Min. Stock</TableHead>
                  <TableHead className="font-semibold text-xs tracking-tight">Status</TableHead>
                  <TableHead className="font-semibold text-xs tracking-tight text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className={cn(
                      "border-b border-foreground/5",
                      product.status === "out" && "bg-[var(--retro-red)]/5",
                      product.status === "low" && "bg-[var(--retro-ochre)]/5"
                    )}
                  >
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell className="font-medium text-sm tracking-tight">{product.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-right font-mono text-sm">${product.price.toFixed(2)}</TableCell>
                    <TableCell className={cn(
                      "text-right font-mono text-sm",
                      product.status === "out" && "text-[var(--retro-red)] font-semibold",
                      product.status === "low" && "text-[var(--retro-orange)] font-semibold"
                    )}>
                      {product.stock_actual}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {product.stock_minimo}
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="h-7 w-7 p-0 rounded-sm hover:bg-muted"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="h-7 w-7 p-0 rounded-sm hover:bg-[var(--retro-red)]/10 hover:text-[var(--retro-red)]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
