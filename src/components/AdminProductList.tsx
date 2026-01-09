import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import type { Product } from '../types';
import type { Category, ObVersion } from '../types/adminMeta';
import styles from './AdminProductList/AdminProductList.module.css';

type LoadState = 'idle' | 'loading' | 'error';

type Filters = {
  search: string;
  obVersion: string;
  category: string;
  status: 'all' | 'visible' | 'hidden';
};

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [obs, setObs] = useState<ObVersion[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    obVersion: '',
    category: '',
    status: 'all',
  });

  const fetchMeta = useCallback(async () => {
    try {
      const [o, c] = await Promise.all([
        api.get<ObVersion[]>('/obs?includeInactive=true'),
        api.get<Category[]>('/categories?includeInactive=true'),
      ]);
      setObs(Array.isArray(o.data) ? o.data : []);
      setCats(Array.isArray(c.data) ? c.data : []);
    } catch {
      // ignore
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadState('loading');
      setErrorMessage(null);

      const { data } = await api.get<Product[]>('/products?includeHidden=true');
      setProducts(Array.isArray(data) ? data : []);

      setLoadState('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.';
      setErrorMessage(message);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void fetchMeta();
    void fetchProducts();
  }, [fetchMeta, fetchProducts]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = window.confirm('Xóa sản phẩm này?');
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xóa sản phẩm thất bại.';
      alert(message);
    }
  }, []);

  const handleToggleHidden = useCallback(async (id: string) => {
    try {
      await api.patch(`/products/${id}/toggle-hidden`);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isHidden: !p.isHidden } : p)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại.';
      alert(message);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', obVersion: '', category: '', status: 'all' });
  }, []);

  const filteredProducts = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    return products.filter((p) => {
      if (q && !(p.name || '').toLowerCase().includes(q)) return false;

      if (filters.obVersion && (p.obVersion || '').toLowerCase() !== filters.obVersion.toLowerCase()) {
        return false;
      }

      if (filters.category && (p.category || '').toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      if (filters.status === 'hidden' && !p.isHidden) return false;
      if (filters.status === 'visible' && p.isHidden) return false;

      return true;
    });
  }, [filters.category, filters.obVersion, filters.search, filters.status, products]);

  const content = useMemo(() => {
    if (loadState === 'loading') {
      return <div className={styles.loading}>Đang tải danh sách sản phẩm...</div>;
    }

    if (loadState === 'error') {
      return (
        <div className={styles.error}>
          <p>{errorMessage ?? 'Đã xảy ra lỗi.'}</p>
          <button className={styles.retryButton} onClick={() => void fetchProducts()}>
            Thử lại
          </button>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return <div className={styles.empty}>Không có sản phẩm phù hợp bộ lọc.</div>;
    }

    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Hình ảnh</th>
              <th>OB</th>
              <th>Category</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>
                  {p.imageBase64 ? (
                    <img src={p.imageBase64} alt={p.name} className={styles.image} />
                  ) : (
                    <div className={styles.noImage}>No image</div>
                  )}
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeMeta}`}>{p.obVersion ?? '-'}</span>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeMeta}`}>{p.category ?? '-'}</span>
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${p.isHidden ? styles.badgeHidden : styles.badgeVisible}`}
                  >
                    {p.isHidden ? 'Ẩn' : 'Hiện'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link to={`/admin/edit/${p._id}`} className={styles.link}>
                      Sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(p._id)}
                      className={`${styles.actionBtn} ${styles.delete}`}
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleHidden(p._id)}
                      className={`${styles.actionBtn} ${styles.toggle}`}
                    >
                      {p.isHidden ? 'Hiện' : 'Ẩn'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [errorMessage, fetchProducts, filteredProducts, handleDelete, handleToggleHidden, loadState]);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý sản phẩm</h1>
        <Link to="/admin/add" className={styles.addButton}>
          + Thêm sản phẩm
        </Link>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.input}
          placeholder="Tìm theo tên..."
          value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        />

        <select
          className={styles.select}
          value={filters.obVersion}
          onChange={(e) => setFilters((p) => ({ ...p, obVersion: e.target.value }))}
        >
          <option value="">Tất cả OB</option>
          {obs
            .filter((x) => x.isActive)
            .map((x) => (
              <option key={x._id} value={x.slug}>
                {x.name}
              </option>
            ))}
        </select>

        <select
          className={styles.select}
          value={filters.category}
          onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
        >
          <option value="">Tất cả Category</option>
          {cats
            .filter((x) => x.isActive)
            .map((x) => (
              <option key={x._id} value={x.slug}>
                {x.name}
              </option>
            ))}
        </select>

        <select
          className={styles.select}
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as Filters['status'] }))}
        >
          <option value="all">Tất cả</option>
          <option value="visible">Đang hiện</option>
          <option value="hidden">Đang ẩn</option>
        </select>

        <button type="button" className={styles.resetBtn} onClick={resetFilters}>
          Reset
        </button>
      </div>

      {content}
    </div>
  );
};

export default AdminProductList;
