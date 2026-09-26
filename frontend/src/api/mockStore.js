// Realistic simulated backend store for immediate offline preview & reliable local testing
const STORAGE_KEY = 'stocksense_erp_data_v1';

const INITIAL_DATA = {
  warehouses: [
    {
      id: 1,
      name: "Main Distribution Center (WH-NORTH)",
      code: "WH-N",
      address: "Sector 62, Industrial Area, Noida",
      isActive: true,
      StockLocations: [
        { id: 1, name: "Aisle A1 - Bulk Storage", code: "WH-N/A1-BULK", warehouseId: 1 },
        { id: 2, name: "Aisle B2 - Pick & Pack", code: "WH-N/B2-PACK", warehouseId: 1 },
        { id: 3, name: "Aisle C3 - High Value Cage", code: "WH-N/C3-CAGE", warehouseId: 1 },
      ],
    },
    {
      id: 2,
      name: "South Fulfillment Hub (WH-SOUTH)",
      code: "WH-S",
      address: "Electronic City Phase 1, Bengaluru",
      isActive: true,
      StockLocations: [
        { id: 4, name: "Rack 01 - Heavy Cargo", code: "WH-S/R01-HVY", warehouseId: 2 },
        { id: 5, name: "Rack 02 - Fast Moving", code: "WH-S/R02-FMCG", warehouseId: 2 },
      ],
    },
  ],
  categories: [
    { id: 1, name: "Industrial Electronics" },
    { id: 2, name: "Precision Hardware & Fasteners" },
    { id: 3, name: "Hydraulics & Pneumatics" },
    { id: 4, name: "Packaging & Safety Gear" },
  ],
  products: [
    {
      id: 1,
      name: "Precision CNC Milling Bit (8mm Tungsten)",
      sku: "SKU-CNC-08",
      categoryId: 2,
      uom: "PCS",
      reorderLevel: 25,
      reorderQty: 100,
      isActive: true,
      Category: { id: 2, name: "Precision Hardware & Fasteners" },
      Stocks: [
        { id: 1, productId: 1, locationId: 1, quantity: 45, StockLocation: { id: 1, name: "Aisle A1 - Bulk Storage", Warehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" } } },
        { id: 2, productId: 1, locationId: 4, quantity: 30, StockLocation: { id: 4, name: "Rack 01 - Heavy Cargo", Warehouse: { id: 2, name: "South Fulfillment Hub", code: "WH-S" } } },
      ],
      totalStock: 75,
      stockStatus: "IN_STOCK",
    },
    {
      id: 2,
      name: "Industrial Brushless Servo Motor 750W",
      sku: "SKU-SRV-750",
      categoryId: 1,
      uom: "PCS",
      reorderLevel: 15,
      reorderQty: 40,
      isActive: true,
      Category: { id: 1, name: "Industrial Electronics" },
      Stocks: [
        { id: 3, productId: 2, locationId: 3, quantity: 8, StockLocation: { id: 3, name: "Aisle C3 - High Value Cage", Warehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" } } },
      ],
      totalStock: 8,
      stockStatus: "LOW_STOCK",
    },
    {
      id: 3,
      name: "High-Pressure Hydraulic Hose (20 Bar, 50m)",
      sku: "SKU-HYD-50M",
      categoryId: 3,
      uom: "MTR",
      reorderLevel: 50,
      reorderQty: 150,
      isActive: true,
      Category: { id: 3, name: "Hydraulics & Pneumatics" },
      Stocks: [
        { id: 4, productId: 3, locationId: 1, quantity: 120, StockLocation: { id: 1, name: "Aisle A1 - Bulk Storage", Warehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" } } },
      ],
      totalStock: 120,
      stockStatus: "IN_STOCK",
    },
    {
      id: 4,
      name: "Nitrile Chemical Resistant Gloves (Pack of 100)",
      sku: "SKU-GLV-NIT",
      categoryId: 4,
      uom: "BOX",
      reorderLevel: 20,
      reorderQty: 60,
      isActive: true,
      Category: { id: 4, name: "Packaging & Safety Gear" },
      Stocks: [
        { id: 5, productId: 4, locationId: 2, quantity: 0, StockLocation: { id: 2, name: "Aisle B2 - Pick & Pack", Warehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" } } },
      ],
      totalStock: 0,
      stockStatus: "OUT_OF_STOCK",
    },
    {
      id: 5,
      name: "Opto-Isolated PLC Relay Module 24V",
      sku: "SKU-PLC-24V",
      categoryId: 1,
      uom: "PCS",
      reorderLevel: 10,
      reorderQty: 50,
      isActive: true,
      Category: { id: 1, name: "Industrial Electronics" },
      Stocks: [
        { id: 6, productId: 5, locationId: 3, quantity: 4, StockLocation: { id: 3, name: "Aisle C3 - High Value Cage", Warehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" } } },
      ],
      totalStock: 4,
      stockStatus: "LOW_STOCK",
    },
  ],
  receipts: [
    {
      id: 1,
      supplier: "Apex Robotics Ltd",
      warehouseId: 1,
      locationId: 1,
      status: "DRAFT",
      notes: "Urgent PO #9021 batch delivery",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      Warehouse: { id: 1, name: "Main Distribution Center (WH-NORTH)", code: "WH-N" },
      StockLocation: { id: 1, name: "Aisle A1 - Bulk Storage", code: "WH-N/A1-BULK" },
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 50,
          uom: "PCS",
          Product: { id: 1, name: "Precision CNC Milling Bit (8mm Tungsten)", sku: "SKU-CNC-08", uom: "PCS" },
        },
        {
          id: 2,
          productId: 2,
          quantity: 20,
          uom: "PCS",
          Product: { id: 2, name: "Industrial Brushless Servo Motor 750W", sku: "SKU-SRV-750", uom: "PCS" },
        },
      ],
    },
    {
      id: 2,
      supplier: "Global Pneumatics Inc",
      warehouseId: 1,
      locationId: 1,
      status: "VALIDATED",
      notes: "Stock validated on arrival inspection",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      Warehouse: { id: 1, name: "Main Distribution Center (WH-NORTH)", code: "WH-N" },
      StockLocation: { id: 1, name: "Aisle A1 - Bulk Storage", code: "WH-N/A1-BULK" },
      items: [
        {
          id: 3,
          productId: 3,
          quantity: 60,
          uom: "MTR",
          Product: { id: 3, name: "High-Pressure Hydraulic Hose (20 Bar, 50m)", sku: "SKU-HYD-50M", uom: "MTR" },
        },
      ],
    },
  ],
  deliveries: [
    {
      id: 1,
      customer: "Tesla Gigafactory Assembly Line",
      warehouseId: 1,
      locationId: 1,
      status: "PICKED",
      notes: "Dispatch via Express Freight by 5 PM",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      Warehouse: { id: 1, name: "Main Distribution Center (WH-NORTH)", code: "WH-N" },
      StockLocation: { id: 1, name: "Aisle A1 - Bulk Storage", code: "WH-N/A1-BULK" },
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 15,
          uom: "PCS",
          Product: { id: 1, name: "Precision CNC Milling Bit (8mm Tungsten)", sku: "SKU-CNC-08", uom: "PCS" },
        },
      ],
    },
    {
      id: 2,
      customer: "L&T Heavy Engineering",
      warehouseId: 1,
      locationId: 3,
      status: "DRAFT",
      notes: "Quarterly automation maintenance kits",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      Warehouse: { id: 1, name: "Main Distribution Center (WH-NORTH)", code: "WH-N" },
      StockLocation: { id: 3, name: "Aisle C3 - High Value Cage", code: "WH-N/C3-CAGE" },
      items: [
        {
          id: 2,
          productId: 2,
          quantity: 3,
          uom: "PCS",
          Product: { id: 2, name: "Industrial Brushless Servo Motor 750W", sku: "SKU-SRV-750", uom: "PCS" },
        },
      ],
    },
  ],
  transfers: [
    {
      id: 1,
      sourceWarehouseId: 1,
      sourceLocationId: 1,
      destinationWarehouseId: 2,
      destinationLocationId: 4,
      status: "DRAFT",
      notes: "Inter-warehouse stock rebalancing",
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      sourceWarehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" },
      sourceLocation: { id: 1, name: "Aisle A1 - Bulk Storage", code: "WH-N/A1-BULK" },
      destinationWarehouse: { id: 2, name: "South Fulfillment Hub", code: "WH-S" },
      destinationLocation: { id: 4, name: "Rack 01 - Heavy Cargo", code: "WH-S/R01-HVY" },
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 10,
          uom: "PCS",
          Product: { id: 1, name: "Precision CNC Milling Bit (8mm Tungsten)", sku: "SKU-CNC-08", uom: "PCS" },
        },
      ],
    },
  ],
  adjustments: [
    {
      id: 1,
      warehouseId: 1,
      locationId: 2,
      status: "DRAFT",
      notes: "Monthly physical audit variance reconciliation",
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      Warehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" },
      StockLocation: { id: 2, name: "Aisle B2 - Pick & Pack", code: "WH-N/B2-PACK" },
      items: [
        {
          id: 1,
          productId: 4,
          recordedQuantity: 0,
          physicalQuantity: 12,
          quantityChange: 12,
          uom: "BOX",
          Product: { id: 4, name: "Nitrile Chemical Resistant Gloves (Pack of 100)", sku: "SKU-GLV-NIT", uom: "BOX" },
        },
      ],
    },
  ],
  ledgers: [
    {
      id: 1,
      transactionType: "RECEIPT",
      quantityChange: 60,
      resultingQuantity: 120,
      referenceType: "RECEIPT",
      referenceId: 2,
      notes: "Initial purchase receipt",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      Product: { id: 3, name: "High-Pressure Hydraulic Hose (20 Bar, 50m)", sku: "SKU-HYD-50M", uom: "MTR" },
      Warehouse: { id: 1, name: "Main Distribution Center", code: "WH-N" },
      StockLocation: { id: 1, name: "Aisle A1 - Bulk Storage", code: "WH-N/A1-BULK" },
      creator: { id: 1, name: "Lead Operations Manager" },
    },
  ],
  users: [
    { id: 1, name: "Principal Warehouse Architect", email: "admin@stocksense.io", role: "ADMIN" },
    { id: 2, name: "Shift Supervisor", email: "manager@stocksense.io", role: "MANAGER" },
  ],
};

export function getMockDB() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  return JSON.parse(data);
}

export function saveMockDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
