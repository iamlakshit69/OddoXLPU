# StockSense Backend — Foundation (Phase 1)

Covers: repo/folder structure, backend server, DB schema (Users, Products,
Categories, Warehouses, StockLocations, Stock, StockLedger), Auth APIs, and
core Product APIs.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your MySQL credentials

# Create the database first (MySQL shell):
# CREATE DATABASE stocksense;

npm run db:sync   # creates/updates all tables
npm run dev        # starts the API on http://localhost:4000
```

## Folder structure

```
stocksense-backend/
├── server.js                 # entry point
├── src/
│   ├── app.js                 # express app + middleware wiring
│   ├── config/
│   │   └── database.js        # Sequelize connection
│   ├── models/                # one file per table + index.js for associations
│   ├── controllers/           # request handling logic, one per module
│   ├── routes/                # route definitions, one per module
│   ├── middleware/             # auth guard, error handler
│   └── utils/                  # token/OTP helpers, db sync script
```

Each future module (Receipts, Deliveries, Transfers, Adjustments) should
follow the exact same pattern: a model, a controller, a routes file, wired
into `src/routes/index.js`. Don't reach into another module's controller
directly — go through the shared models or a `services/` file if logic needs
to be shared (e.g. the stock-mutation logic that Receipts/Deliveries/
Transfers/Adjustments will all call).

## API quick reference

### Auth
- `POST /api/auth/signup` — { name, email, password, role? }
- `POST /api/auth/login` — { email, password } → { token, user }
- `POST /api/auth/forgot-password` — { email } → OTP logged to console (swap in real email later)
- `POST /api/auth/reset-password` — { email, otp, newPassword }
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`

### Products
- `GET /api/products?search=&category=&warehouse=&lowStock=true`
- `GET /api/products/:id`
- `POST /api/products` — MANAGER/ADMIN only — { name, sku, categoryId?, uom?, reorderLevel?, reorderQty? }
- `PUT /api/products/:id` — MANAGER/ADMIN only
- `GET /api/products/categories`
- `POST /api/products/categories` — MANAGER/ADMIN only — { name }

All responses are shaped `{ success: true, data }` or `{ success: false, error }`.

## Next up (not in this scope)

- Receipts / Delivery Orders / Transfers / Adjustments modules — each needs a
  `stock.service.js` that wraps the "update Stock + insert StockLedger row"
  logic in a single Sequelize transaction, since every one of those modules
  calls the same pattern.
- Dashboard KPIs — pure read queries against `stock_ledger` + `stock` once
  the above modules exist.
- Warehouse CRUD APIs (the Warehouse/StockLocation models already exist here,
  just need routes).
