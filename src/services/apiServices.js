import axiosInstance from '../api/axiosInstance.js'
import * as mock from '../constants/mockData.js'

const useMock = (error) => !error.response // network error = use mock

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  logout: () => axiosInstance.post('/auth/logout'),
  getProfile: () => axiosInstance.get('/auth/profile'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  changePassword: (data) => axiosInstance.put('/auth/password', data),
}

// ─── Products ────────────────────────────────────────────────────────────────
export const productService = {
  getAll: async (params) => {
    try {
      const res = await axiosInstance.get('/products', { params })
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockProducts
      throw e
    }
  },
  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`/products/${id}`)
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockProducts.find(p => p.productId === id)
      throw e
    }
  },
  create: (data) => axiosInstance.post('/products', data),
  update: (id, data) => axiosInstance.put(`/products/${id}`, data),
  deactivate: (id) => axiosInstance.put(`/products/${id}/deactivate`),
  delete: (id) => axiosInstance.delete(`/products/${id}`),
  search: async (query) => {
    try {
      const res = await axiosInstance.get('/products/search', { params: { q: query } })
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      throw e
    }
  },
  getLowStock: async () => {
    try {
      const res = await axiosInstance.get('/products/low-stock')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockProducts.filter(p => p.productId === 2 || p.productId === 5)
      throw e
    }
  },
}

// ─── Warehouses ──────────────────────────────────────────────────────────────
export const warehouseService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get('/warehouses')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockWarehouses
      throw e
    }
  },
  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`/warehouses/${id}`)
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockWarehouses.find(w => w.warehouseId === id)
      throw e
    }
  },
  create: (data) => axiosInstance.post('/warehouses', data),
  update: (id, data) => axiosInstance.put(`/warehouses/${id}`, data),
  deactivate: (id) => axiosInstance.put(`/warehouses/${id}/deactivate`),
  getStockLevel: async (warehouseId, productId) => {
    try {
      const res = await axiosInstance.get(`/stock/${warehouseId}/${productId}`)
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockStockLevels.find(s => s.warehouseId === warehouseId && s.productId === productId)
      throw e
    }
  },
  getAllStock: async (warehouseId) => {
    try {
      const res = await axiosInstance.get(`/stock/${warehouseId}`)
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockStockLevels.filter(s => !warehouseId || s.warehouseId === warehouseId)
      throw e
    }
  },
  transferStock: (data) => axiosInstance.post('/stock/transfer', data),
  updateStock: (data) => axiosInstance.put('/stock/update', data),
}

// ─── Purchase Orders ─────────────────────────────────────────────────────────
export const purchaseService = {
  getAll: async (params) => {
    try {
      const res = await axiosInstance.get('/purchase-orders', { params })
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockPurchaseOrders
      throw e
    }
  },
  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`/purchase-orders/${id}`)
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockPurchaseOrders.find(p => p.poId === id)
      throw e
    }
  },
  create: (data) => axiosInstance.post('/purchase-orders', data),
  update: (id, data) => axiosInstance.put(`/purchase-orders/${id}`, data),
  approve: (id) => axiosInstance.put(`/purchase-orders/${id}/approve`),
  reject: (id, data) => axiosInstance.put(`/purchase-orders/${id}/reject`, data),
  cancel: (id, data) => axiosInstance.put(`/purchase-orders/${id}/cancel`, data),
  receiveGoods: (id, data) => axiosInstance.post(`/purchase-orders/${id}/receive`, data),
  getByStatus: async (status) => {
    try {
      const res = await axiosInstance.get('/purchase-orders/by-status', { params: { status } })
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockPurchaseOrders.filter(p => p.status === status)
      throw e
    }
  },
}

// ─── Suppliers ───────────────────────────────────────────────────────────────
export const supplierService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get('/suppliers')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockSuppliers
      throw e
    }
  },
  getById: async (id) => {
    try {
      const res = await axiosInstance.get(`/suppliers/${id}`)
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockSuppliers.find(s => s.supplierId === id)
      throw e
    }
  },
  create: (data) => axiosInstance.post('/suppliers', data),
  update: (id, data) => axiosInstance.put(`/suppliers/${id}`, data),
  deactivate: (id) => axiosInstance.put(`/suppliers/${id}/deactivate`),
  delete: (id) => axiosInstance.delete(`/suppliers/${id}`),
  search: async (query) => {
    try {
      const res = await axiosInstance.get('/suppliers/search', { params: { q: query } })
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockSuppliers.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
      throw e
    }
  },
  updateRating: (id, rating) => axiosInstance.put(`/suppliers/${id}/rating`, { rating }),
}

// ─── Movements ───────────────────────────────────────────────────────────────
export const movementService = {
  getAll: async (params) => {
    try {
      const res = await axiosInstance.get('/movements', { params })
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockMovements
      throw e
    }
  },
  getByProduct: async (productId) => {
    try {
      const res = await axiosInstance.get(`/movements/product/${productId}`)
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockMovements.filter(m => m.productId === productId)
      throw e
    }
  },
  record: (data) => axiosInstance.post('/movements', data),
}

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const alertService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get('/alerts')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockAlerts
      throw e
    }
  },
  getUnreadCount: async () => {
    try {
      const res = await axiosInstance.get('/alerts/unread-count')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockAlerts.filter(a => !a.isRead).length
      throw e
    }
  },
  markAsRead: (id) => axiosInstance.put(`/alerts/${id}/read`),
  markAllRead: () => axiosInstance.put('/alerts/read-all'),
  acknowledge: (id) => axiosInstance.put(`/alerts/${id}/acknowledge`),
  delete: (id) => axiosInstance.delete(`/alerts/${id}`),
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportService = {
  getTotalStockValue: async () => {
    try {
      const res = await axiosInstance.get('/reports/total-value')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockDashboard.totalStockValue
      throw e
    }
  },
  getTopMoving: async (limit = 10) => {
    try {
      const res = await axiosInstance.get('/reports/top-moving', { params: { limit } })
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockDashboard.topProducts
      throw e
    }
  },
  getSlowMoving: async () => {
    try {
      const res = await axiosInstance.get('/reports/slow-moving')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockProducts.slice(3)
      throw e
    }
  },
  getDeadStock: async () => {
    try {
      const res = await axiosInstance.get('/reports/dead-stock')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockProducts.filter(p => p.productId === 5)
      throw e
    }
  },
  getPOSummary: async (params) => {
    try {
      const res = await axiosInstance.get('/reports/po-summary', { params })
      return res.data
    } catch (e) {
      if (useMock(e)) return { totalPOs: 5, totalSpend: 12048, byStatus: { RECEIVED: 1, PENDING: 1, APPROVED: 1, DRAFT: 1, CANCELLED: 1 } }
      throw e
    }
  },
  getInventoryTurnover: async () => {
    try {
      const res = await axiosInstance.get('/reports/turnover')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockDashboard.inventoryTurnover
      throw e
    }
  },
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const userService = {
  getAll: async () => {
    try {
      const res = await axiosInstance.get('/auth/users')
      return res.data
    } catch (e) {
      if (useMock(e)) return mock.mockUsers
      throw e
    }
  },
  create: (data) => axiosInstance.post('/auth/register', data),
  update: (id, data) => axiosInstance.put(`/auth/users/${id}`, data),
  deactivate: (id) => axiosInstance.put(`/auth/deactivate`, { userId: id }),
  delete: (id) => axiosInstance.delete(`/auth/users/${id}`),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: async () => {
    try {
      const [products, warehouses, pos, alerts, stockValue] = await Promise.all([
        productService.getAll(),
        warehouseService.getAll(),
        purchaseService.getAll(),
        alertService.getAll(),
        reportService.getTotalStockValue(),
      ])
      return {
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
        totalStockValue: stockValue,
        pendingPOs: pos.filter(p => p.status === 'PENDING').length,
        lowStockCount: 0,
        unreadAlerts: alerts.filter(a => !a.isRead).length,
      }
    } catch (e) {
      return mock.mockDashboard
    }
  },
}
