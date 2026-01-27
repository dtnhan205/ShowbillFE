import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import type { Product } from '../types';
import type { Category, ObVersion } from '../types/adminMeta';
import { getImageUrl } from '../utils/imageUrl';
import Icon from './Icons/Icon';
import AdminProductForm from './AdminProductForm';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [obs, setObs] = useState<ObVersion[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    obVersion: '',
    category: '',
    status: 'all',
  });

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastPage, setLastPage] = useState<number | null>(null);

  // Kiểm tra role super admin
  const isSuperAdmin = useMemo(() => {
    try {
      const raw = localStorage.getItem('adminRole');
      return raw === 'super';
    } catch {
      return false;
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      // Super admin có thể xem tất cả, admin thường chỉ xem của mình
      const obsEndpoint = isSuperAdmin ? '/obs?includeInactive=true' : '/obs/mine?includeInactive=true';
      const catsEndpoint = isSuperAdmin ? '/categories?includeInactive=true' : '/categories/mine?includeInactive=true';
      
      const [o, c] = await Promise.all([
        api.get<ObVersion[]>(obsEndpoint),
        api.get<Category[]>(catsEndpoint),
      ]);
      setObs(Array.isArray(o.data) ? o.data : []);
      setCats(Array.isArray(c.data) ? c.data : []);
    } catch {
      // ignore
    }
  }, [isSuperAdmin]);

  const fetchProducts = useCallback(async (pageParam: number = 1) => {
    try {
      setLoadState('loading');
      setErrorMessage(null);

      // Super admin có thể xem tất cả sản phẩm, admin thường chỉ xem của mình
      const endpoint = isSuperAdmin
        ? `/products/all?page=${pageParam}&limit=${PAGE_SIZE}`
        : `/products/mine?page=${pageParam}&limit=${PAGE_SIZE}`;
      const { data } = await api.get<Product[]>(endpoint);
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      setPage(pageParam);
      const hasMore = list.length === PAGE_SIZE;
      setHasNextPage(hasMore);

      // Nếu trả về ít hơn PAGE_SIZE => đã đến trang cuối
      if (!hasMore) {
        setLastPage(pageParam);
      } else {
        // Giữ nguyên lastPage nếu đã biết, tránh đoán sai
        setLastPage((prev) => prev);
      }

      setLoadState('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.';
      setErrorMessage(message);
      setLoadState('error');
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    void fetchMeta();
    void fetchProducts(1);
  }, [fetchMeta, fetchProducts]);

  const handleDelete = useCallback((id: string) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteProduct = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/products/${confirmDelete}`);
      setProducts((prev) => prev.filter((p) => p._id !== confirmDelete));
      toast.success('Đã xóa sản phẩm thành công!');
      setConfirmDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xóa sản phẩm thất bại.';
      toast.error(message);
    }
  }, [confirmDelete]);

  const handleToggleHidden = useCallback(async (id: string) => {
    try {
      await api.patch(`/products/${id}/toggle-hidden`);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isHidden: !p.isHidden } : p)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại.';
      toast.error(message);
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
          <button className={styles.retryButton} onClick={() => void fetchProducts(page)}>
            Thử lại
          </button>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return <div className={styles.empty}>Không có sản phẩm phù hợp bộ lọc.</div>;
    }

    // Tính danh sách số trang hiển thị dạng: [current, maybe next, 'dots', last]
    const pages: Array<number | 'dots'> = [];

    if (lastPage && lastPage > 0) {
      const set = new Set<number>();
      set.add(page);
      if (page + 1 <= lastPage) set.add(page + 1);
      set.add(lastPage);

      const sorted = Array.from(set).sort((a, b) => a - b);
      let prevNum: number | null = null;
      for (const num of sorted) {
        if (prevNum !== null && num - prevNum > 1) {
          pages.push('dots');
        }
        pages.push(num);
        prevNum = num;
      }
    } else {
      // Chưa biết trang cuối: chỉ hiển thị trang hiện tại và trang kế tiếp
      pages.push(page);
      pages.push(page + 1);
      pages.push('dots');
    }

    return (
      <>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Hình ảnh</th>
                <th>OB</th>
                <th>Category</th>
                <th>Lượt xem</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>
                    {p.imageUrl ? (
                      <img src={getImageUrl(p.imageUrl)} alt={p.name} className={styles.image} />
                    ) : p.imageBase64 ? (
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
                    <span className={styles.viewsCount}>
                      {(p.views ?? 0).toLocaleString('vi-VN')}
                    </span>
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
                      <Link to={`/admin/edit/${p._id}`} className={`${styles.actionBtn} ${styles.edit}`}>
                        Sửa
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
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

        <div className={styles.pagination}>
          {(() => {
            const canGoPrev = page > 1 && loadState === 'idle';
            const canGoNext =
              loadState === 'idle' && (hasNextPage || (lastPage !== null && page < lastPage));

            return (
              <>
                <button
                  type="button"
                  className={styles.pageButton}
                  disabled={!canGoPrev}
                  onClick={() => void fetchProducts(Math.max(1, page - 1))}
                >
                  ‹
                </button>

                {pages.map((p, idx) =>
                  p === 'dots' ? (
                    <button
                      key={`dots-${idx}`}
                      type="button"
                      className={`${styles.pageButton} ${styles.pageButtonDots}`}
                      disabled
                    >
                      …
                    </button>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.pageButton} ${p === page ? styles.pageButtonActive : ''}`}
                      disabled={p === page || loadState !== 'idle'}
                      onClick={() => void fetchProducts(p)}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className={styles.pageButton}
                  disabled={!canGoNext}
                  onClick={() => void fetchProducts(page + 1)}
                >
                  ›
                </button>
              </>
            );
          })()}
        </div>
      </>
    );
  }, [
    errorMessage,
    fetchProducts,
    filteredProducts,
    handleDelete,
    handleToggleHidden,
    hasNextPage,
    lastPage,
    loadState,
    page,
  ]);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="package" size={28} color="rgba(255, 255, 255, 0.9)" /> Quản lý sản phẩm
        </h1>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? 'Quay lại danh sách' : '+ Thêm sản phẩm'}
        </button>
      </div>

      {showAddForm ? (
        <div className={styles.inlineForm}>
          <AdminProductForm
            inlineMode
            onSuccess={() => {
              setShowAddForm(false);
              void fetchProducts();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : (
        <>
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
        </>
      )}

      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Xác nhận xóa</h3>
            <p className={styles.modalMessage}>Bạn có chắc muốn xóa sản phẩm này?</p>
            <div className={styles.modalActions}>
              <button onClick={confirmDeleteProduct} className={styles.modalConfirmButton}>
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

export default AdminProductList;
