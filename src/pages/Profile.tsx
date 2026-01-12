import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import ClientProductGrid from '../components/ClientProductGrid';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import type { Product } from '../types';
import { base64ToBlobUrl, revokeBlobUrl } from '../utils/imageProtection';
import ScreenshotProtectionOverlay from '../components/ScreenshotProtectionOverlay/ScreenshotProtectionOverlay';
import styles from './Profile.module.css';

type PublicAdmin = {
  _id: string;
  displayName: string;
  bio: string;
  avatarBase64: string;
  role?: string;
  stats?: {
    totalBills: number;
    totalViews: number;
  };
};

type PublicAdminDetail = {
  admin: PublicAdmin;
  obs: string[];
  categories: string[];
  products: Product[];
};

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PublicAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topAdmins, setTopAdmins] = useState<PublicAdmin[]>([]);

  const [ob, setOb] = useState('');
  const [cat, setCat] = useState('');

  const [modal, setModal] = useState<{ open: boolean; img?: string; title?: string; billId?: string }>(
    { open: false },
  );
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Disable body scroll when modal is open
  useEffect(() => {
    if (modal.open) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [modal.open]);

  // Protection: Disable right-click, drag, and keyboard shortcuts
  useEffect(() => {
    if (!modal.open) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+A, F12, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Disable Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Disable Ctrl+A (Select All)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Disable F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Disable Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    document.addEventListener('selectstart', handleSelectStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      document.removeEventListener('selectstart', handleSelectStart, { capture: true });
    };
  }, [modal.open]);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      setData(null); // Reset data khi fetch mới
      const res = await api.get<PublicAdminDetail>(`/public/admins/${id}`);
      setData(res.data);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải trang profile');
      setLoading(false);
    }
  }, [id]);

  // Lấy top admin theo view để hiển thị bên cạnh
  useEffect(() => {
    const fetchTopAdmins = async () => {
      try {
        const res = await api.get<PublicAdmin[]>('/public/admins');
        const list = Array.isArray(res.data) ? res.data : [];
        const top = [...list]
          .filter((a) => (a.stats?.totalViews ?? 0) > 0)
          .sort((a, b) => (b.stats?.totalViews ?? 0) - (a.stats?.totalViews ?? 0))
          .slice(0, 3);
        setTopAdmins(top);
      } catch (err) {
        console.error('[Profile] Failed to fetch top admins:', err);
      }
    };

    void fetchTopAdmins();
  }, []);

  // Reset data và loading khi id thay đổi
  useEffect(() => {
    setData(null);
    setLoading(true);
    setError(null);
  }, [id]);

  // Effect để tăng view cho tất cả bill của admin khi mở trang profile
  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  // Khi đã có dữ liệu admin: tăng view profile + lưu vào "admin gần đây"
  // Effect này chỉ phụ thuộc vào id và data để đảm bảo chạy lại khi id thay đổi
  useEffect(() => {
    if (!id || loading || error || !data) return;

    // Chống double-call: chặn nếu đã tăng view cho cùng admin trong vòng 1 giây
    const storageKey = `adminView:${id}`;
    const now = Date.now();
    const last = Number(sessionStorage.getItem(storageKey) || '0');

    // Nếu đã tăng view gần đây và cùng admin, không tăng lại
    if (now - last < 1000 && data.admin._id === id) {
      return;
    }

    sessionStorage.setItem(storageKey, String(now));

    // Gọi API tăng view
    const incrementViews = async () => {
      try {
        const response = await api.post(`/public/admins/${id}/increment-views`);
        console.log('[Profile] Views incremented successfully for admin:', id, response.data);
        // Refresh top admins sau khi tăng view để cập nhật số liệu
        const res = await api.get<PublicAdmin[]>('/public/admins');
        const list = Array.isArray(res.data) ? res.data : [];
        const top = [...list]
          .filter((a) => (a.stats?.totalViews ?? 0) > 0)
          .sort((a, b) => (b.stats?.totalViews ?? 0) - (a.stats?.totalViews ?? 0))
          .slice(0, 3);
        setTopAdmins(top);
      } catch (err) {
        console.error('[Profile] Failed to increment views:', err);
      }
    };

    void incrementViews();

    // Lưu admin vào danh sách "đã xem gần đây" để trang chủ hiển thị
    try {
      const raw = localStorage.getItem('recentAdmins');
      const parsed = raw ? (JSON.parse(raw) as PublicAdmin[]) : [];
      const withoutCurrent = parsed.filter((a) => a._id !== data.admin._id);
      const next = [
        {
          _id: data.admin._id,
          displayName: data.admin.displayName,
          bio: data.admin.bio,
          avatarBase64: data.admin.avatarBase64,
          role: data.admin.role,
        },
        ...withoutCurrent,
      ].slice(0, 3); // giới hạn 3 admin gần đây
      localStorage.setItem('recentAdmins', JSON.stringify(next));
    } catch (storageErr) {
      console.error('[Profile] Failed to persist recent admins:', storageErr);
    }
  }, [id, data, error, loading]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (modal.img && modal.img.startsWith('blob:')) {
        revokeBlobUrl(modal.img);
      }
    };
  }, [modal.img]);

  const filteredProducts = useMemo(() => {
    const products = data?.products ?? [];
    return products.filter((p) => {
      if (ob && (p.obVersion || '') !== ob) return false;
      if (cat && (p.category || '') !== cat) return false;
      return true;
    });
  }, [cat, data?.products, ob]);

  const openBill = useCallback(
    async (bill: Product) => {
    // Convert base64 to blob URL to hide from Network tab
    const blobUrl = bill.imageBase64 ? base64ToBlobUrl(bill.imageBase64) : '';
    setModal({ open: true, img: blobUrl, title: bill.name, billId: bill._id });
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
    
    // Tăng view cho bill khi mở
    if (bill._id) {
      try {
        // Chống double-call: chặn nếu đã tăng view cho cùng bill trong vòng 2 giây
        const storageKey = `billView:${bill._id}`;
        const now = Date.now();
        const last = Number(sessionStorage.getItem(storageKey) || '0');
        
        if (now - last < 2000) {
          return; // Đã tăng view gần đây, không tăng lại
        }
        
        sessionStorage.setItem(storageKey, String(now));
        
        // Gọi API tăng view cho product
        await api.post(`/public/products/${bill._id}/view`);
        
          // Cập nhật views ngay trên UI mà không cần refetch toàn bộ
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              products: prev.products.map((p) =>
                p._id === bill._id
                  ? {
                      ...p,
                      views: (p.views ?? 0) + 1,
                    }
                  : p,
              ),
            };
          });
      } catch (err) {
        console.error('[Profile] Failed to increment product view:', err);
      }
    }
    },
    [],
  );

  const closeModal = useCallback(() => {
    // Revoke blob URL to free memory
    if (modal.img && modal.img.startsWith('blob:')) {
      revokeBlobUrl(modal.img);
    }
    setModal({ open: false });
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modal.img]);

  const handleImageWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent page scroll
    e.nativeEvent.stopImmediatePropagation();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setImageZoom((prev) => {
      const newZoom = Math.max(0.5, Math.min(3, prev + delta));
      return newZoom;
    });
  }, []);

  const handleImageMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (imageZoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  }, [imageZoom, imagePosition]);

  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && imageZoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, imageZoom]);

  const handleImageMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetZoom = useCallback(() => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, []);

  return (
    <ClientLayout>
      <div className={styles.container}>
        <motion.div
          className={styles.backLink}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" className={styles.backButton}>
            ← Quay lại trang chủ
          </Link>
        </motion.div>

        {loading ? (
          <div className={styles.loading}>Đang tải profile...</div>
        ) : error || !data ? (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={styles.errorText}>{error ?? 'Không có dữ liệu'}</div>
            <button className={styles.retryButton} onClick={() => void fetchDetail()}>
              Thử lại
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              className={styles.profileCard}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.profileAvatar}>
                {data.admin.avatarBase64 ? (
                  <img
                    src={data.admin.avatarBase64}
                    alt={data.admin.displayName}
                    className={styles.avatarImg}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder} />
                )}
              </div>

              <div className={styles.profileInfo}>
                <h1 className={styles.profileName}>{data.admin.displayName}</h1>
                <p className={styles.profileBio}>{data.admin.bio || 'Chưa có mô tả'}</p>
              </div>
            </motion.div>

            <motion.div
              className={styles.filters}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <select
                value={ob}
                onChange={(e) => setOb(e.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả OB</option>
                {data.obs.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>

              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả Category</option>
                {data.categories.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setOb('');
                  setCat('');
                }}
                className={styles.resetButton}
              >
                Reset
              </button>
            </motion.div>

            <div className={styles.contentLayout}>
              <div className={styles.mainColumn}>
                <ClientProductGrid products={filteredProducts} onOpen={openBill} />
              </div>

              <aside className={styles.sideColumn}>
                <section className={styles.sideSection}>
                  <h3 className={styles.sideTitle}>Top Admin nhiều view</h3>
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
              </aside>
            </div>
          </>
        )}

        <AnimatePresence>
          {modal.open && (
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
            >
              <motion.div
                className={styles.modalContent}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>{modal.title}</h2>
                  <div className={styles.modalActions}>
                    {imageZoom !== 1 && (
                      <button
                        type="button"
                        onClick={resetZoom}
                        className={styles.modalResetZoom}
                        aria-label="Reset zoom"
                        title="Reset zoom"
                      >
                        ↻
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closeModal}
                      className={styles.modalClose}
                      aria-label="Đóng"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {modal.img && (
                  <div
                    className={styles.modalImageWrapper}
                    data-protected="true"
                    onWheel={handleImageWheel}
                    onMouseDown={handleImageMouseDown}
                    onMouseMove={handleImageMouseMove}
                    onMouseUp={handleImageMouseUp}
                    onMouseLeave={handleImageMouseUp}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }}
                    style={{ 
                      cursor: imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                      touchAction: 'none',
                      overscrollBehavior: 'contain',
                    }}
                  >
                    <div className={styles.imageProtectionOverlay} />
                    <ScreenshotProtectionOverlay text="ShowBILL.top" opacity={0.15} />
                    <img
                      src={modal.img}
                      alt={modal.title}
                      className={styles.modalImage}
                      style={{
                        transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      draggable={false}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }}
                      onDragStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }}
                      onMouseDown={(e) => {
                        // Prevent text selection
                        if (e.detail > 1) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {imageZoom === 1 && (
                      <div className={styles.zoomHint}>
                        <span>Cuộn chuột để phóng to</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.spacer} />
      </div>
    </ClientLayout>
  );
};

export default Profile;
