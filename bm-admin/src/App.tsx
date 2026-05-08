import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Retailers from "./pages/Retailers";
import Rewards from "./pages/Rewards";
import Products from "./pages/Products";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/retailers" element={<Retailers />} />
      <Route path="/products" element={<Products />} />
      <Route path="/rewards" element={<Rewards />} />
    </Routes>
  );
}
