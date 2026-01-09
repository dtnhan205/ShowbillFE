import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import type { Product } from '../types';
import styles from './AdminDashboard/AdminDashboard.module.css';

type LoadState = 'idle' | 'loading' | 'error';

type MyStats = {
  totalBills: number;
  totalVisibleBills: number;
  totalViews: number;
};

type SystemStats = {
  totalAdmins: number;
  totalBills: number;
  totalViews: number;
};

const RECENT_LIMIT = 8;

const AdminDashboard: React.FC = () => {
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoadState('loading');
      setErrorMessage(null);

      const [myStatsRes, productsRes] = await Promise.all([
        api.get<MyStats>('/admin/stats'),
        api.get<Product[]>('/products/mine'),
      ]);

      setMyStats(myStatsRes.data);

      const list = Array.isArray(productsRes.data) ? productsRes.data : [];
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setProducts(sorted.slice(0, RECENT_LIMIT));

      // Super admin: system stats
      try {
        const sysRes = await api.get<SystemStats>('/admin/system-stats');
        setSystemStats(sysRes.data);
      } catch {
        setSystemStats(null);
      }

      setLoadState('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard.';
      setErrorMessage(message);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const statsCards = useMemo(() => {
    // Super admin view
    if (systemStats) {
      return (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{systemStats.totalAdmins}</div>
            <div className={styles.statLabel}>Tổng Admin</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{systemStats.totalBills}</div>
            <div className={styles.statLabel}>Tổng Bill (tất cả admin)</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{systemStats.totalViews}</div>
            <div className={styles.statLabel}>Tổng lượt xem (tất cả admin)</div>
          </div>
        </div>
      );
    }

    // Normal admin view
    if (myStats) {
      return (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{myStats.totalBills}</div>
            <div className={styles.statLabel}>Tổng Bill đã up</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{myStats.totalViews}</div>
            <div className={styles.statLabel}>Tổng lượt xem</div>
          </div>
        </div>
      );
    }

    return null;
  }, [myStats, systemStats]);

  const content = useMemo(() => {
    if (loadState === 'loading') {
      return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    }

    if (loadState === 'error') {
      return (
        <div className={styles.error}>
          <p>{errorMessage ?? 'Đã xảy ra lỗi.'}</p>
          <button className={styles.retryButton} onClick={() => void fetchAll()}>
            Thử lại
          </button>
        </div>
      );
    }

    return (
      <>
        {statsCards}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Bill gần đây của bạn</h2>
          </div>

          {products.length === 0 ? (
            <div className={styles.noProducts}>Chưa có bill nào.</div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((p) => (
                <div key={p._id} className={styles.productCard}>
                  <img
                    src={p.imageBase64}
                    alt={p.name}
                    className={styles.productImage}
                    loading="lazy"
                  />
                  <p className={styles.productName} title={p.name}>
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }, [errorMessage, fetchAll, loadState, products, statsCards]);

  return <div>{content}</div>;
};

export default AdminDashboard;
