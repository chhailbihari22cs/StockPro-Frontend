import { X } from 'lucide-react'
import clsx from 'clsx'

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={clsx('relative w-full card shadow-xl animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const badgeVariants = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  success: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400',
  warning: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400',
  danger: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400',
  info: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
  brand: 'bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400',
}

export function Badge({ variant = 'default', children, className }) {
  return (
    <span className={clsx('badge', badgeVariants[variant], className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    DRAFT: 'default', PENDING: 'warning', APPROVED: 'info',
    RECEIVED: 'success', CANCELLED: 'danger',
    ACTIVE: 'success', INACTIVE: 'default',
    LOW_STOCK: 'danger', OVERSTOCK: 'warning',
    CRITICAL: 'danger', WARNING: 'warning', INFO: 'info',
    STOCK_IN: 'success', STOCK_OUT: 'danger', TRANSFER_IN: 'info',
    TRANSFER_OUT: 'info', ADJUSTMENT: 'warning', WRITE_OFF: 'danger', RETURN: 'brand',
  }
  return <Badge variant={map[status] || 'default'}>{status?.replace('_', ' ')}</Badge>
}

// ─── Table ───────────────────────────────────────────────────────────────────
export function DataTable({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>
                    <div className="skeleton h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="table-container">
        <div className="py-16 text-center text-slate-400">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>{columns.map(col => <th key={col.key} style={{ width: col.width }}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
export function KpiCard({ title, value, subtitle, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand: 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  }
  return (
    <div className="kpi-card">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={clsx('border-2 border-brand-600 border-t-transparent rounded-full animate-spin', sizes[size])} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )
}

// ─── Search Input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={clsx('relative', className)}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <select className="select" {...props}>{children}</select>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

// ─── Form Input ───────────────────────────────────────────────────────────────
export function FormInput({ label, error, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <input className="input" {...props} />
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary text-sm py-1.5"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary text-sm py-1.5"
        >
          Next
        </button>
      </div>
    </div>
  )
}
