import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../../services/apiServices.js'
import { mockDashboard, mockProducts } from '../../constants/mockData.js'
import { Download, TrendingUp, TrendingDown, Package, DollarSign, BarChart3 } from 'lucide-react'
import { KpiCard, PageLoader, DataTable, Badge } from '../../components/ui/index.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

const COLORS = ['#14b892', '#0d9478', '#2dd4aa', '#5eeac4', '#99f6dc', '#f59e0b', '#ef4444']

const stockValueData = mockDashboard.stockValueByWarehouse
const poSummaryData = [
  { status: 'Received', count: 12, value: 45000 },
  { status: 'Pending', count: 5, value: 18000 },
  { status: 'Approved', count: 8, value: 32000 },
  { status: 'Draft', count: 3, value: 9500 },
  { status: 'Cancelled', count: 2, value: 6200 },
]
const trendData = [
  { month: 'Nov', value: 245000, turnover: 3.8 },
  { month: 'Dec', value: 268000, turnover: 4.1 },
  { month: 'Jan', value: 255000, turnover: 3.9 },
  { month: 'Feb', value: 271000, turnover: 4.2 },
  { month: 'Mar', value: 283000, turnover: 4.5 },
  { month: 'Apr', value: 279000, turnover: 4.3 },
  { month: 'May', value: 284590, turnover: 4.2 },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const { data: totalValue = mockDashboard.totalStockValue, isLoading } = useQuery({
    queryKey: ['report-total-value'],
    queryFn: reportService.getTotalStockValue,
  })

  const { data: topMoving = mockDashboard.topProducts } = useQuery({
    queryKey: ['report-top-moving'],
    queryFn: () => reportService.getTopMoving(10),
  })

  const { data: slowMoving = mockProducts.slice(3) } = useQuery({
    queryKey: ['report-slow-moving'],
    queryFn: reportService.getSlowMoving,
  })

  const { data: deadStock = mockProducts.filter(p => p.productId === 5) } = useQuery({
    queryKey: ['report-dead-stock'],
    queryFn: reportService.getDeadStock,
  })

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'movements', label: 'Movements' },
    { key: 'procurement', label: 'Procurement' },
  ]

  const deadStockColumns = [
    { key: 'name', label: 'Product' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'costPrice', label: 'Cost Price', render: (v) => `₹${v}` },
    { key: 'isActive', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'default'}>{v ? 'Active' : 'Inactive'}</Badge> },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Inventory intelligence and business insights</p>
        </div>
        <button className="btn-secondary"><Download className="w-4 h-4" /> Export Report</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Inventory Value" value={`₹${Number(totalValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={DollarSign} color="green" />
            <KpiCard title="Inventory Turnover" value={`${mockDashboard.inventoryTurnover}x`} subtitle="Last 30 days" icon={TrendingUp} color="brand" />
            <KpiCard title="Top Moving Items" value={topMoving.length} icon={TrendingUp} color="blue" />
            <KpiCard title="Dead Stock Items" value={deadStock.length} subtitle="No movement 90+ days" icon={TrendingDown} color="red" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock value by warehouse */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Stock Value by Warehouse</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stockValueData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {stockValueData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory value trend */}
            <div className="card p-5">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Inventory Value Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke="#14b892" strokeWidth={2} dot={{ fill: '#14b892', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top moving products */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">Top Moving Products</h3>
              <button className="btn-ghost text-xs"><Download className="w-3 h-3" /> Export</button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topMoving} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={160} />
                <Tooltip />
                <Bar dataKey="movements" fill="#14b892" name="Total Movements" radius={[0, 4, 4, 0]}>
                  {topMoving.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dead stock */}
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Dead Stock Report <span className="text-sm font-normal text-slate-400">(No movement 90+ days)</span></h3>
            <DataTable columns={deadStockColumns} data={deadStock} emptyMessage="No dead stock found" />
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Monthly Stock Movement Summary</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockDashboard.monthlyMovements}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="stockIn" name="Stock In" fill="#14b892" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stockOut" name="Stock Out" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'procurement' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Purchase Order Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={poSummaryData} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="status" label>
                    {poSummaryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {poSummaryData.map((item, i) => (
                  <div key={item.status} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.count} POs</p>
                      <p className="text-xs text-slate-400">₹{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
