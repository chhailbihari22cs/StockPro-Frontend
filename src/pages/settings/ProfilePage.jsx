import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext.jsx'
import { toast } from 'sonner'
import { User, Lock, Mail, Phone, Building2, Save, Loader2 } from 'lucide-react'
import { authService } from '../../services/apiServices.js'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const profileForm = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: '',
      department: '',
    }
  })

  const passwordForm = useForm()

  const handleProfileSave = async (data) => {
    setSaving(true)
    try {
      await updateProfile(data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed!')
      passwordForm.reset()
    } catch {
      toast.error('Failed to change password. Check current password.')
    } finally {
      setSaving(false)
    }
  }

  const ROLE_LABELS = { ADMIN: 'Administrator', MANAGER: 'Inventory Manager', OFFICER: 'Purchase Officer', STAFF: 'Warehouse Staff' }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and security</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user?.fullName?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.fullName}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="inline-flex mt-1.5 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400">
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'profile', label: 'Profile Info', icon: User },
          { key: 'security', label: 'Security', icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-5">Personal Information</h3>
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...profileForm.register('fullName', { required: true })} className="input pl-9" placeholder="Your full name" />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...profileForm.register('email')} type="email" className="input pl-9" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...profileForm.register('phone')} className="input pl-9" placeholder="+91-XXXXXXXXXX" />
              </div>
            </div>
            <div>
              <label className="label">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...profileForm.register('department')} className="input pl-9" placeholder="Your department" />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-5">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input {...passwordForm.register('currentPassword', { required: true })} type="password" className="input" placeholder="••••••••" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...passwordForm.register('newPassword', { required: true, minLength: 8 })} type="password" className="input" placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input {...passwordForm.register('confirmPassword', { required: true })} type="password" className="input" placeholder="Repeat new password" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Lock className="w-4 h-4" />
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
