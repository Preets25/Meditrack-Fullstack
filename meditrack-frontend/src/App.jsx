import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import RootRedirect from './components/RootRedirect';
import DashboardRedirect from './components/DashboardRedirect';

import Dashboard from './pages/Dashboard';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Medicines from './pages/Medicines';
import Shops from './pages/Shops';
import ShopDetail from './pages/ShopDetail';
import Profile from './pages/Profile';
import Inventory from './pages/Inventory';
import ShopSettings from './pages/ShopSettings';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route element={<RoleRoute allow={['patient', 'admin']} redirectTo="/dashboard/shop" />}>
                <Route path="dashboard/patient" element={<Dashboard />} />
              </Route>
              <Route element={<RoleRoute allow={['shop_owner', 'admin']} redirectTo="/dashboard/patient" />}>
                <Route path="dashboard/shop" element={<ShopOwnerDashboard />} />
              </Route>

              <Route path="medicines" element={<Medicines />} />
              <Route path="shops" element={<Shops />} />
              <Route path="shops/:id" element={<ShopDetail />} />
              <Route path="profile" element={<Profile />} />

              <Route element={<ProtectedRoute allowedRoles={['shop_owner', 'admin']} />}>
                <Route path="inventory" element={<Inventory />} />
                <Route path="shop-settings" element={<ShopSettings />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="/dashboard" element={<PrivateRoute />}>
            <Route index element={<DashboardRedirect />} />
          </Route>
          
          <Route path="*" element={<div className="p-8 text-center text-slate-500">Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
