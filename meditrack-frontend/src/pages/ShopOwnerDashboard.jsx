import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Package, Settings } from 'lucide-react';

const ShopOwnerDashboard = () => {
  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Shop dashboard</h1>
      <p className="text-slate-500 mb-8">Manage your chemist listing and inventory.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/inventory"
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col gap-3"
        >
          <Package className="text-indigo-600" size={28} />
          <h2 className="text-lg font-semibold text-slate-900">Inventory</h2>
          <p className="text-sm text-slate-500">Stock and medicine management</p>
        </Link>
        <Link
          to="/shop-settings"
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col gap-3"
        >
          <Settings className="text-indigo-600" size={28} />
          <h2 className="text-lg font-semibold text-slate-900">Shop settings</h2>
          <p className="text-sm text-slate-500">Hours, contact, and profile</p>
        </Link>
        <Link
          to="/shops"
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col gap-3"
        >
          <Store className="text-indigo-600" size={28} />
          <h2 className="text-lg font-semibold text-slate-900">Directory</h2>
          <p className="text-sm text-slate-500">Browse approved chemists on the map</p>
        </Link>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;
