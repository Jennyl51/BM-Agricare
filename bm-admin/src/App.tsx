import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Retailers from "./pages/Retailers";
import RetailerDetail from "./pages/RetailerDetail";
import Rewards from "./pages/Rewards";
import RewardDetail from "./pages/RewardDetail";
import Products from "./pages/Products";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:invoiceId" element={<InvoiceDetail />} />

        <Route path="/retailers" element={<Retailers />} />
        <Route path="/retailers/:retailerId" element={<RetailerDetail />} />

        <Route path="/products" element={<Products />} />

        <Route path="/rewards" element={<Rewards />} />
        <Route path="/rewards/:rewardId" element={<RewardDetail />} />

        <Route path="/resources" element={<Resources />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}