import React, { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import type { AdminUserItem } from '../types';
import styles from './AdminUsers.module.css';

const AdminUsers: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
        alert('Không thể cập nhật trạng thái admin');
      } finally {
        setTogglingId(null);
      }
    },
    [],
  );

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
        <p className={styles.subtitle}>Chỉ super admin mới xem được trang này.</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên hiển thị</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a._id}>
                <td>{a.displayName || a.username}</td>
                <td>{a.username}</td>
                <td>{a.email}</td>
                <td>{a.role}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
