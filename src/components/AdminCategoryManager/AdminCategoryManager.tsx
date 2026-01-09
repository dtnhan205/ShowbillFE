import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import styles from './AdminCategoryManager.module.css';
import type { Category } from '../../types/adminMeta';

type LoadState = 'idle' | 'loading' | 'error';

const AdminCategoryManager: React.FC = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => name.trim() && slug.trim(), [name, slug]);

  const fetchList = useCallback(async () => {
    try {
      setLoadState('loading');
      setError(null);
      const { data } = await api.get<Category[]>('/categories?includeInactive=true');
      setItems(Array.isArray(data) ? data : []);
      setLoadState('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải danh sách category');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const createItem = useCallback(async () => {
    try {
      await api.post('/categories', { name: name.trim(), slug: slug.trim().toLowerCase() });
      setName('');
      setSlug('');
      await fetchList();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Tạo category thất bại');
    }
  }, [fetchList, name, slug]);

  const toggleActive = useCallback(async (id: string, next: boolean) => {
    try {
      await api.put(`/categories/${id}`, { isActive: next });
      setItems((prev) => prev.map((x) => (x._id === id ? { ...x, isActive: next } : x)));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const ok = window.confirm('Xóa category này?');
    if (!ok) return;
    try {
      await api.delete(`/categories/${id}`);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý Category</h2>
        <div className={styles.muted}>Tổng: {items.length}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Tên hiển thị (VD: Migul)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Slug (VD: migul)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <button className={styles.btn} type="button" disabled={!canCreate} onClick={() => void createItem()}>
            Thêm
          </button>
        </div>
        <div className={styles.muted} style={{ marginTop: 10 }}>
          Gợi ý: slug nên viết thường, không dấu, không khoảng trắng.
        </div>
      </div>

      <div className={styles.card}>
        {loadState === 'loading' ? <div className={styles.muted}>Đang tải...</div> : null}
        {loadState === 'error' ? <div className={styles.muted}>{error}</div> : null}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x._id}>
                <td>{x.name}</td>
                <td className={styles.muted}>{x.slug}</td>
                <td>
                  <span className={`${styles.badge} ${x.isActive ? styles.active : styles.inactive}`}>
                    {x.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => void toggleActive(x._id, !x.isActive)}
                    >
                      {x.isActive ? 'Tắt' : 'Bật'}
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => void removeItem(x._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategoryManager;

