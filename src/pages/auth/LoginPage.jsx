import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext.jsx'
import { toast } from 'sonner'
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
    } catch (e) {
      const msg = e.response?.data?.message || 'Invalid credentials'
      toast.error(msg)
      // Demo: allow any login in development
      if (!e.response) {
        // Network error - simulate login
        toast.info('Demo mode: Logging in with mock data')
        await login(data.email, data.password).catch(() => {
          // Mock login for demo
          localStorage.setItem('stockpro_token', 'demo.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBzdG9ja3Byby5jb20iLCJmdWxsTmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiQURNSU4iLCJleHAiOjk5OTk5OTk5OTl9.demo')
          window.location.href = '/dashboard'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Demo quick login
  const demoLogin = async (role) => {
    const demos = {
      ADMIN: { email: 'admin@stockpro.com', password: 'admin123' },
      MANAGER: { email: 'manager@stockpro.com', password: 'manager123' },
      OFFICER: { email: 'purchase@stockpro.com', password: 'officer123' },
      STAFF: { email: 'staff1@stockpro.com', password: 'staff123' },
    }
    setLoading(true)
    try {
      await login(demos[role].email, demos[role].password)
    } catch {
      // Mock token for demo
      const rolePayloads = {
        ADMIN: btoa(JSON.stringify({ sub: '1', email: demos[role].email, fullName: 'Admin User', role: 'ADMIN', exp: 9999999999 })),
        MANAGER: btoa(JSON.stringify({ sub: '2', email: demos[role].email, fullName: 'Inventory Manager', role: 'MANAGER', exp: 9999999999 })),
        OFFICER: btoa(JSON.stringify({ sub: '3', email: demos[role].email, fullName: 'Purchase Officer', role: 'OFFICER', exp: 9999999999 })),
        STAFF: btoa(JSON.stringify({ sub: '4', email: demos[role].email, fullName: 'Warehouse Staff', role: 'STAFF', exp: 9999999999 })),
      }
      const token = `demo.${rolePayloads[role]}.demo`
      localStorage.setItem('stockpro_token', token)
      window.location.href = '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">StockPro</h1>
          <p className="text-slate-400 mt-1 text-sm">Track. Control. Optimise. Grow.</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@stockpro.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign In
            </button>
          </form>

          {/* Demo logins */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 text-center mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {['ADMIN', 'MANAGER', 'OFFICER', 'STAFF'].map(role => (
                <button
                  key={role}
                  onClick={() => demoLogin(role)}
                  disabled={loading}
                  className="py-2 px-3 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:underline font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
