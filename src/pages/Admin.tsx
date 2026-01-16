import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout/AdminLayout';
import AdminDashboard from '../components/AdminDashboard';
import AdminProductList from '../components/AdminProductList';
import AdminProductForm from '../components/AdminProductForm';
import AdminMeta from './AdminMeta';
import AdminObs from './AdminObs';
import AdminCategories from './AdminCategories';
import AdminProfile from './AdminProfile';
import AdminUsers from './AdminUsers';
import AdminPackages from './AdminPackages';
import AdminPayment from './AdminPayment';
import PaymentDetail from './PaymentDetail';
import PaymentHistory from './PaymentHistory';

const Admin: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/products" element={<AdminProductList />} />
        <Route path="/add" element={<AdminProductForm />} />
        <Route path="/edit/:id" element={<AdminProductForm />} />
        <Route path="/obs" element={<AdminObs />} />
        <Route path="/categories" element={<AdminCategories />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/packages" element={<AdminPackages />} />
        <Route path="/payment" element={<AdminPayment />} />
        <Route path="/payment/history" element={<PaymentHistory />} />
        <Route path="/payment/:id" element={<PaymentDetail />} />
        <Route path="/profile" element={<AdminProfile />} />

        {/* Backward compatible */}
        <Route path="/meta" element={<AdminMeta />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
