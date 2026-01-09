import React from 'react';
import AdminObManager from '../components/AdminObManager/AdminObManager';
import AdminCategoryManager from '../components/AdminCategoryManager/AdminCategoryManager';

const AdminMeta: React.FC = () => {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <AdminObManager />
      <AdminCategoryManager />
    </div>
  );
};

export default AdminMeta;

