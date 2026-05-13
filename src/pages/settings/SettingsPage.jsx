import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { toast } from 'sonner'
import { Moon, Sun, Bell, Shield, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({ email: true, inApp: true, lowStock: true, poAlerts: true })
  const [reorderBuffer, setReorderBuffer] = useState(10)
  const [deadStockDays, setDeadStockDays] = useState(90)

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your StockPro preferences</p>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <Sun className="w-4 h-4 text-slate-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Appearance</h3>
            <p className="text-xs text-slate-400">Choose your preferred theme</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${theme === 'light' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
          >
            <Sun className="w-4 h-4 mx-auto mb-1" />
            Light Mode
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${theme === 'dark' ? 'border-brand-500 bg-brand-50/10 text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
          >
            <Moon className="w-4 h-4 mx-auto mb-1" />
            Dark Mode
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
            <p className="text-xs text-slate-400">Control how you receive alerts</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email for CRITICAL events' },
            { key: 'inApp', label: 'In-App Notifications', desc: 'Show notification badge in the app' },
            { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Get notified when stock drops below reorder level' },
            { key: 'poAlerts', label: 'Purchase Order Alerts', desc: 'PO approval and overdue receipt notifications' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.key] ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System configuration (Admin only) */}
      {user?.role === 'ADMIN' && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">System Configuration</h3>
              <p className="text-xs text-slate-400">Global reorder rules and thresholds</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Reorder Buffer (%)</label>
              <p className="text-xs text-slate-400 mb-2">Additional buffer above reorder level for safety stock</p>
              <input
                type="number"
                value={reorderBuffer}
                onChange={e => setReorderBuffer(Number(e.target.value))}
                className="input"
                min={0} max={100}
              />
            </div>
            <div>
              <label className="label">Dead Stock Threshold (days)</label>
              <p className="text-xs text-slate-400 mb-2">Products with no movement beyond this period are flagged as dead stock</p>
              <input
                type="number"
                value={deadStockDays}
                onChange={e => setDeadStockDays(Number(e.target.value))}
                className="input"
                min={30}
              />
            </div>
          </div>
        </div>
      )}

      {/* API Configuration */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Globe className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">API Configuration</h3>
            <p className="text-xs text-slate-400">Backend connection settings</p>
          </div>
        </div>
        <div>
          <label className="label">API Base URL</label>
          <input
            type="text"
            defaultValue={import.meta.env.VITE_API_BASE_URL}
            className="input font-mono text-sm"
            readOnly
          />
          <p className="text-xs text-slate-400 mt-1">Configure via .env file (VITE_API_BASE_URL)</p>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary">
        <Save className="w-4 h-4" /> Save Settings
      </button>
    </div>
  )
}
