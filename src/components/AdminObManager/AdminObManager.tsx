import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Icon from '../Icons/Icon';
import styles from './AdminObManager.module.css';
import type { ObVersion } from '../../types/adminMeta';

type LoadState = 'idle' | 'loading' | 'error';

const AdminObManager: React.FC = () => {
  const [items, setItems] = useState<ObVersion[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const canCreate = useMemo(() => name.trim() && slug.trim(), [name, slug]);

  const fetchList = useCallback(async () => {
    try {
      setLoadState('loading');
      setError(null);
      const { data } = await api.get<ObVersion[]>('/obs/mine?includeInactive=true');
      setItems(Array.isArray(data) ? data : []);
      setLoadState('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải danh sách OB');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const createItem = useCallback(async () => {
    try {
      await api.post('/obs', { name: name.trim(), slug: slug.trim().toLowerCase() });
      setName('');
      setSlug('');
      await fetchList();
      toast.success('Đã tạo OB thành công!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tạo OB thất bại');
    }
  }, [fetchList, name, slug]);

  const toggleActive = useCallback(async (id: string, next: boolean) => {
    try {
      await api.put(`/obs/${id}`, { isActive: next });
      setItems((prev) => prev.map((x) => (x._id === id ? { ...x, isActive: next } : x)));
      toast.success('Đã cập nhật OB thành công!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteOb = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/obs/${confirmDelete}`);
      setItems((prev) => prev.filter((x) => x._id !== confirmDelete));
      toast.success('Đã xóa OB thành công!');
      setConfirmDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }, [confirmDelete]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchLower = search.toLowerCase().trim();
      if (searchLower) {
        const matchesSearch =
          item.name.toLowerCase().includes(searchLower) || item.slug.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (statusFilter === 'active' && !item.isActive) return false;
      if (statusFilter === 'inactive' && item.isActive) return false;

      return true;
    });
  }, [items, search, statusFilter]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="game" size={28} color="rgba(255, 255, 255, 0.9)" /> Quản lý OB (Free Fire)
        </h2>
        <div className={styles.muted}>Tổng: {items.length} | Hiển thị: {filteredItems.length}</div>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.filterInput}
          placeholder="Tìm theo tên hoặc slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã tắt</option>
        </select>
        <button type="button" className={styles.resetBtn} onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Tên hiển thị (VD: OB51)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Slug (VD: ob51)"
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
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyMessage}>
                  Không tìm thấy OB nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredItems.map((x) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Xác nhận xóa</h3>
            <p className={styles.modalMessage}>Bạn có chắc muốn xóa OB này?</p>
            <div className={styles.modalActions}>
              <button onClick={confirmDeleteOb} className={styles.modalConfirmButton}>
                Xóa
              </button>
              <button onClick={() => setConfirmDelete(null)} className={styles.modalCancelButton}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminObManager;

