import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import MainLayout from './components/layout/MainLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import RoleRoute from './routes/RoleRoute.jsx'

// Auth pages
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'

// Main pages
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import ProductsPage from './pages/products/ProductsPage.jsx'
import WarehousesPage from './pages/warehouses/WarehousesPage.jsx'
import InventoryPage from './pages/inventory/InventoryPage.jsx'
import PurchaseOrdersPage from './pages/purchase-orders/PurchaseOrdersPage.jsx'
import SuppliersPage from './pages/suppliers/SuppliersPage.jsx'
import MovementsPage from './pages/movements/MovementsPage.jsx'
import AlertsPage from './pages/alerts/AlertsPage.jsx'
import ReportsPage from './pages/reports/ReportsPage.jsx'
import UsersPage from './pages/users/UsersPage.jsx'
import SettingsPage from './pages/settings/SettingsPage.jsx'
import ProfilePage from './pages/settings/ProfilePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin only */}
          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
