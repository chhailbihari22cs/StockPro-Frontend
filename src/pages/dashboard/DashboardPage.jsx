import { useAuth } from '../../context/AuthContext.jsx'
import { useQuery } from '@tanstack/react-query'
import { dashboardService, alertService, movementService } from '../../services/apiServices.js'
import { mockDashboard, mockAlerts, mockMovements } from '../../constants/mockData.js'
import { KpiCard, StatusBadge, PageLoader } from '../../components/ui/index.jsx'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Package, Warehouse, DollarSign, ShoppingCart, Bell, AlertTriangle, TrendingUp, ArrowLeftRight } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const COLORS = ['#14b892', '#0d9478', '#2dd4aa', '#5eeac4', '#99f6dc']

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: stats = mockDashboard, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  })

  const { data: alerts = mockAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertService.getAll,
  })

  const { data: movements = mockMovements } = useQuery({
    queryKey: ['movements'],
    queryFn: () => movementService.getAll(),
  })

  const d = { ...mockDashboard, ...stats }

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
        <p className="page-subtitle">Here's what's happening with your inventory today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Products"
          value={d.totalProducts}
          subtitle="Active in catalogue"
          icon={Package}
          color="brand"
        />
        <KpiCard
          title="Stock Value"
          value={formatCurrency(d.totalStockValue)}
          subtitle="Current inventory value"
          icon={DollarSign}
          color="green"
        />
        <KpiCard
          title="Pending POs"
          value={d.pendingPOs}
          subtitle="Awaiting approval"
          icon={ShoppingCart}
          color="yellow"
        />
        <KpiCard
          title="Low Stock Items"
          value={d.lowStockCount || 12}
          subtitle="Require attention"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Warehouses" value={d.totalWarehouses} subtitle="Active locations" icon={Warehouse} color="blue" />
        <KpiCard title="Unread Alerts" value={d.unreadAlerts} subtitle="Require action" icon={Bell} color="yellow" />
        <KpiCard title="Inventory Turnover" value={`${d.inventoryTurnover}x`} subtitle="Last 30 days" icon={TrendingUp} color="brand" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock movements chart */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Stock Movements — Last 7 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={d.monthlyMovements}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b892" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b892" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#14b892" fill="url(#colorIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#f59e0b" fill="url(#colorOut)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Warehouse utilization */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Warehouse Utilization</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.warehouseStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="utilization" fill="#14b892" radius={[0, 4, 4, 0]}>
                {d.warehouseStats?.map((entry, i) => (
                  <Cell key={i} fill={entry.utilization > 80 ? '#ef4444' : entry.utilization > 60 ? '#f59e0b' : '#14b892'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="card p-5">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Top Moving Products</h3>
          <div className="space-y-3">
            {d.topProducts?.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 text-xs text-slate-400 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{p.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{p.movements} units</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(p.movements / d.topProducts[0].movements) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Recent Alerts</h3>
            <a href="/alerts" className="text-xs text-brand-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {(alerts || mockAlerts).slice(0, 4).map(alert => (
              <div key={alert.alertId} className={clsx(
                'flex items-start gap-3 p-3 rounded-lg',
                !alert.isRead ? 'bg-slate-50 dark:bg-slate-800/50' : ''
              )}>
                <div className={clsx(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  alert.severity === 'CRITICAL' ? 'bg-red-500' :
                  alert.severity === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'
                )} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{alert.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{alert.message}</p>
                </div>
                <StatusBadge status={alert.severity} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent movements */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">Recent Stock Movements</h3>
          <a href="/movements" className="text-xs text-brand-600 hover:underline">View all</a>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Warehouse</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {mockMovements.slice(0, 5).map(m => (
                <tr key={m.movementId}>
                  <td className="font-medium">Product #{m.productId}</td>
                  <td><StatusBadge status={m.movementType} /></td>
                  <td className={m.quantity < 0 ? 'text-red-500' : 'text-green-600'}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </td>
                  <td>Warehouse #{m.warehouseId}</td>
                  <td className="text-slate-400 text-xs">{format(new Date(m.movementDate), 'dd MMM yyyy HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
