import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { movementService, warehouseService } from '../../services/apiServices.js'
import { mockMovements, mockProducts, mockWarehouses, mockUsers } from '../../constants/mockData.js'
import { toast } from 'sonner'
import { Plus, ArrowLeftRight, Download } from 'lucide-react'
import { DataTable, Modal, StatusBadge, SearchInput, PageLoader, Select } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import clsx from 'clsx'

const MOVEMENT_TYPES = ['ALL', 'STOCK_IN', 'STOCK_OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'WRITE_OFF', 'RETURN']

export default function MovementsPage() {
  const qc = useQueryClient()
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: movements = mockMovements, isLoading } = useQuery({
    queryKey: ['movements'],
    queryFn: () => movementService.getAll(),
  })

  const { data: warehouses = mockWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouseService.getAll,
  })

  const { register, handleSubmit, reset } = useForm()

  const recordMutation = useMutation({
    mutationFn: movementService.record,
    onSuccess: () => { toast.success('Movement recorded!'); qc.invalidateQueries(['movements']); setModalOpen(false); reset() },
    onError: () => toast.error('Failed to record movement'),
  })

  const enriched = movements.map(m => ({
    ...m,
    productName: mockProducts.find(p => p.productId === m.productId)?.name || `Product #${m.productId}`,
    warehouseName: warehouses.find(w => w.warehouseId === m.warehouseId)?.name || `Warehouse #${m.warehouseId}`,
    performedByName: mockUsers.find(u => u.userId === m.performedBy)?.fullName || `User #${m.performedBy}`,
  }))

  const filtered = enriched.filter(m => {
    const matchType = typeFilter === 'ALL' || m.movementType === typeFilter
    const matchSearch = !search || m.productName.toLowerCase().includes(search.toLowerCase())
    const matchDate = (!dateFrom || new Date(m.movementDate) >= new Date(dateFrom)) &&
                      (!dateTo || new Date(m.movementDate) <= new Date(dateTo + 'T23:59:59'))
    return matchType && matchSearch && matchDate
  })

  const columns = [
    { key: 'movementId', label: 'ID', render: (v) => <span className="font-mono text-xs text-slate-400">#{v}</span> },
    { key: 'productName', label: 'Product', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-40">{v}</p>
        <p className="text-xs text-slate-400">{row.warehouseName}</p>
      </div>
    )},
    { key: 'movementType', label: 'Type', render: (v) => <StatusBadge status={v} /> },
    { key: 'quantity', label: 'Quantity', render: (v, row) => {
      const isOut = ['STOCK_OUT', 'TRANSFER_OUT', 'WRITE_OFF'].includes(row.movementType)
      return <span className={clsx('font-semibold', isOut ? 'text-red-500' : 'text-green-600')}>{isOut ? '-' : '+'}{Math.abs(v)}</span>
    }},
    { key: 'balanceAfter', label: 'Balance', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'unitCost', label: 'Unit Cost', render: (v) => v ? `₹${Number(v).toFixed(2)}` : '-' },
    { key: 'referenceType', label: 'Reference', render: (v, row) => (
      <span className="text-xs">
        {v} {row.referenceId ? `#${row.referenceId}` : ''}
      </span>
    )},
    { key: 'performedByName', label: 'By', render: (v) => <span className="text-xs text-slate-500">{v}</span> },
    { key: 'notes', label: 'Notes', render: (v) => <span className="text-xs text-slate-400 truncate max-w-32 block">{v || '-'}</span> },
    { key: 'movementDate', label: 'Date', render: (v) => (
      <span className="text-xs text-slate-400">{format(new Date(v), 'dd MMM yy HH:mm')}</span>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Movements</h1>
          <p className="page-subtitle">Complete audit trail of all inventory movements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {}} className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Record Movement</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by product..." className="flex-1 min-w-48" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input w-auto" placeholder="From" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input w-auto" placeholder="To" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {MOVEMENT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={clsx(
                'px-2.5 py-1 text-xs font-medium rounded-lg transition-colors',
                typeFilter === t ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : <DataTable columns={columns} data={filtered} emptyMessage="No movements found" />}

      {/* Record movement modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Record Stock Movement">
        <form onSubmit={handleSubmit(d => recordMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Movement Type</label>
            <select {...register('movementType', { required: true })} className="select">
              {MOVEMENT_TYPES.filter(t => t !== 'ALL').map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product ID</label>
              <input {...register('productId', { required: true, valueAsNumber: true })} type="number" className="input" placeholder="1" />
            </div>
            <div>
              <label className="label">Warehouse</label>
              <select {...register('warehouseId', { required: true, valueAsNumber: true })} className="select">
                <option value="">Select...</option>
                {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity</label>
              <input {...register('quantity', { required: true, valueAsNumber: true, min: 1 })} type="number" className="input" placeholder="10" />
            </div>
            <div>
              <label className="label">Unit Cost (₹)</label>
              <input {...register('unitCost', { valueAsNumber: true })} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="label">Reference (PO ID / Issue Order)</label>
            <input {...register('referenceId', { valueAsNumber: true })} type="number" className="input" placeholder="Optional reference ID" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} className="input" rows={2} placeholder="Reason / notes..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset() }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={recordMutation.isPending}>Record Movement</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
