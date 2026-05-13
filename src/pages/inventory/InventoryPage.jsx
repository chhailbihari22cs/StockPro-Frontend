import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { warehouseService } from '../../services/apiServices.js'
import { mockStockLevels, mockProducts, mockWarehouses } from '../../constants/mockData.js'
import { toast } from 'sonner'
import { ArrowLeftRight, Package, BarChart3, AlertTriangle } from 'lucide-react'
import { DataTable, Modal, SearchInput, PageLoader, Badge, KpiCard } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'

export default function InventoryPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [transferModal, setTransferModal] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data: warehouses = mockWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouseService.getAll,
  })

  const { data: stockLevels = mockStockLevels, isLoading } = useQuery({
    queryKey: ['stock-all'],
    queryFn: () => warehouseService.getAllStock(),
  })

  const transferMutation = useMutation({
    mutationFn: warehouseService.transferStock,
    onSuccess: () => { toast.success('Stock transferred successfully!'); qc.invalidateQueries(['stock-all']); setTransferModal(false); reset() },
    onError: () => toast.error('Transfer failed'),
  })

  // Enrich stock with product/warehouse names from mock
  const enriched = stockLevels.map(s => ({
    ...s,
    productName: mockProducts.find(p => p.productId === s.productId)?.name || `Product #${s.productId}`,
    sku: mockProducts.find(p => p.productId === s.productId)?.sku || '',
    warehouseName: warehouses.find(w => w.warehouseId === s.warehouseId)?.name || `Warehouse #${s.warehouseId}`,
    availableQuantity: s.quantity - s.reservedQuantity,
    reorderLevel: mockProducts.find(p => p.productId === s.productId)?.reorderLevel || 0,
  }))

  const filtered = enriched.filter(s => {
    const matchSearch = !search || s.productName.toLowerCase().includes(search.toLowerCase()) || s.sku.toLowerCase().includes(search.toLowerCase())
    const matchWh = !warehouseFilter || s.warehouseId === Number(warehouseFilter)
    return matchSearch && matchWh
  })

  const lowStockCount = enriched.filter(s => s.availableQuantity < s.reorderLevel).length
  const totalValue = mockProducts.reduce((sum, p) => {
    const stock = enriched.find(s => s.productId === p.productId)
    return sum + (stock?.quantity || 0) * p.costPrice
  }, 0)

  const columns = [
    { key: 'productName', label: 'Product', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-200">{v}</p>
        <p className="text-xs text-slate-400 font-mono">{row.sku}</p>
      </div>
    )},
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'quantity', label: 'Total Qty', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'reservedQuantity', label: 'Reserved', render: (v) => <span className="text-yellow-600">{v}</span> },
    { key: 'availableQuantity', label: 'Available', render: (v, row) => (
      <span className={clsx('font-semibold', v < row.reorderLevel ? 'text-red-600' : 'text-green-600')}>{v}</span>
    )},
    { key: 'reorderLevel', label: 'Reorder At' },
    { key: 'availableQuantity', label: 'Status', render: (v, row) => (
      v < row.reorderLevel
        ? <Badge variant="danger">Low Stock</Badge>
        : <Badge variant="success">OK</Badge>
    )},
    { key: 'lastUpdated', label: 'Last Updated', render: (v) => <span className="text-xs text-slate-400">{v}</span> },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Real-time stock levels across all warehouses</p>
        </div>
        <button onClick={() => setTransferModal(true)} className="btn-primary">
          <ArrowLeftRight className="w-4 h-4" /> Transfer Stock
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total SKUs Tracked" value={enriched.length} icon={Package} color="brand" />
        <KpiCard title="Low Stock Items" value={lowStockCount} subtitle="Below reorder level" icon={AlertTriangle} color="red" />
        <KpiCard title="Inventory Value" value={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={BarChart3} color="green" />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products..." className="flex-1 min-w-48" />
        <select value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)} className="select w-auto min-w-44">
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No stock records found" />

      {/* Transfer modal */}
      <Modal open={transferModal} onClose={() => { setTransferModal(false); reset() }} title="Transfer Stock Between Warehouses">
        <form onSubmit={handleSubmit(d => transferMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Product ID</label>
            <input {...register('productId', { required: true, valueAsNumber: true })} type="number" className="input" placeholder="1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From Warehouse</label>
              <select {...register('fromWarehouseId', { required: true, valueAsNumber: true })} className="select">
                <option value="">Select...</option>
                {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">To Warehouse</label>
              <select {...register('toWarehouseId', { required: true, valueAsNumber: true })} className="select">
                <option value="">Select...</option>
                {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input {...register('quantity', { required: true, valueAsNumber: true, min: 1 })} type="number" className="input" placeholder="10" />
          </div>
          <div>
            <label className="label">Reason / Notes</label>
            <textarea {...register('notes')} className="input" rows={2} placeholder="Reason for transfer..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setTransferModal(false); reset() }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={transferMutation.isPending}>Transfer Stock</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
