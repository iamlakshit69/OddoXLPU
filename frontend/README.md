# StockSense ERP — Frontend Architecture

Industrial, high-contrast Warehouse & Supply Chain ERP frontend built with React, Vite, Tailwind CSS, Lucide Icons, and Axios.

## 🎨 Visual Identity & Design System
- **Background Canvas:** Industrial Off-White (`#F5F5F3`)
- **Primary Brand & Navigation Header:** Deep Odoo Dark Purple (`#5B3A52` / `#714B67`)
- **Vibrant Action Accent:** Electric Safety Orange (`#FF5500`)
- **Typography:** Swiss / Editorial typography with oversized metric numerals and JetBrains Mono technical badges.
- **Workflow Pipeline:** Indexed numeric progress indicators (`01 Draft` ➔ `02 Picked` ➔ `03 Packed` ➔ `04 Validated`).

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## ⚡ Key Features & Pages
1. **Executive Dashboard (`/dashboard`):** Swiss oversized key metric cards (`72%`, `12 Pending`, `05 Low Stock`), rapid action dispatch tiles, critical low-stock alerts table with 1-click PO generator, and live stock movement ledger feed.
2. **Product Catalog (`/products`):** Full SKU management, Kanban Card / Data Table view toggle, location stock breakdown, category creator, and reorder alerts.
3. **Receipts (`/receipts`, `/receipts/:id`):** Inbound supplier intake, dynamic product line items, and 1-click stock increment validation.
4. **Deliveries (`/deliveries`, `/deliveries/:id`):** Outbound customer orders with 4-stage numeric workflow (`01 Draft` ➔ `02 Picked` ➔ `03 Packed` ➔ `04 Validated`), stock availability checks, and auto-decremented inventory.
5. **Internal Transfers (`/transfers`, `/transfers/:id`):** Inter-warehouse and aisle-to-rack stock relocation with automated `TRANSFER_OUT` and `TRANSFER_IN` ledgers.
6. **Physical Adjustments (`/adjustments`, `/adjustments/:id`):** Cycle count and variance calculator with automatic system vs. physical count reconciliation.
7. **Warehouses & Locations (`/warehouses`):** Multi-warehouse facilities, aisles, and rack location manager.
8. **Stock Ledger (`/ledger`):** Complete immutable audit trail with transaction types, delta balances, timestamps, and operator attribution.
9. **Authentication (`/auth/login`, `/auth/register`, `/auth/forgot-password`):** JWT Bearer token authentication with instant demo role switcher (Admin / Manager / Staff).
