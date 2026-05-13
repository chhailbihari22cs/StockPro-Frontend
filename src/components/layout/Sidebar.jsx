import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  LayoutDashboard, Package, Warehouse, BarChart3, ShoppingCart,
  Truck, ArrowLeftRight, Bell, FileText, Users, Settings, X, TrendingUp
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'OFFICER', 'STAFF'] },
  { to: '/products', icon: Package, label: 'Products', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/warehouses', icon: Warehouse, label: 'Warehouses', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/inventory', icon: BarChart3, label: 'Inventory', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders', roles: ['ADMIN', 'MANAGER', 'OFFICER'] },
  { to: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['ADMIN', 'MANAGER', 'OFFICER'] },
  { to: '/movements', icon: ArrowLeftRight, label: 'Stock Movements', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/alerts', icon: Bell, label: 'Alerts', roles: ['ADMIN', 'MANAGER', 'OFFICER', 'STAFF'] },
  { to: '/reports', icon: TrendingUp, label: 'Reports', roles: ['ADMIN', 'MANAGER'] },
  { to: '/users', icon: Users, label: 'User Management', roles: ['ADMIN'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['ADMIN', 'MANAGER', 'OFFICER', 'STAFF'] },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const location = useLocation()

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out',
        'lg:relative lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">StockPro</span>
        </div>
        <button onClick={onClose} className="lg:hidden btn-ghost p-1.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <div className="px-3 py-2 rounded-lg bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50">
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">Logged in as</p>
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-300 truncate">{user?.fullName}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-600 text-white font-medium">{user?.role}</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx('sidebar-item', isActive && 'active')
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <NavLink to="/profile" className={({ isActive }) => clsx('sidebar-item', isActive && 'active')}>
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
