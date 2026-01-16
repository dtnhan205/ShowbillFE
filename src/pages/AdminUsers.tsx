import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import type { AdminUserItem } from '../types';
import styles from './AdminUsers.module.css';

const AdminUsers: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | 'basic' | 'pro' | 'premium'>('all');

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<AdminUserItem[]>('/admin/users');
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách admin';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  const handleToggle = useCallback(
    async (id: string) => {
      try {
        setTogglingId(id);
        const { data } = await api.patch<{ admin: AdminUserItem }>(`/admin/users/${id}/toggle-active`);
        setAdmins((prev) => prev.map((a) => (a._id === id ? { ...a, ...data.admin } : a)));
      } catch (err) {
        console.error(err);
        toast.error('Không thể cập nhật trạng thái admin');
      } finally {
        setTogglingId(null);
      }
    },
    [],
  );

  const filteredAdmins = useMemo<AdminUserItem[]>(() => {
    return admins.filter((admin: AdminUserItem) => {
      const searchLower = search.toLowerCase().trim();
      if (searchLower) {
        const matchesSearch =
          admin.username.toLowerCase().includes(searchLower) ||
          admin.email.toLowerCase().includes(searchLower) ||
          (admin.displayName && admin.displayName.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (roleFilter !== 'all' && admin.role !== roleFilter) return false;

      if (statusFilter === 'active' && admin.isActive === false) return false;
      if (statusFilter === 'inactive' && admin.isActive !== false) return false;

      if (packageFilter !== 'all') {
        const adminPackage = admin.package || 'basic';
        if (adminPackage !== packageFilter) return false;
      }

      return true;
    });
  }, [admins, search, roleFilter, statusFilter, packageFilter]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPackageFilter('all');
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang tải danh sách admin...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button type="button" className={styles.retryButton} onClick={() => void fetchAdmins()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Quản lý Admin</h2>
        <p className={styles.subtitle}>Chỉ super admin mới xem được trang này. | Tổng: {admins.length} | Hiển thị: {filteredAdmins.length}</p>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.filterInput}
          placeholder="Tìm theo username, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'super' | 'admin')}
        >
          <option value="all">Tất cả role</option>
          <option value="super">Super Admin</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
        <select
          className={styles.filterSelect}
          value={packageFilter}
          onChange={(e) => setPackageFilter(e.target.value as 'all' | 'basic' | 'pro' | 'premium')}
        >
          <option value="all">Tất cả gói</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
        <button type="button" className={styles.resetBtn} onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên hiển thị</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Gói</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyMessage}>
                  Không tìm thấy admin nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((a: AdminUserItem) => (
              <tr key={a._id}>
                <td>{a.displayName || a.username}</td>
                <td>{a.username}</td>
                <td>{a.email}</td>
                <td>{a.role}</td>
                <td>
                  {(() => {
                    const adminPackage = a.package || 'basic';
                    const packageExpiry = a.packageExpiry ? new Date(a.packageExpiry) : null;
                    const isExpired = packageExpiry && packageExpiry < new Date();
                    const packageName = adminPackage.charAt(0).toUpperCase() + adminPackage.slice(1);
                    
                    return (
                      <div className={styles.packageInfo}>
                        <span className={`${styles.packageBadge} ${styles[`package${packageName}`]}`}>
                          {packageName}
                        </span>
                        {packageExpiry && !isExpired && (
                          <span className={styles.packageExpiry}>
                            Hết hạn: {packageExpiry.toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        {isExpired && adminPackage !== 'basic' && (
                          <span className={styles.packageExpired}>Đã hết hạn</span>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td>
                  <span className={a.isActive === false ? styles.statusLocked : styles.statusActive}>
                    {a.isActive === false ? 'Đã khóa' : 'Đang hoạt động'}
                  </span>
                </td>
                <td>
                  {a.role === 'super' ? (
                    <span className={styles.superNote}>Không thể khóa super</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => void handleToggle(a._id)}
                      disabled={togglingId === a._id}
                    >
                      {a.isActive === false ? 'Mở khóa' : 'Tạm khóa'}
                    </button>
                  )}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
