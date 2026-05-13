import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supplierService } from '../../services/apiServices.js'
import { toast } from 'sonner'
import { Plus, Edit2, Star, Truck, Mail, Phone, MapPin, ToggleLeft } from 'lucide-react'
import { Modal, Badge, SearchInput, PageLoader, EmptyState, ConfirmDialog, DataTable } from '../../components/ui/index.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useForm } from 'react-hook-form'

const PAYMENT_TERMS = ['NET-15', 'NET-30', 'NET-45', 'NET-60', 'COD', 'ADVANCE']

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating?.toFixed(1)}</span>
    </div>
  )
}

export default function SuppliersPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
  })

  const { register, handleSubmit, reset, setValue } = useForm()

  const createMutation = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => { toast.success('Supplier added!'); qc.invalidateQueries(['suppliers']); closeModal() },
    onError: () => toast.error('Failed to add supplier'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => supplierService.update(id, data),
    onSuccess: () => { toast.success('Supplier updated!'); qc.invalidateQueries(['suppliers']); closeModal() },
    onError: () => toast.error('Failed to update'),
  })

  const deactivateMutation = useMutation({
    mutationFn: supplierService.deactivate,
    onSuccess: () => { toast.success('Supplier deactivated'); qc.invalidateQueries(['suppliers']) },
    onError: () => toast.error('Failed to deactivate'),
  })

  const canEdit = ['ADMIN', 'OFFICER'].includes(user?.role)

  const openCreate = () => { reset(); setEditItem(null); setModalOpen(true) }
  const openEdit = (s) => { setEditItem(s); Object.entries(s).forEach(([k, v]) => setValue(k, v)); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null); reset() }

  const onSubmit = (data) => {
    if (editItem) updateMutation.mutate({ id: editItem.supplierId, data })
    else createMutation.mutate(data)
  }

  const filtered = suppliers.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase()) ||
    s.country?.toLowerCase().includes(search.toLowerCase())
  )

  const tableColumns = [
    { key: 'name', label: 'Supplier', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-200">{v}</p>
        <p className="text-xs text-slate-400">{row.contactPerson}</p>
      </div>
    )},
    { key: 'email', label: 'Contact', render: (v, row) => (
      <div className="text-xs">
        <p>{v}</p>
        <p className="text-slate-400">{row.phone}</p>
      </div>
    )},
    { key: 'city', label: 'Location', render: (v, row) => `${v}, ${row.country}` },
    { key: 'paymentTerms', label: 'Payment' },
    { key: 'leadTimeDays', label: 'Lead Time', render: (v) => `${v} days` },
    { key: 'rating', label: 'Rating', render: (v) => <StarRating rating={v} /> },
    { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'default'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'supplierId', label: 'Actions', render: (v, row) => canEdit ? (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => deactivateMutation.mutate(v)} className="btn-ghost p-1.5"><ToggleLeft className="w-3.5 h-3.5" /></button>
      </div>
    ) : null },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{suppliers.length} registered suppliers</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-xs ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Grid</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-xs ${viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Table</button>
          </div>
          {canEdit && <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Supplier</button>}
        </div>
      </div>

      <div className="card p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, city, or country..." />
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={tableColumns} data={filtered} emptyMessage="No suppliers found" />
      ) : (
        filtered.length === 0
          ? <div className="card"><EmptyState icon={Truck} title="No suppliers found" /></div>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(s => (
                <div key={s.supplierId} className="card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{s.name}</h3>
                      <p className="text-xs text-slate-400">{s.contactPerson}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={s.isActive ? 'success' : 'default'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>

                  <StarRating rating={s.rating} />

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{s.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{s.phone}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-3 h-3" />{s.city}, {s.country}</div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                    <span className="text-slate-500">Terms: <span className="font-medium text-slate-700 dark:text-slate-300">{s.paymentTerms}</span></span>
                    <span className="text-slate-500">Lead: <span className="font-medium text-slate-700 dark:text-slate-300">{s.leadTimeDays}d</span></span>
                  </div>

                  {canEdit && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <button onClick={() => openEdit(s)} className="btn-secondary text-xs py-1.5 flex-1 justify-center"><Edit2 className="w-3 h-3" /> Edit</button>
                      <button onClick={() => deactivateMutation.mutate(s.supplierId)} className="btn-ghost text-xs py-1.5 flex-1 justify-center"><ToggleLeft className="w-3 h-3" /> Deactivate</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company Name *</label>
              <input {...register('name', { required: true })} className="input" placeholder="Supplier name" />
            </div>
            <div>
              <label className="label">Contact Person</label>
              <input {...register('contactPerson')} className="input" placeholder="Contact name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="email@company.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input" placeholder="+91-XXXXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input {...register('address')} className="input" placeholder="Full address" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">City</label>
              <input {...register('city')} className="input" placeholder="Mumbai" />
            </div>
            <div>
              <label className="label">Country</label>
              <input {...register('country')} className="input" placeholder="India" />
            </div>
            <div>
              <label className="label">Tax ID</label>
              <input {...register('taxId')} className="input" placeholder="GST number" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Payment Terms</label>
              <select {...register('paymentTerms')} className="select">
                {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Lead Time (days)</label>
              <input {...register('leadTimeDays', { valueAsNumber: true })} type="number" className="input" placeholder="7" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editItem ? 'Update' : 'Add'} Supplier</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
