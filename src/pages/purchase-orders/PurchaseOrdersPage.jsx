import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseService, supplierService, warehouseService } from '../../services/apiServices.js'
import { mockPurchaseOrders, mockSuppliers, mockWarehouses } from '../../constants/mockData.js'
import { toast } from 'sonner'
import { Plus, Check, X, Package, Eye, ChevronDown } from 'lucide-react'
import { DataTable, Modal, StatusBadge, SearchInput, ConfirmDialog, PageLoader, KpiCard, Badge } from '../../components/ui/index.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useForm, useFieldArray } from 'react-hook-form'
import { format } from 'date-fns'
import clsx from 'clsx'

const STATUS_OPTIONS = ['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED']

export default function PurchaseOrdersPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewPO, setViewPO] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  const { data: pos = mockPurchaseOrders, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: purchaseService.getAll,
  })

  const { data: suppliers = mockSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
  })

  const { data: warehouses = mockWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouseService.getAll,
  })

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { lineItems: [{ productId: '', quantity: 1, unitCost: 0 }] }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })

  const createMutation = useMutation({
    mutationFn: purchaseService.create,
    onSuccess: () => { toast.success('Purchase order created!'); qc.invalidateQueries(['purchase-orders']); setModalOpen(false); reset() },
    onError: () => toast.error('Failed to create PO'),
  })

  const approveMutation = useMutation({
    mutationFn: purchaseService.approve,
    onSuccess: () => { toast.success('PO approved!'); qc.invalidateQueries(['purchase-orders']); setConfirmAction(null) },
    onError: () => toast.error('Failed to approve PO'),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => purchaseService.cancel(id, { reason: 'Cancelled by user' }),
    onSuccess: () => { toast.success('PO cancelled'); qc.invalidateQueries(['purchase-orders']); setConfirmAction(null) },
    onError: () => toast.error('Failed to cancel PO'),
  })

  const canApprove = ['ADMIN', 'MANAGER'].includes(user?.role)
  const canCreate = ['ADMIN', 'OFFICER'].includes(user?.role)

  const filtered = pos.filter(p => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter
    const matchSearch = !search || p.referenceNumber?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const pendingCount = pos.filter(p => p.status === 'PENDING').length
  const approvedCount = pos.filter(p => p.status === 'APPROVED').length
  const totalSpend = pos.filter(p => p.status === 'RECEIVED').reduce((s, p) => s + p.totalAmount, 0)

  const columns = [
    { key: 'referenceNumber', label: 'PO Number', render: (v) => <span className="font-mono text-sm font-medium text-brand-600">{v}</span> },
    { key: 'supplierId', label: 'Supplier', render: (v) => suppliers.find(s => s.supplierId === v)?.name || `Supplier #${v}` },
    { key: 'warehouseId', label: 'Warehouse', render: (v) => warehouses.find(w => w.warehouseId === v)?.name || `Warehouse #${v}` },
    { key: 'totalAmount', label: 'Total', render: (v) => <span className="font-medium">₹{Number(v).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'orderDate', label: 'Order Date', render: (v) => <span className="text-xs text-slate-400">{v}</span> },
    { key: 'expectedDate', label: 'Expected', render: (v) => <span className="text-xs text-slate-400">{v}</span> },
    { key: 'poId', label: 'Actions', render: (v, row) => (
      <div className="flex gap-1">
        <button onClick={() => setViewPO(row)} className="btn-ghost p-1.5" title="View">
          <Eye className="w-3.5 h-3.5" />
        </button>
        {canApprove && row.status === 'PENDING' && (
          <button onClick={() => setConfirmAction({ type: 'approve', id: v, label: row.referenceNumber })} className="btn-ghost p-1.5 text-green-600" title="Approve">
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        {(canCreate || canApprove) && ['DRAFT', 'PENDING'].includes(row.status) && (
          <button onClick={() => setConfirmAction({ type: 'cancel', id: v, label: row.referenceNumber })} className="btn-ghost p-1.5 text-red-500" title="Cancel">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    )},
  ]

  const onSubmit = (data) => createMutation.mutate(data)

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">{pos.length} total orders</p>
        </div>
        {canCreate && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create PO
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Pending Approval" value={pendingCount} icon={Package} color="yellow" />
        <KpiCard title="Approved POs" value={approvedCount} icon={Check} color="brand" />
        <KpiCard title="Total Received Value" value={`₹${totalSpend.toLocaleString()}`} icon={Package} color="green" />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by PO number..." className="flex-1 min-w-48" />
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No purchase orders found" />

      {/* Create PO Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Create Purchase Order" size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Supplier</label>
              <select {...register('supplierId', { required: true, valueAsNumber: true })} className="select">
                <option value="">Select supplier...</option>
                {suppliers.filter(s => s.isActive).map(s => <option key={s.supplierId} value={s.supplierId}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Delivery Warehouse</label>
              <select {...register('warehouseId', { required: true, valueAsNumber: true })} className="select">
                <option value="">Select warehouse...</option>
                {warehouses.filter(w => w.isActive).map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Order Date</label>
              <input {...register('orderDate')} type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="label">Expected Delivery Date</label>
              <input {...register('expectedDate')} type="date" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Reference Number</label>
            <input {...register('referenceNumber')} className="input" placeholder="PO-2026-XXX" />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Line Items</label>
              <button type="button" onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })} className="btn-secondary text-xs py-1">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <input {...register(`lineItems.${i}.productId`, { valueAsNumber: true })} type="number" className="input" placeholder="Product ID" />
                  </div>
                  <div className="col-span-3">
                    <input {...register(`lineItems.${i}.quantity`, { valueAsNumber: true })} type="number" className="input" placeholder="Qty" min={1} />
                  </div>
                  <div className="col-span-4">
                    <input {...register(`lineItems.${i}.unitCost`, { valueAsNumber: true })} type="number" step="0.01" className="input" placeholder="Unit cost ₹" />
                  </div>
                  <div className="col-span-1 flex justify-center pt-2">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} className="input" rows={2} placeholder="Additional notes..." />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset() }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-secondary" onClick={() => register('status').onChange({ target: { value: 'DRAFT' } })}>Save as Draft</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>Submit for Approval</button>
          </div>
        </form>
      </Modal>

      {/* View PO Modal */}
      {viewPO && (
        <Modal open={!!viewPO} onClose={() => setViewPO(null)} title={`Purchase Order — ${viewPO.referenceNumber}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Supplier:</span> <span className="font-medium ml-1">{suppliers.find(s => s.supplierId === viewPO.supplierId)?.name}</span></div>
              <div><span className="text-slate-500">Warehouse:</span> <span className="font-medium ml-1">{warehouses.find(w => w.warehouseId === viewPO.warehouseId)?.name}</span></div>
              <div><span className="text-slate-500">Status:</span> <span className="ml-1"><StatusBadge status={viewPO.status} /></span></div>
              <div><span className="text-slate-500">Total Amount:</span> <span className="font-medium ml-1">₹{Number(viewPO.totalAmount).toLocaleString()}</span></div>
              <div><span className="text-slate-500">Order Date:</span> <span className="ml-1">{viewPO.orderDate}</span></div>
              <div><span className="text-slate-500">Expected Date:</span> <span className="ml-1">{viewPO.expectedDate}</span></div>
            </div>
            {viewPO.notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                {viewPO.notes}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              {canApprove && viewPO.status === 'PENDING' && (
                <button onClick={() => { approveMutation.mutate(viewPO.poId); setViewPO(null) }} className="btn-primary">
                  <Check className="w-4 h-4" /> Approve PO
                </button>
              )}
              <button onClick={() => setViewPO(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction.type === 'approve') approveMutation.mutate(confirmAction.id)
          if (confirmAction.type === 'cancel') cancelMutation.mutate(confirmAction.id)
        }}
        title={confirmAction?.type === 'approve' ? 'Approve Purchase Order' : 'Cancel Purchase Order'}
        message={`Are you sure you want to ${confirmAction?.type} ${confirmAction?.label}?`}
        confirmLabel={confirmAction?.type === 'approve' ? 'Approve' : 'Cancel PO'}
        danger={confirmAction?.type === 'cancel'}
      />
    </div>
  )
}
