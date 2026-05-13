import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertService } from '../../services/apiServices.js'
import { mockAlerts } from '../../constants/mockData.js'
import { toast } from 'sonner'
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Badge, PageLoader, EmptyState } from '../../components/ui/index.jsx'
import { format } from 'date-fns'
import clsx from 'clsx'

const SEVERITY_ICONS = {
  CRITICAL: <AlertCircle className="w-4 h-4 text-red-500" />,
  WARNING: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  INFO: <Info className="w-4 h-4 text-blue-500" />,
}

const SEVERITY_BG = {
  CRITICAL: 'border-l-red-500',
  WARNING: 'border-l-yellow-500',
  INFO: 'border-l-blue-500',
}

export default function AlertsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('ALL')

  const { data: alerts = mockAlerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertService.getAll,
  })

  const readMutation = useMutation({
    mutationFn: alertService.markAsRead,
    onSuccess: () => qc.invalidateQueries(['alerts']),
  })

  const readAllMutation = useMutation({
    mutationFn: alertService.markAllRead,
    onSuccess: () => { toast.success('All alerts marked as read'); qc.invalidateQueries(['alerts']) },
  })

  const ackMutation = useMutation({
    mutationFn: alertService.acknowledge,
    onSuccess: () => { toast.success('Alert acknowledged'); qc.invalidateQueries(['alerts']) },
  })

  const deleteMutation = useMutation({
    mutationFn: alertService.delete,
    onSuccess: () => { toast.success('Alert deleted'); qc.invalidateQueries(['alerts']) },
  })

  const filtered = alerts.filter(a => {
    if (filter === 'UNREAD') return !a.isRead
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL'
    if (filter === 'UNACKNOWLEDGED') return !a.isAcknowledged
    return true
  })

  const unread = alerts.filter(a => !a.isRead).length
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length

  const FILTER_TABS = [
    { key: 'ALL', label: `All (${alerts.length})` },
    { key: 'UNREAD', label: `Unread (${unread})` },
    { key: 'CRITICAL', label: `Critical (${critical})` },
    { key: 'UNACKNOWLEDGED', label: 'Unacknowledged' },
  ]

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="page-subtitle">{unread} unread alerts</p>
        </div>
        <button onClick={() => readAllMutation.mutate()} className="btn-secondary" disabled={readAllMutation.isPending}>
          <CheckCheck className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="card p-4">
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                filter === t.key ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        filtered.length === 0
          ? <div className="card"><EmptyState icon={Bell} title="No alerts" description="You're all caught up!" /></div>
          : (
            <div className="space-y-3">
              {filtered.map(alert => (
                <div
                  key={alert.alertId}
                  className={clsx(
                    'card p-4 border-l-4 transition-all',
                    SEVERITY_BG[alert.severity] || 'border-l-slate-300',
                    !alert.isRead && 'shadow-md'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {SEVERITY_ICONS[alert.severity]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className={clsx('text-sm font-semibold', !alert.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>
                          {alert.title}
                        </h4>
                        <Badge variant={
                          alert.severity === 'CRITICAL' ? 'danger' :
                          alert.severity === 'WARNING' ? 'warning' : 'info'
                        }>{alert.severity}</Badge>
                        <Badge variant={
                          alert.type === 'LOW_STOCK' ? 'danger' :
                          alert.type === 'OVERSTOCK' ? 'warning' :
                          alert.type === 'PO_PENDING' ? 'info' : 'default'
                        }>{alert.type?.replace('_', ' ')}</Badge>
                        {!alert.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                        {alert.isAcknowledged && <Badge variant="success">Acknowledged</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{format(new Date(alert.createdAt), 'dd MMM yyyy · HH:mm')}</p>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {!alert.isRead && (
                        <button onClick={() => readMutation.mutate(alert.alertId)} className="btn-ghost p-1.5" title="Mark as read">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!alert.isAcknowledged && (
                        <button onClick={() => ackMutation.mutate(alert.alertId)} className="btn-ghost p-1.5" title="Acknowledge">
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteMutation.mutate(alert.alertId)} className="btn-ghost p-1.5 text-red-400" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      )}
    </div>
  )
}
