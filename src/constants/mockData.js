export const mockProducts = [
  { productId: 1, name: 'Industrial Drill Bit Set', sku: 'SKU-001', category: 'Tools', brand: 'DeWalt', unitOfMeasure: 'Set', costPrice: 45.99, sellingPrice: 89.99, reorderLevel: 10, maxStockLevel: 100, leadTimeDays: 5, isActive: true, barcode: '123456789012' },
  { productId: 2, name: 'Safety Helmet Type-A', sku: 'SKU-002', category: 'Safety', brand: '3M', unitOfMeasure: 'Piece', costPrice: 12.50, sellingPrice: 24.99, reorderLevel: 20, maxStockLevel: 200, leadTimeDays: 3, isActive: true, barcode: '123456789013' },
  { productId: 3, name: 'Steel Bolt M12x50', sku: 'SKU-003', category: 'Fasteners', brand: 'Generic', unitOfMeasure: 'Box', costPrice: 8.99, sellingPrice: 15.99, reorderLevel: 50, maxStockLevel: 500, leadTimeDays: 7, isActive: true, barcode: '123456789014' },
  { productId: 4, name: 'Hydraulic Fluid 5L', sku: 'SKU-004', category: 'Fluids', brand: 'Mobil', unitOfMeasure: 'Can', costPrice: 32.00, sellingPrice: 59.99, reorderLevel: 15, maxStockLevel: 80, leadTimeDays: 4, isActive: true, barcode: '123456789015' },
  { productId: 5, name: 'Welding Rod E6013', sku: 'SKU-005', category: 'Welding', brand: 'Lincoln', unitOfMeasure: 'Kg', costPrice: 18.75, sellingPrice: 34.99, reorderLevel: 25, maxStockLevel: 150, leadTimeDays: 6, isActive: false, barcode: '123456789016' },
]

export const mockWarehouses = [
  { warehouseId: 1, name: 'Main Warehouse', location: 'Delhi', address: '123 Industrial Area, Delhi', capacity: 5000, usedCapacity: 3200, isActive: true, phone: '+91-9876543210', managerId: 2 },
  { warehouseId: 2, name: 'North Depot', location: 'Noida', address: '456 Sector 62, Noida', capacity: 2000, usedCapacity: 890, isActive: true, phone: '+91-9876543211', managerId: 3 },
  { warehouseId: 3, name: 'South Hub', location: 'Gurugram', address: '789 DLF Phase 2, Gurugram', capacity: 3000, usedCapacity: 2100, isActive: true, phone: '+91-9876543212', managerId: 4 },
]

export const mockStockLevels = [
  { stockId: 1, warehouseId: 1, productId: 1, quantity: 45, reservedQuantity: 5, lastUpdated: '2026-05-01' },
  { stockId: 2, warehouseId: 1, productId: 2, quantity: 8, reservedQuantity: 0, lastUpdated: '2026-05-02' },
  { stockId: 3, warehouseId: 2, productId: 3, quantity: 280, reservedQuantity: 30, lastUpdated: '2026-05-01' },
  { stockId: 4, warehouseId: 2, productId: 4, quantity: 22, reservedQuantity: 5, lastUpdated: '2026-05-03' },
  { stockId: 5, warehouseId: 3, productId: 5, quantity: 3, reservedQuantity: 0, lastUpdated: '2026-04-28' },
]

export const mockPurchaseOrders = [
  { poId: 1, supplierId: 1, warehouseId: 1, createdById: 3, status: 'APPROVED', totalAmount: 4599.00, orderDate: '2026-04-25', expectedDate: '2026-05-05', referenceNumber: 'PO-2026-001', notes: 'Urgent order' },
  { poId: 2, supplierId: 2, warehouseId: 2, createdById: 3, status: 'PENDING', totalAmount: 1250.00, orderDate: '2026-05-01', expectedDate: '2026-05-10', referenceNumber: 'PO-2026-002', notes: '' },
  { poId: 3, supplierId: 3, warehouseId: 1, createdById: 3, status: 'RECEIVED', totalAmount: 899.00, orderDate: '2026-04-15', expectedDate: '2026-04-22', receivedDate: '2026-04-21', referenceNumber: 'PO-2026-003', notes: 'Partially received' },
  { poId: 4, supplierId: 1, warehouseId: 3, createdById: 3, status: 'DRAFT', totalAmount: 3200.00, orderDate: '2026-05-04', expectedDate: '2026-05-15', referenceNumber: 'PO-2026-004', notes: '' },
  { poId: 5, supplierId: 2, warehouseId: 2, createdById: 3, status: 'CANCELLED', totalAmount: 2100.00, orderDate: '2026-04-10', expectedDate: '2026-04-20', referenceNumber: 'PO-2026-005', notes: 'Cancelled - supplier unavailable' },
]

export const mockSuppliers = [
  { supplierId: 1, name: 'Apex Industrial Supplies', contactPerson: 'Rajesh Kumar', email: 'rajesh@apex.com', phone: '+91-9876543200', city: 'Mumbai', country: 'India', paymentTerms: 'NET-30', leadTimeDays: 5, rating: 4.5, isActive: true },
  { supplierId: 2, name: 'SafeGuard Equipment Ltd', contactPerson: 'Priya Sharma', email: 'priya@safeguard.com', phone: '+91-9876543201', city: 'Pune', country: 'India', paymentTerms: 'NET-60', leadTimeDays: 3, rating: 4.2, isActive: true },
  { supplierId: 3, name: 'FastFix Components', contactPerson: 'Amit Singh', email: 'amit@fastfix.com', phone: '+91-9876543202', city: 'Delhi', country: 'India', paymentTerms: 'NET-15', leadTimeDays: 7, rating: 3.8, isActive: true },
  { supplierId: 4, name: 'Global Welding Solutions', contactPerson: 'Mohammed Ali', email: 'ali@gws.com', phone: '+91-9876543203', city: 'Chennai', country: 'India', paymentTerms: 'NET-45', leadTimeDays: 10, rating: 4.7, isActive: false },
]

export const mockMovements = [
  { movementId: 1, productId: 1, warehouseId: 1, movementType: 'STOCK_IN', quantity: 50, referenceId: 1, referenceType: 'PO', unitCost: 45.99, performedBy: 2, notes: 'GRN against PO-2026-001', movementDate: '2026-05-01T10:30:00', balanceAfter: 50 },
  { movementId: 2, productId: 2, warehouseId: 1, movementType: 'STOCK_OUT', quantity: 12, referenceId: null, referenceType: 'ISSUE', unitCost: 12.50, performedBy: 2, notes: 'Issued to production line', movementDate: '2026-05-02T14:15:00', balanceAfter: 8 },
  { movementId: 3, productId: 3, warehouseId: 2, movementType: 'TRANSFER_IN', quantity: 100, referenceId: null, referenceType: 'TRANSFER', unitCost: 8.99, performedBy: 2, notes: 'Transfer from Main Warehouse', movementDate: '2026-05-03T09:00:00', balanceAfter: 280 },
  { movementId: 4, productId: 4, warehouseId: 2, movementType: 'ADJUSTMENT', quantity: -3, referenceId: null, referenceType: 'ADJUSTMENT', unitCost: 32.00, performedBy: 2, notes: 'Cycle count correction', movementDate: '2026-05-04T11:00:00', balanceAfter: 22 },
  { movementId: 5, productId: 5, warehouseId: 3, movementType: 'WRITE_OFF', quantity: 10, referenceId: null, referenceType: 'WRITE_OFF', unitCost: 18.75, performedBy: 2, notes: 'Damaged goods write-off', movementDate: '2026-04-28T16:30:00', balanceAfter: 3 },
]

export const mockAlerts = [
  { alertId: 1, recipientId: 2, type: 'LOW_STOCK', severity: 'CRITICAL', title: 'Low Stock Alert', message: 'Safety Helmet Type-A is below reorder level (8 units, reorder at 20)', relatedProductId: 2, relatedWarehouseId: 1, isRead: false, isAcknowledged: false, createdAt: '2026-05-02T08:00:00' },
  { alertId: 2, recipientId: 2, type: 'PO_PENDING', severity: 'WARNING', title: 'PO Approval Required', message: 'Purchase Order PO-2026-002 requires your approval', relatedProductId: null, relatedWarehouseId: null, isRead: false, isAcknowledged: false, createdAt: '2026-05-01T14:30:00' },
  { alertId: 3, recipientId: 2, type: 'LOW_STOCK', severity: 'CRITICAL', title: 'Low Stock Alert', message: 'Welding Rod E6013 is critically low (3 units, reorder at 25)', relatedProductId: 5, relatedWarehouseId: 3, isRead: true, isAcknowledged: false, createdAt: '2026-04-30T10:00:00' },
  { alertId: 4, recipientId: 2, type: 'OVERDUE_RECEIPT', severity: 'WARNING', title: 'Overdue PO Receipt', message: 'PO-2026-001 expected delivery date has passed without GRN', relatedProductId: null, relatedWarehouseId: null, isRead: true, isAcknowledged: true, createdAt: '2026-05-06T09:00:00' },
  { alertId: 5, recipientId: 2, type: 'SYSTEM', severity: 'INFO', title: 'Daily Snapshot Complete', message: 'Inventory snapshot for 2026-05-05 has been generated', relatedProductId: null, relatedWarehouseId: null, isRead: false, isAcknowledged: false, createdAt: '2026-05-05T00:05:00' },
]

export const mockUsers = [
  { userId: 1, fullName: 'Admin User', email: 'admin@stockpro.com', role: 'ADMIN', department: 'Management', isActive: true, createdAt: '2026-01-01' },
  { userId: 2, fullName: 'Inventory Manager', email: 'manager@stockpro.com', role: 'MANAGER', department: 'Inventory', isActive: true, createdAt: '2026-01-15' },
  { userId: 3, fullName: 'Purchase Officer', email: 'purchase@stockpro.com', role: 'OFFICER', department: 'Procurement', isActive: true, createdAt: '2026-02-01' },
  { userId: 4, fullName: 'Warehouse Staff 1', email: 'staff1@stockpro.com', role: 'STAFF', department: 'Warehouse', isActive: true, createdAt: '2026-02-15' },
  { userId: 5, fullName: 'Warehouse Staff 2', email: 'staff2@stockpro.com', role: 'STAFF', department: 'Warehouse', isActive: false, createdAt: '2026-03-01' },
]

export const mockDashboard = {
  totalProducts: 142,
  totalWarehouses: 3,
  totalStockValue: 284590.50,
  pendingPOs: 8,
  lowStockCount: 12,
  unreadAlerts: 5,
  warehouseUtilization: 72,
  inventoryTurnover: 4.2,
  monthlyMovements: [
    { month: 'Nov', stockIn: 320, stockOut: 280 },
    { month: 'Dec', stockIn: 450, stockOut: 390 },
    { month: 'Jan', stockIn: 380, stockOut: 310 },
    { month: 'Feb', stockIn: 420, stockOut: 360 },
    { month: 'Mar', stockIn: 510, stockOut: 440 },
    { month: 'Apr', stockIn: 490, stockOut: 420 },
    { month: 'May', stockIn: 180, stockOut: 160 },
  ],
  topProducts: [
    { name: 'Steel Bolt M12x50', movements: 380 },
    { name: 'Safety Helmet', movements: 290 },
    { name: 'Drill Bit Set', movements: 245 },
    { name: 'Hydraulic Fluid', movements: 210 },
    { name: 'Welding Rod', movements: 185 },
  ],
  warehouseStats: [
    { name: 'Main Warehouse', utilization: 64 },
    { name: 'North Depot', utilization: 45 },
    { name: 'South Hub', utilization: 70 },
  ],
  stockValueByWarehouse: [
    { name: 'Main Warehouse', value: 142890 },
    { name: 'North Depot', value: 68450 },
    { name: 'South Hub', value: 73250 },
  ],
}
