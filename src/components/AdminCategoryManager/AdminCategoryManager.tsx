import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Icon from '../Icons/Icon';
import styles from './AdminCategoryManager.module.css';
import type { Category } from '../../types/adminMeta';

type LoadState = 'idle' | 'loading' | 'error';

const AdminCategoryManager: React.FC = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);

  const canCreate = useMemo(() => name.trim() && slug.trim(), [name, slug]);

  // Kiểm tra role super admin
  const isSuperAdmin = useMemo(() => {
    try {
      const raw = localStorage.getItem('adminRole');
      return raw === 'super';
    } catch {
      return false;
    }
  }, []);

  const fetchList = useCallback(async () => {
    try {
      setLoadState('loading');
      setError(null);
      // Tất cả admin (kể cả super admin) đều dùng /categories/mine
      // Backend sẽ tự động trả về tất cả categories cho super admin
      const endpoint = '/categories/mine?includeInactive=true';
      const { data } = await api.get<Category[]>(endpoint);
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
      const response = await api.post('/categories', { name: name.trim(), slug: slug.trim().toLowerCase() });
      setName('');
      setSlug('');
      setShowForm(false);
      toast.success('Đã tạo category thành công!');
      
      // Refresh list sau khi tạo thành công
      // Thêm delay nhỏ để đảm bảo DB đã commit
      setTimeout(async () => {
        await fetchList();
      }, 100);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tạo category thất bại');
    }
  }, [fetchList, name, slug]);

  const toggleActive = useCallback(async (id: string, next: boolean) => {
    try {
      await api.put(`/categories/${id}`, { isActive: next });
      setItems((prev) => prev.map((x) => (x._id === id ? { ...x, isActive: next } : x)));
      toast.success('Đã cập nhật category thành công!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteCategory = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/categories/${confirmDelete}`);
      setItems((prev) => prev.filter((x) => x._id !== confirmDelete));
      toast.success('Đã xóa category thành công!');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div>
            <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="folder" size={28} color="rgba(255, 255, 255, 0.9)" /> Quản lý Category
            </h2>
            <div className={styles.muted}>Tổng: {items.length} | Hiển thị: {filteredItems.length}</div>
          </div>
          {!showForm && (
            <button
              type="button"
              className={styles.addButton}
              onClick={() => setShowForm(true)}
            >
              <Icon name="folder" size={18} color="currentColor" style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }} />
              Thêm Category mới
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={18} color="rgba(255, 255, 255, 0.5)" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            className={styles.filterInput}
            placeholder="Tìm theo tên hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 48 }}
          />
        </div>
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
          <Icon name="refresh-cw" size={16} color="currentColor" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
          Reset
        </button>
      </div>

      {showForm && (
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="folder" size={20} color="rgba(59, 130, 246, 0.8)" />
              Thêm Category mới
            </h3>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => {
                setShowForm(false);
                setName('');
                setSlug('');
              }}
              title="Đóng"
            >
              <Icon name="close" size={20} color="currentColor" />
            </button>
          </div>
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
              <Icon name="check" size={16} color="currentColor" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
              Thêm
            </button>
          </div>
          <div className={styles.muted} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="info" size={16} color="rgba(255, 255, 255, 0.5)" />
            Gợi ý: slug nên viết thường, không dấu, không khoảng trắng.
          </div>
        </div>
      )}

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
                  <Icon name="alert-circle" size={48} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
                  <div>Không tìm thấy category nào phù hợp với bộ lọc.</div>
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
                      title={x.isActive ? 'Tắt category này' : 'Bật category này'}
                    >
                      {x.isActive ? 'Tắt' : 'Bật'}
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => void removeItem(x._id)}
                      title="Xóa category này"
                    >
                      <Icon name="trash" size={14} color="currentColor" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
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
            <p className={styles.modalMessage}>Bạn có chắc muốn xóa category này?</p>
            <div className={styles.modalActions}>
              <button onClick={confirmDeleteCategory} className={styles.modalConfirmButton}>
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

export default AdminCategoryManager;

