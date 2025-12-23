
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AffiliateDashboard from './pages/AffiliateDashboard';
import BrandDashboard from './pages/BrandDashboard';
import Links from './pages/Links';
import LinkDetails from './pages/LinkDetails';
import Products from './pages/Products';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import TopAffiliates from './pages/TopAffiliates';
import Approvals from './pages/Approvals';
import Payouts from './pages/Payouts';
import ClickBankParent from './pages/ClickBankParent';
import JVZoo from './pages/JVZoo';
import TestSale from './pages/TestSale';
import TestSalePixel from './pages/TestSalePixel';
import AdminReports from './pages/AdminReports';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Chargement...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/affiliate"
          element={
            <PrivateRoute>
              <AffiliateDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/brand"
          element={
            <PrivateRoute>
              <BrandDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/links"
          element={
            <PrivateRoute>
              <Links />
            </PrivateRoute>
          }
        />
        <Route
          path="/links/:id"
          element={
            <PrivateRoute>
              <LinkDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <PrivateRoute>
              <Marketplace />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <PrivateRoute>
              <ProductDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/top-affiliates"
          element={
            <PrivateRoute>
              <TopAffiliates />
            </PrivateRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <PrivateRoute>
              <Approvals />
            </PrivateRoute>
          }
        />
        <Route
          path="/payouts"
          element={
            <PrivateRoute>
              <Payouts />
            </PrivateRoute>
          }
        />
        <Route
          path="/clickbank"
          element={
            <PrivateRoute>
              <ClickBankParent />
            </PrivateRoute>
          }
        />
        <Route
          path="/jvzoo"
          element={
            <PrivateRoute>
              <JVZoo />
            </PrivateRoute>
          }
        />
        <Route
          path="/test-sale"
          element={
            <PrivateRoute>
              <TestSale />
            </PrivateRoute>
          }
        />
        <Route
          path="/test-sale-pixel"
          element={
            <PrivateRoute>
              <TestSalePixel />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-reports"
          element={
            <PrivateRoute>
              <AdminReports />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
