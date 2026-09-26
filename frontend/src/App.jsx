import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ProductList } from './pages/Products/ProductList';
import { ReceiptList } from './pages/Receipts/ReceiptList';
import { ReceiptDetail } from './pages/Receipts/ReceiptDetail';
import { DeliveryList } from './pages/Deliveries/DeliveryList';
import { DeliveryDetail } from './pages/Deliveries/DeliveryDetail';
import { TransferList } from './pages/Transfers/TransferList';
import { TransferDetail } from './pages/Transfers/TransferDetail';
import { AdjustmentList } from './pages/Adjustments/AdjustmentList';
import { AdjustmentDetail } from './pages/Adjustments/AdjustmentDetail';
import { WarehouseList } from './pages/Warehouses/WarehouseList';
import { StockLedger } from './pages/Ledger/StockLedger';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />

            {/* Protected Operations Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              
              <Route path="receipts" element={<ReceiptList />} />
              <Route path="receipts/:id" element={<ReceiptDetail />} />

              <Route path="deliveries" element={<DeliveryList />} />
              <Route path="deliveries/:id" element={<DeliveryDetail />} />

              <Route path="transfers" element={<TransferList />} />
              <Route path="transfers/:id" element={<TransferDetail />} />

              <Route path="adjustments" element={<AdjustmentList />} />
              <Route path="adjustments/:id" element={<AdjustmentDetail />} />

              <Route path="warehouses" element={<WarehouseList />} />
              <Route path="ledger" element={<StockLedger />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
