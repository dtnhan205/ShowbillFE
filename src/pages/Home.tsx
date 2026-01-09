import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import Banner from '../components/Banner/Banner';
import styles from './Home.module.css';

type PublicAdminItem = {
  _id: string;
  displayName: string;
  bio: string;
  avatarBase64: string;
  stats?: {
    totalBills: number;
    totalViews: number;
  };
};

const Home: React.FC = () => {
  const [admins, setAdmins] = useState<PublicAdminItem[]>([]);
  const [query, setQuery] = useState('');
  const [recentAdmins, setRecentAdmins] = useState<PublicAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<PublicAdminItem[]>('/public/admins');
      setAdmins(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải danh sách admin');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  // Scroll to all-admins section if hash is present
  useEffect(() => {
    if (window.location.hash === '#all-admins') {
      setTimeout(() => {
        const element = document.getElementById('all-admins');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, []);

  // Load admin đã xem gần đây từ localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recentAdmins');
      if (!raw) return;
      const parsed = JSON.parse(raw) as PublicAdminItem[];
      setRecentAdmins(parsed);
    } catch {
      // ignore
    }
  }, []);

  // Lọc theo search
  const filteredAdmins = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) => {
      const name = a.displayName?.toLowerCase() ?? '';
      const bio = a.bio?.toLowerCase() ?? '';
      return name.includes(q) || bio.includes(q);
    });
  }, [admins, query]);

  // Top admin theo view (lấy từ danh sách đã lọc sẵn để khớp search)
  const topAdmins = useMemo(
    () =>
      [...admins]
        .filter((a) => (a.stats?.totalViews ?? 0) > 0)
        .sort((a, b) => (b.stats?.totalViews ?? 0) - (a.stats?.totalViews ?? 0))
        .slice(0, 3), // tối đa 3 admin top view
    [admins],
  );

  return (
    <ClientLayout>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Banner />
        </motion.div>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className={styles.title}>Danh sách Admin</h1>
            <p className={styles.subtitle}>Chọn admin để xem bill đã up</p>
          </div>
          <div className={styles.searchBox}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm admin theo tên, mô tả..."
              className={styles.searchInput}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : error ? (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.errorText}>{error}</div>
            <button className={styles.retryButton} onClick={() => void fetchAdmins()}>
              Thử lại
            </button>
          </motion.div>
        ) : (
          <>
            <section className={styles.sideSection}>
              <h3 className={styles.sideTitle}>Top Admin theo lượt xem</h3>
              {topAdmins.length === 0 ? (
                <p className={styles.sideEmpty}>Chưa có dữ liệu lượt xem.</p>
              ) : (
                <ul className={styles.sideList}>
                  {topAdmins.map((a, idx) => (
                    <li key={a._id} className={styles.sideItem}>
                      <Link to={`/profile/${a._id}`} className={styles.sideLink}>
                        <span className={styles.sideRank}>#{idx + 1}</span>
                        <div className={styles.sideAvatar}>
                          {a.avatarBase64 ? (
                            <img src={a.avatarBase64} alt={a.displayName} />
                          ) : (
                            <div className={styles.sideAvatarPlaceholder} />
                          )}
                        </div>
                        <div className={styles.sideMeta}>
                          <span className={styles.sideName}>{a.displayName}</span>
                          <span className={styles.sideStat}>
                            {a.stats?.totalViews ?? 0} lượt xem • {a.stats?.totalBills ?? 0} bill
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {recentAdmins.length > 0 && (
              <section className={styles.sideSection}>
                <h3 className={styles.sideTitle}>Admin xem gần đây</h3>
                <ul className={styles.sideList}>
                  {recentAdmins.map((a) => (
                    <li key={a._id} className={styles.sideItem}>
                      <Link to={`/profile/${a._id}`} className={styles.sideLink}>
                        <div className={styles.sideAvatarSmall}>
                          {a.avatarBase64 ? (
                            <img src={a.avatarBase64} alt={a.displayName} />
                          ) : (
                            <div className={styles.sideAvatarPlaceholder} />
                          )}
                        </div>
                        <div className={styles.sideMeta}>
                          <span className={styles.sideName}>{a.displayName}</span>
                          <span className={styles.sideStat}>Nhấn để xem lại bill</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section id="all-admins" className={styles.mainSection}>
              <h3 className={styles.mainTitle}>Tất cả admin</h3>
              <div className={styles.grid}>
                {filteredAdmins.map((a, idx) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                  >
                    <Link to={`/profile/${a._id}`} className={styles.card}>
                      <div className={styles.cardAvatar}>
                        {a.avatarBase64 ? (
                          <img src={a.avatarBase64} alt={a.displayName} className={styles.avatarImg} />
                        ) : (
                          <div className={styles.avatarPlaceholder} />
                        )}
                      </div>

                      <div className={styles.cardBody}>
                        <h3 className={styles.cardName}>{a.displayName}</h3>
                        <p className={styles.cardBio}>{a.bio || 'Chưa có mô tả'}</p>
                        <div className={styles.cardStats}>
                          <span className={styles.statBadge}>
                            Bills: {a.stats?.totalBills ?? 0}
                          </span>
                          <span className={styles.statBadge}>
                            Views: {a.stats?.totalViews ?? 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {filteredAdmins.length === 0 && (
                  <div className={styles.emptySearch}>
                    <p className={styles.emptySearchTitle}>Không tìm thấy admin phù hợp</p>
                    <p className={styles.emptySearchText}>Thử đổi từ khóa hoặc xóa bộ lọc tìm kiếm.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <div className={styles.spacer} />
      </div>
    </ClientLayout>
  );
};

export default Home;

