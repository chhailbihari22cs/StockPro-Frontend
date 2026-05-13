import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { warehouseService } from '../../services/apiServices.js'
import { toast } from 'sonner'
import { Plus, Edit2, Warehouse, MapPin, Users, BarChart3 } from 'lucide-react'
import { Modal, Badge, SearchInput, PageLoader, EmptyState, ConfirmDialog } from '../../components/ui/index.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'

function UtilizationBar({ used, capacity }) {
  const pct = Math.min(100, Math.round((used / capacity) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{used.toLocaleString()} / {capacity.toLocaleString()}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-brand-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function WarehousesPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouseService.getAll,
  })

  const { register, handleSubmit, reset, setValue } = useForm()

  const createMutation = useMutation({
    mutationFn: warehouseService.create,
    onSuccess: () => { toast.success('Warehouse created!'); qc.invalidateQueries(['warehouses']); closeModal() },
    onError: () => toast.error('Failed to create warehouse'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => warehouseService.update(id, data),
    onSuccess: () => { toast.success('Warehouse updated!'); qc.invalidateQueries(['warehouses']); closeModal() },
    onError: () => toast.error('Failed to update'),
  })

  const openCreate = () => { reset(); setEditItem(null); setModalOpen(true) }
  const openEdit = (w) => { setEditItem(w); Object.entries(w).forEach(([k, v]) => setValue(k, v)); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null); reset() }

  const onSubmit = (data) => {
    if (editItem) updateMutation.mutate({ id: editItem.warehouseId, data })
    else createMutation.mutate(data)
  }

  const canEdit = ['ADMIN'].includes(user?.role)

  const filtered = warehouses.filter(w =>
    !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.location?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouses</h1>
          <p className="page-subtitle">{warehouses.length} locations configured</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        )}
      </div>

      <div className="card p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search warehouses..." />
      </div>

      {filtered.length === 0
        ? <div className="card"><EmptyState icon={Warehouse} title="No warehouses found" description="Add your first warehouse to get started" /></div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(w => (
              <div key={w.warehouseId} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{w.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {w.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={w.isActive ? 'success' : 'default'}>{w.isActive ? 'Active' : 'Inactive'}</Badge>
                    {canEdit && (
                      <button onClick={() => openEdit(w)} className="btn-ghost p-1.5 ml-1">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs mb-1.5">Capacity Utilization</p>
                    <UtilizationBar used={w.usedCapacity} capacity={w.capacity} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">📞 {w.phone}</span>
                    <span className="text-slate-500">Manager ID: {w.managerId}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{w.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Warehouse' : 'Add Warehouse'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Warehouse Name *</label>
            <input {...register('name', { required: true })} className="input" placeholder="Main Warehouse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input" placeholder="City / Area" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input" placeholder="+91-XXXXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="label">Full Address</label>
            <textarea {...register('address')} className="input" rows={2} placeholder="Full address..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Capacity (units)</label>
              <input {...register('capacity', { valueAsNumber: true })} type="number" className="input" placeholder="5000" />
            </div>
            <div>
              <label className="label">Manager User ID</label>
              <input {...register('managerId', { valueAsNumber: true })} type="number" className="input" placeholder="2" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editItem ? 'Update' : 'Create'} Warehouse</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
