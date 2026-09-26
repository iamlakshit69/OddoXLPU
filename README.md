# StockSense 📦

### Inventory Management System

StockSense is a centralized inventory management system designed to manage products, warehouses, stock movements, and inventory history from a single platform.

It provides complete inventory workflows for:

- Product & Category Management
- Multi-Warehouse Stock Management
- Stock Receipts
- Delivery Orders
- Internal Stock Transfers
- Stock Adjustments
- Stock Ledger & Movement History
- Authentication & Role-Based Access
- Low-Stock Tracking

The system is built around a centralized **Stock Movement Engine**, ensuring that every stock change is transactional, traceable, and recorded in the Stock Ledger.

---

## 🚀 Key Features

### 🔐 Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- Password hashing
- OTP-based password reset
- Protected routes
- Role-based access control

---

### 📦 Product Management

- Create products
- Update products
- List products
- Search products
- Filter products
- SKU-based identification
- Category management
- Unit of measurement support
- Reorder level configuration
- Reorder quantity configuration
- Active/inactive product status
- Low-stock identification

Supported units:

- PCS
- KG
- LITRE
- BOX
- METRE

---

### 🏢 Warehouse & Location Management

StockSense supports inventory across multiple warehouses and stock locations.

Each stock record is associated with:

```text
Warehouse
    ↓
Stock Location
    ↓
Product
    ↓
Quantity

📥 Stock Receipts

Receipts handle incoming inventory.

Receipt Lifecycle
DRAFT
  ↓
VALIDATED

When a receipt is validated:

Receipt
   ↓
Stock +
   ↓
Stock Ledger

Features:

Supplier information
Warehouse/location selection
Multiple products per receipt
Quantity validation
Duplicate product prevention
Active product validation
Transactional stock update
Automatic ledger entry
Duplicate validation protection
Rollback on failure
📤 Delivery Orders

Delivery Orders handle outgoing inventory.

Delivery Lifecycle
DRAFT
  ↓
PICKED
  ↓
PACKED
  ↓
VALIDATED

Stock is not changed during creation, picking, or packing.

Stock is reduced only when the delivery is validated.

Delivery Validation
        ↓
     Stock -
        ↓
   Stock Ledger

Features:

Delivery creation
Pick workflow
Pack workflow
Validation workflow
Negative-stock protection
Multi-item transactions
Automatic ledger entries
Duplicate validation protection
Full transaction rollback
🔄 Internal Stock Transfers

Transfers move inventory between stock locations.

Transfer Lifecycle
DRAFT
  ↓
VALIDATED

When a transfer is validated:

Source Location
      ↓
TRANSFER_OUT
      ↓
Destination Location
      ↓
TRANSFER_IN

For every transferred item:

Source Stock  - Quantity
Destination   + Quantity

The overall inventory quantity remains unchanged.

Features:

Source location validation
Destination location validation
Cross-warehouse transfers
Same-warehouse transfers
Same-location protection
Multi-item transfers
Insufficient-stock protection
Automatic ledger entries
Transaction rollback
Duplicate validation protection
⚖️ Stock Adjustments

Stock adjustments reconcile system inventory with physical inventory.

The system calculates:

Difference = Physical Quantity - Recorded Quantity

Example:

Recorded Quantity = 100
Physical Quantity = 97

Adjustment = 97 - 100
           = -3

The system then updates stock by the calculated difference.

Physical Count
      ↓
Calculate Difference
      ↓
Update Stock
      ↓
Stock Ledger

Features:

Physical quantity entry
Automatic difference calculation
Positive adjustments
Negative adjustments
Multi-item adjustments
Negative-stock protection
Transaction rollback
Duplicate validation protection
Automatic ledger entries
📒 Stock Ledger

Every stock movement is recorded in an append-only Stock Ledger.

Supported transaction types:

RECEIPT
DELIVERY
TRANSFER_IN
TRANSFER_OUT
ADJUSTMENT

Each ledger entry records information such as:

Product
Location
Warehouse
Transaction type
Quantity change
Resulting quantity
Reference type
Reference ID
Notes
User who created the transaction
Timestamp

This provides a complete history of how stock changed over time.

🧠 Core Architecture

StockSense uses a centralized stock movement service.

Instead of allowing individual controllers to directly manipulate stock, all inventory changes pass through:

Controller
    ↓
Stock Movement Service
    ↓
Database Transaction
    ↓
Stock Update
    ↓
Stock Ledger Entry

The core service is:

backend/src/services/stock.service.js
Why this approach?

It ensures that:

Stock updates are consistent
Ledger entries cannot be accidentally skipped
Transactions remain atomic
Negative stock is prevented
Multiple stock operations can be rolled back together
All stock changes follow the same business rules
🔒 Transaction Safety

StockSense uses database transactions for critical inventory operations.

For example, a transfer containing multiple products:

Transfer
 ├── Product A → Source -
 ├── Product A → Destination +
 ├── Product B → Source -
 └── Product B → Destination +

If any operation fails:

Transaction
     ↓
   ERROR
     ↓
ROLLBACK EVERYTHING

No partial stock update is allowed.

🛡️ Stock Protection

StockSense prevents invalid inventory states.

Negative Stock

If available stock is:

10

and a delivery attempts:

15

the transaction is rejected.

The database remains:

Stock = 10

instead of:

Stock = -5
Zero Quantity

Zero-quantity stock movements are rejected.

Duplicate Validation

Already validated receipts, deliveries, transfers, and adjustments cannot be validated again.

Concurrent Stock Updates

The stock movement engine uses row-level locking inside database transactions to protect stock updates from conflicting operations.

🏗️ Technology Stack
Backend
Node.js
Express.js
MySQL
Sequelize ORM
JWT
bcryptjs
express-validator
CORS
Morgan
Frontend
React
Vite
Tailwind CSS
Database
MySQL
Authentication
JWT
bcrypt password hashing
OTP-based password reset
📁 Project Structure
StockSense/
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │
│   │   ├── controllers/
│   │   │   ├── adjustment.controller.js
│   │   │   ├── delivery.controller.js
│   │   │   ├── receipt.controller.js
│   │   │   └── transfer.controller.js
│   │   │
│   │   ├── middleware/
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Category.js
│   │   │   ├── Product.js
│   │   │   ├── Warehouse.js
│   │   │   ├── StockLocation.js
│   │   │   ├── Stock.js
│   │   │   ├── StockLedger.js
│   │   │   ├── Receipt.js
│   │   │   ├── ReceiptItem.js
│   │   │   ├── Delivery.js
│   │   │   ├── DeliveryItem.js
│   │   │   ├── Transfer.js
│   │   │   ├── TransferItem.js
│   │   │   ├── Adjustment.js
│   │   │   └── AdjustmentItem.js
│   │   │
│   │   ├── routes/
│   │   │
│   │   ├── services/
│   │   │   └── stock.service.js
│   │   │
│   │   ├── utils/
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
🔁 Inventory Lifecycle

The complete inventory lifecycle is:

                 ┌──────────────┐
                 │   Product    │
                 └──────┬───────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Stock Receipt   │
              └────────┬─────────┘
                       │
                       ▼
                    STOCK +
                       │
                       ▼
                ┌─────────────┐
                │   Transfer  │
                └──────┬──────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Source Stock -      Destination +
             │
             ▼
       ┌──────────────┐
       │   Delivery   │
       └──────┬───────┘
              │
              ▼
           STOCK -
              │
              ▼
       ┌──────────────┐
       │  Adjustment  │
       └──────┬───────┘
              │
              ▼
        STOCK ± Difference
              │
              ▼
       ┌──────────────┐
       │ Stock Ledger │
       └──────────────┘
📊 Stock Ledger Flow

Every inventory-changing operation produces a corresponding ledger entry.

Operation	Stock Effect	Ledger
Receipt	+Quantity	RECEIPT
Delivery	-Quantity	DELIVERY
Transfer Out	-Quantity	TRANSFER_OUT
Transfer In	+Quantity	TRANSFER_IN
Adjustment	±Difference	ADJUSTMENT
🧪 Testing

StockSense includes comprehensive backend testing covering the major inventory workflows.

Test coverage includes:

Authentication
Signup
Login
JWT authentication
Protected routes
Password reset flow
Products
Product creation
Product updates
Product listing
Search
Category filtering
Warehouse filtering
Low-stock filtering
Receipts
Receipt creation
Validation
Duplicate validation
Stock increase
Ledger creation
Transaction rollback
Deliveries
Delivery creation
Picking
Packing
Validation
Stock decrease
Negative-stock protection
Duplicate validation
Transaction rollback
Invalid status transitions
Transfers
Transfer creation
Source/destination validation
Same-location protection
Successful transfers
Cross-warehouse transfers
Multi-item transfers
Insufficient stock protection
Transaction rollback
Ledger validation
Adjustments
Adjustment creation
Positive adjustments
Negative adjustments
Physical vs recorded quantity reconciliation
Duplicate validation
Multi-item rollback
Invalid input handling
🧮 Example Inventory Scenario

Consider a product:

Product: Steel Rod
Step 1 — Receive Stock
Receipt = +100

Main Warehouse:

100
Step 2 — Transfer Stock

Transfer:

Main Warehouse → Production
Quantity = 30

Result:

Main Warehouse = 70
Production     = 30

Total:

100
Step 3 — Deliver Stock

Production delivery:

Quantity = 20

Result:

Main Warehouse = 70
Production     = 10

Total:

80
Step 4 — Physical Stock Adjustment

Physical count at Production:

7

Recorded:

10

Difference:

7 - 10 = -3

After adjustment:

Main Warehouse = 70
Production     = 7

Final total:

77
📒 Example Ledger

The resulting ledger contains:

+100  RECEIPT
 -30  TRANSFER_OUT
 +30  TRANSFER_IN
 -20  DELIVERY
  -3  ADJUSTMENT

The ledger therefore provides a complete audit trail of inventory changes.

⚙️ Backend Setup
1. Clone the Repository
git clone <repository-url>
cd StockSense
2. Install Backend Dependencies
cd backend
npm install
3. Configure MySQL

Create a MySQL database:

CREATE DATABASE stocksense;

Configure the database credentials according to the backend configuration/environment setup.

Example:

DB_NAME=stocksense
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
4. Start the Backend
npm run dev

The backend runs on:

http://localhost:4000

API base URL:

http://localhost:4000/api
🎨 Frontend Setup

Open another terminal:

cd frontend
npm install

Start the frontend:

npm run dev

Vite will provide the local development URL.

🔗 API Structure

The backend follows REST-style API routes.

Major API areas include:

/api/auth
/api/products
/api/categories
/api/warehouses
/api/stock
/api/receipts
/api/deliveries
/api/transfers
/api/adjustments
/api/ledger

Authentication-protected endpoints require a valid JWT.

👥 Team Contributions

StockSense was developed as a 3-member team.

Lakshit — Backend Foundation

Responsible for:

Project setup
Backend architecture
Express server
MySQL configuration
Sequelize setup
Database models
Authentication
JWT
OTP password reset
RBAC
Product APIs
Category APIs
Warehouse APIs
Stock foundation
Stock Ledger foundation
Avinaash — Stock Movement & Inventory Logic

Responsible for:

Central Stock Movement Engine
Transaction handling
Stock locking
Stock validation
Receipts
Deliveries
Internal Transfers
Stock Adjustments
Stock Ledger integration
Negative-stock protection
Rollback handling
Inventory workflow testing

All major inventory operations were integrated through the centralized stock service.

Shubham — Frontend

Responsible for:

Frontend application
UI implementation
Dashboard
Inventory screens
Product management interface
Stock movement interfaces
API integration
User interaction flows
🔐 Design Principles

StockSense follows several important principles:

1. Single Source of Truth

Current inventory is maintained in the Stock table.

2. Immutable History

Stock Ledger records inventory movement history.

3. Centralized Stock Updates

Controllers do not directly modify stock quantities.

All changes go through:

stock.service.js
4. Atomic Transactions

Related stock operations succeed or fail together.

5. No Negative Inventory

Outgoing inventory cannot exceed available stock.

6. Traceability

Every stock-changing operation creates a ledger entry.

📈 Future Improvements

Potential future enhancements include:

Advanced dashboard analytics
Real-time stock notifications
Email/SMS alerts
Barcode/QR scanning
Purchase order management
Supplier management
Customer management
Advanced reporting
Inventory forecasting
Export to Excel/PDF
Audit logs
Advanced role permissions
Real-time updates using WebSockets
Cloud deployment
Automated database backups
🏆 Project Highlights

StockSense demonstrates a complete inventory management architecture rather than a simple CRUD application.

The project focuses heavily on:

Transactional Integrity
        +
Inventory Accuracy
        +
Auditability
        +
Multi-Location Stock
        +
Centralized Business Logic

The most important architectural component is the centralized stock movement engine, which ensures that every inventory-changing operation updates both:

Stock
  +
Stock Ledger

within the same database transaction.

📜 License

This project was developed as a hackathon project.

License and usage terms can be added according to the team's requirements.

👨‍💻 Team

StockSense — Inventory Management System

Built by:

Lakshit
Avinaash
Shubham
