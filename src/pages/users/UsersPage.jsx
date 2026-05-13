import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../../services/apiServices.js'
import { mockUsers } from '../../constants/mockData.js'
import { toast } from 'sonner'
import { Plus, Edit2, UserX, Users, Shield } from 'lucide-react'
import { DataTable, Modal, Badge, SearchInput, ConfirmDialog, PageLoader, KpiCard } from '../../components/ui/index.jsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8).optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'MANAGER', 'OFFICER', 'STAFF']),
  department: z.string().min(1, 'Department required'),
})

const ROLES = ['ADMIN', 'MANAGER', 'OFFICER', 'STAFF']
const ROLE_LABELS = { ADMIN: 'Administrator', MANAGER: 'Inventory Manager', OFFICER: 'Purchase Officer', STAFF: 'Warehouse Staff' }
const ROLE_COLORS = { ADMIN: 'danger', MANAGER: 'brand', OFFICER: 'info', STAFF: 'default' }

export default function UsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState(null)

  const { data: users = mockUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => { toast.success('User created!'); qc.invalidateQueries(['users']); closeModal() },
    onError: () => toast.error('Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => { toast.success('User updated!'); qc.invalidateQueries(['users']); closeModal() },
    onError: () => toast.error('Failed to update user'),
  })

  const deactivateMutation = useMutation({
    mutationFn: userService.deactivate,
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries(['users']); setConfirmDeactivate(null) },
    onError: () => toast.error('Failed to deactivate'),
  })

  const openCreate = () => { reset(); setEditUser(null); setModalOpen(true) }
  const openEdit = (u) => {
    setEditUser(u)
    setValue('fullName', u.fullName)
    setValue('email', u.email)
    setValue('role', u.role)
    setValue('department', u.department)
    setValue('password', '')
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditUser(null); reset() }

  const onSubmit = (data) => {
    const payload = { ...data }
    if (!payload.password) delete payload.password
    if (editUser) updateMutation.mutate({ id: editUser.userId, data: payload })
    else createMutation.mutate(payload)
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const adminCount = users.filter(u => u.role === 'ADMIN').length
  const activeCount = users.filter(u => u.isActive).length

  const columns = [
    { key: 'fullName', label: 'User', render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {v?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{v}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v) => <Badge variant={ROLE_COLORS[v] || 'default'}>{ROLE_LABELS[v] || v}</Badge> },
    { key: 'department', label: 'Department' },
    { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'default'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'createdAt', label: 'Created', render: (v) => <span className="text-xs text-slate-400">{v}</span> },
    { key: 'userId', label: 'Actions', render: (v, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="btn-ghost p-1.5"><Edit2 className="w-3.5 h-3.5" /></button>
        {row.isActive && <button onClick={() => setConfirmDeactivate(v)} className="btn-ghost p-1.5 text-red-500"><UserX className="w-3.5 h-3.5" /></button>}
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add User</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Users" value={users.length} icon={Users} color="brand" />
        <KpiCard title="Active Users" value={activeCount} icon={Users} color="green" />
        <KpiCard title="Administrators" value={adminCount} icon={Shield} color="red" />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." className="flex-1 min-w-48" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="select w-auto min-w-40">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {isLoading ? <PageLoader /> : <DataTable columns={columns} data={filtered} emptyMessage="No users found" />}

      {/* User form */}
      <Modal open={modalOpen} onClose={closeModal} title={editUser ? 'Edit User' : 'Add New User'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input {...register('fullName')} className="input" placeholder="John Doe" />
            {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="label">Email *</label>
            <input {...register('email')} type="email" className="input" placeholder="user@company.com" />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role *</label>
              <select {...register('role')} className="select">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department *</label>
              <input {...register('department')} className="input" placeholder="Warehouse" />
              {errors.department && <p className="error-text">{errors.department.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">{editUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input {...register('password')} type="password" className="input" placeholder="Min. 8 characters" />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editUser ? 'Update' : 'Create'} User</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={() => deactivateMutation.mutate(confirmDeactivate)}
        title="Deactivate User"
        message="This user will no longer be able to access StockPro. Are you sure?"
        confirmLabel="Deactivate"
        danger
      />
    </div>
  )
}
