import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../../services/apiServices.js'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, ToggleLeft, Search, Filter, Package } from 'lucide-react'
import {
  DataTable, Modal, Badge, StatusBadge, SearchInput,
  ConfirmDialog, FormInput, EmptyState, PageLoader
} from '../../components/ui/index.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const CATEGORIES = ['Tools', 'Safety', 'Fasteners', 'Fluids', 'Welding', 'Electrical', 'Mechanical', 'Other']

export default function ProductsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => { toast.success('Product created!'); qc.invalidateQueries(['products']); closeModal() },
    onError: () => toast.error('Failed to create product'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => { toast.success('Product updated!'); qc.invalidateQueries(['products']); closeModal() },
    onError: () => toast.error('Failed to update product'),
  })

  const deactivateMutation = useMutation({
    mutationFn: productService.deactivate,
    onSuccess: () => { toast.success('Product deactivated'); qc.invalidateQueries(['products']) },
    onError: () => toast.error('Failed to deactivate'),
  })

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries(['products']); setConfirmDelete(null) },
    onError: () => toast.error('Failed to delete'),
  })

  const openCreate = () => { reset(); setEditItem(null); setModalOpen(true) }
  const openEdit = (p) => {
    setEditItem(p)
    Object.entries(p).forEach(([k, v]) => setValue(k, v))
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditItem(null); reset() }

  const onSubmit = (data) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.productId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const canEdit = ['ADMIN', 'MANAGER'].includes(user?.role)

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || p.category === category
    return matchSearch && matchCat
  })

  const columns = [
    { key: 'sku', label: 'SKU', render: (v) => <span className="font-mono text-xs text-slate-500">{v}</span> },
    { key: 'name', label: 'Product Name', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-200">{v}</p>
        <p className="text-xs text-slate-400">{row.brand} · {row.category}</p>
      </div>
    )},
    { key: 'unitOfMeasure', label: 'UOM' },
    { key: 'costPrice', label: 'Cost', render: (v) => `₹${Number(v).toFixed(2)}` },
    { key: 'sellingPrice', label: 'Price', render: (v) => `₹${Number(v).toFixed(2)}` },
    { key: 'reorderLevel', label: 'Reorder At' },
    { key: 'isActive', label: 'Status', render: (v) => (
      <Badge variant={v ? 'success' : 'default'}>{v ? 'Active' : 'Inactive'}</Badge>
    )},
    { key: 'productId', label: 'Actions', width: 120, render: (v, row) => canEdit ? (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="btn-ghost p-1.5" title="Edit">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => deactivateMutation.mutate(v)} className="btn-ghost p-1.5" title="Deactivate">
          <ToggleLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setConfirmDelete(v)} className="btn-ghost p-1.5 text-red-500" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ) : null },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in catalogue</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or SKU..." className="flex-1 min-w-48" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="select w-auto min-w-36">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? <PageLoader /> : (
        filtered.length === 0
          ? <div className="card"><EmptyState icon={Package} title="No products found" description="Try adjusting your search or add a new product" action={canEdit && <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Product</button>} /></div>
          : <DataTable columns={columns} data={filtered} />
      )}

      {/* Product form modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input {...register('name', { required: 'Name required' })} className="input" placeholder="Product name" />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">SKU *</label>
              <input {...register('sku', { required: 'SKU required' })} className="input" placeholder="SKU-001" />
              {errors.sku && <p className="error-text">{errors.sku.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="select">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input {...register('brand')} className="input" placeholder="Brand name" />
            </div>
            <div>
              <label className="label">Unit of Measure</label>
              <input {...register('unitOfMeasure')} className="input" placeholder="Piece / Box / Kg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cost Price (₹)</label>
              <input {...register('costPrice', { valueAsNumber: true })} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Selling Price (₹)</label>
              <input {...register('sellingPrice', { valueAsNumber: true })} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Reorder Level</label>
              <input {...register('reorderLevel', { valueAsNumber: true })} type="number" className="input" placeholder="10" />
            </div>
            <div>
              <label className="label">Max Stock Level</label>
              <input {...register('maxStockLevel', { valueAsNumber: true })} type="number" className="input" placeholder="100" />
            </div>
            <div>
              <label className="label">Lead Time (days)</label>
              <input {...register('leadTimeDays', { valueAsNumber: true })} type="number" className="input" placeholder="7" />
            </div>
          </div>
          <div>
            <label className="label">Barcode</label>
            <input {...register('barcode')} className="input" placeholder="Barcode / QR code" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} className="input" rows={2} placeholder="Product description..." />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {editItem ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMutation.mutate(confirmDelete)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
