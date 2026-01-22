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
import toast from 'react-hot-toast';
import { UPGRADE_DISCLAIMER, maskSensitiveText } from '../utils/legal';
import { getImageUrl } from '../utils/imageUrl';
import Icon from '../components/Icons/Icon';

type PublicAdmin = {
  _id: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  avatarBase64?: string; // Backward compatibility
  bannerUrl?: string;
  bannerBase64?: string; // Backward compatibility
  role?: string;
  activePackage?: string;
  packageColor?: string;
  avatarFrame?: string;
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
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportZalo, setReportZalo] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportErrors, setReportErrors] = useState<{
    name?: string;
    zalo?: string;
    reason?: string;
  }>({});

  const [ob, setOb] = useState('');
  const [cat, setCat] = useState('');

  const [modal, setModal] = useState<{ open: boolean; img?: string; title?: string; billId?: string }>(
    { open: false },
  );
  const [currentBillIndex, setCurrentBillIndex] = useState<number>(-1);
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
    // But allow ArrowUp/ArrowDown for navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow arrow keys for navigation (but only if not combined with modifiers)
      if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          // Navigation will be handled by the navigation effect
          return;
        }
      }

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
      
      // Log để debug
      console.log('[Profile] Admin data:', res.data.admin);
      console.log('[Profile] AvatarFrame:', res.data.admin.avatarFrame);
      console.log('[Profile] AvatarFrame type:', typeof res.data.admin.avatarFrame);
      console.log('[Profile] AvatarFrame length:', res.data.admin.avatarFrame?.length);
      
      // Đảm bảo avatarFrame là string
      if (res.data.admin.avatarFrame && typeof res.data.admin.avatarFrame !== 'string') {
        console.warn('[Profile] AvatarFrame is not a string, converting...');
        res.data.admin.avatarFrame = String(res.data.admin.avatarFrame);
      }
      
      setData(res.data);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải trang profile');
      setLoading(false);
    }
  }, [id]);


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
          avatarUrl: data.admin.avatarUrl || data.admin.avatarBase64,
          avatarBase64: data.admin.avatarBase64, // Backward compatibility
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

  // Tính tổng views và số bill
  const stats = useMemo(() => {
    const products = data?.products ?? [];
    const totalViews = products.reduce((sum, p) => sum + (p.views ?? 0), 0);
    const totalBills = products.length;
    return { totalViews, totalBills };
  }, [data?.products]);

  const navigateToBill = useCallback(
    async (newIndex: number) => {
      if (newIndex < 0 || newIndex >= filteredProducts.length) return;

      const bill = filteredProducts[newIndex];
      if (!bill) return;

      // Revoke old blob URL
      setModal((prev) => {
        if (prev.img && prev.img.startsWith('blob:')) {
          revokeBlobUrl(prev.img);
        }
        return prev;
      });

      // Get image URL (prefer imageUrl, fallback to base64)
      let imgUrl = '';
      if (bill.imageUrl) {
        imgUrl = getImageUrl(bill.imageUrl);
      } else if (bill.imageBase64) {
        imgUrl = base64ToBlobUrl(bill.imageBase64);
      }
      setModal({ open: true, img: imgUrl, title: bill.name, billId: bill._id });
      setCurrentBillIndex(newIndex);
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });

      // Tăng view cho bill khi mở
      if (bill._id) {
        try {
          const storageKey = `billView:${bill._id}`;
          const now = Date.now();
          const last = Number(sessionStorage.getItem(storageKey) || '0');

          if (now - last < 2000) {
            return;
          }

          sessionStorage.setItem(storageKey, String(now));
          await api.post(`/public/products/${bill._id}/view`);

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
    [filteredProducts],
  );

  // Keyboard navigation for bill browsing
  useEffect(() => {
    if (!modal.open || currentBillIndex < 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigateToBill(currentBillIndex - 1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          navigateToBill(currentBillIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modal.open, currentBillIndex, navigateToBill]);

  const openBill = useCallback(
    async (bill: Product) => {
      // Find index of the bill in filtered products
      const index = filteredProducts.findIndex((p) => p._id === bill._id);
      setCurrentBillIndex(index >= 0 ? index : -1);

      // Get image URL (prefer imageUrl, fallback to base64)
      let imgUrl = '';
      if (bill.imageUrl) {
        imgUrl = getImageUrl(bill.imageUrl);
      } else if (bill.imageBase64) {
        imgUrl = base64ToBlobUrl(bill.imageBase64);
      }
      setModal({ open: true, img: imgUrl, title: bill.name, billId: bill._id });
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
    [filteredProducts],
  );

  const closeModal = useCallback(() => {
    // Revoke blob URL to free memory
    if (modal.img && modal.img.startsWith('blob:')) {
      revokeBlobUrl(modal.img);
    }
    setModal({ open: false });
    setCurrentBillIndex(-1);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modal.img]);

  const closeReportModal = useCallback(() => {
    setReportModalOpen(false);
    setReportName('');
    setReportZalo('');
    setReportReason('');
    setReportSubmitting(false);
    setReportErrors({});
  }, []);

  // Validation functions
  const validateName = useCallback((name: string): string | undefined => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Vui lòng nhập tên người báo cáo';
    }
    if (trimmed.length < 2) {
      return 'Tên phải có ít nhất 2 ký tự';
    }
    if (trimmed.length > 100) {
      return 'Tên không được quá 100 ký tự';
    }
    return undefined;
  }, []);

  const validateZalo = useCallback((zalo: string): string | undefined => {
    const trimmed = zalo.trim();
    if (!trimmed) {
      return 'Vui lòng nhập số Zalo';
    }
    
    // Loại bỏ các ký tự không phải số để kiểm tra
    const digitsOnly = trimmed.replace(/[\s+\-()]/g, '');
    
    // Kiểm tra format số điện thoại Việt Nam
    // Format 1: 0xxxxxxxxx (10 số, bắt đầu bằng 0)
    // Format 2: 84xxxxxxxxx (11 số, bắt đầu bằng 84)
    // Format 3: +84xxxxxxxxx (có dấu +)
    const vietnamPhonePattern = /^(0|\+84|84)[1-9]\d{8,9}$/;
    
    if (!vietnamPhonePattern.test(digitsOnly)) {
      return 'Số Zalo không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (ví dụ: 0912345678 hoặc +84912345678)';
    }
    
    // Kiểm tra độ dài sau khi loại bỏ ký tự đặc biệt
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      return 'Số điện thoại phải có 10 hoặc 11 chữ số';
    }
    
    return undefined;
  }, []);

  const validateReason = useCallback((reason: string): string | undefined => {
    const trimmed = reason.trim();
    if (!trimmed) {
      return 'Vui lòng nhập lý do báo cáo';
    }
    if (trimmed.length < 10) {
      return 'Lý do báo cáo phải có ít nhất 10 ký tự';
    }
    if (trimmed.length > 1000) {
      return 'Lý do báo cáo không được quá 1000 ký tự';
    }
    return undefined;
  }, []);

  const submitAdminReport = useCallback(async () => {
    if (!data?.admin?._id || reportSubmitting) return;
    
    // Validate tất cả fields
    const nameError = validateName(reportName);
    const zaloError = validateZalo(reportZalo);
    const reasonError = validateReason(reportReason);
    
    // Set errors để hiển thị trên form
    setReportErrors({
      name: nameError,
      zalo: zaloError,
      reason: reasonError,
    });
    
    // Nếu có lỗi, không submit
    if (nameError || zaloError || reasonError) {
      toast.error('Vui lòng kiểm tra lại các thông tin đã nhập');
      return;
    }
    
    try {
      setReportSubmitting(true);
      const res = await api.post<{ message: string }>(`/public/admins/${data.admin._id}/report`, {
        reporterName: reportName.trim(),
        reporterZalo: reportZalo.trim(),
        reason: reportReason.trim(),
      });
      toast.success(res.data?.message || 'Đã gửi báo cáo. Sẽ xử lý trong 24–72 giờ.');
      closeReportModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi báo cáo.');
      setReportSubmitting(false);
    }
  }, [closeReportModal, data?.admin?._id, reportName, reportZalo, reportReason, reportSubmitting, validateName, validateZalo, validateReason]);

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
            <Icon name="back" size={16} className={styles.backIcon} /> Quay lại trang chủ
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                  {(data.admin.avatarUrl || data.admin.avatarBase64) ? (
                    <img
                      src={data.admin.avatarUrl ? getImageUrl(data.admin.avatarUrl) : data.admin.avatarBase64}
                      alt={data.admin.displayName}
                      className={styles.avatarImg}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                  {data.admin.avatarFrame && 
                   typeof data.admin.avatarFrame === 'string' && 
                   data.admin.avatarFrame.trim() !== '' && (
                    <img
                      src={`/images/${data.admin.avatarFrame.trim()}`}
                      alt="Avatar Frame"
                      className={styles.avatarFrame}
                      onError={(e) => {
                        console.error('[Profile] Failed to load frame:', data.admin.avatarFrame);
                        console.error('[Profile] Frame path:', `/images/${data.admin.avatarFrame}`);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('[Profile] Frame loaded successfully:', data.admin.avatarFrame);
                        console.log('[Profile] Frame path:', `/images/${data.admin.avatarFrame}`);
                      }}
                    />
                  )}
                </div>

                <div className={styles.profileInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className={styles.profileBadge}>ShowBill Admin</div>
                    <div 
                      className={styles.packageBadge} 
                      data-package={data.admin.activePackage || 'basic'}
                      style={data.admin.packageColor && data.admin.activePackage !== 'basic' && data.admin.activePackage !== 'pro' && data.admin.activePackage !== 'premium' ? {
                        background: `linear-gradient(135deg, ${data.admin.packageColor}25 0%, ${data.admin.packageColor}20 100%)`,
                        border: `1px solid ${data.admin.packageColor}40`,
                        color: data.admin.packageColor,
                        boxShadow: `0 0 10px ${data.admin.packageColor}30`,
                      } : {}}
                    >
                      {data.admin.activePackage === 'pro' ? 'PRO' : 
                       data.admin.activePackage === 'premium' ? 'PREMIUM' : 
                       data.admin.activePackage === 'basic' ? 'BASIC' :
                       (data.admin.activePackage || 'BASIC').toUpperCase()}
                    </div>
                  </div>
                  <h1 className={styles.profileName}>
                    {maskSensitiveText(data.admin.displayName)}
                    {data.admin.activePackage && data.admin.activePackage !== 'basic' && (
                      <span className={styles.verifiedBadge}>
                        <img
                          src="/images/tichxanh.png"
                          alt="Verified"
                          className={styles.verifiedIcon}
                        />
                      </span>
                    )}
                  </h1>
                  <p className={styles.profileBio}>{maskSensitiveText(data.admin.bio || 'Chưa có mô tả')}</p>
                  <div className={styles.profileActionsRowMobile}>
                    <button
                      type="button"
                      className={styles.reportAdminButton}
                      onClick={() => setReportModalOpen(true)}
                      title="Báo cáo admin (xử lý 24–72 giờ)"
                    >
                      Report Admin
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.profileActionsRow}>
                <button
                  type="button"
                  className={styles.reportAdminButton}
                  onClick={() => setReportModalOpen(true)}
                  title="Báo cáo admin (xử lý 24–72 giờ)"
                >
                  Report Admin
                </button>
              </div>

              <div className={styles.profileStats}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="9" y1="3" x2="9" y2="21"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                    </svg>
                  </div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>{stats.totalBills}</div>
                    <div className={styles.statLabel}>BILLS</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>{stats.totalViews}</div>
                    <div className={styles.statLabel}>LƯỢT XEM</div>
                  </div>
                </div>
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
                  <h2 className={styles.modalTitle}>{modal.title ? maskSensitiveText(modal.title) : ''}</h2>
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
                      <Icon name="close" size={18} color="rgba(255, 255, 255, 0.9)" />
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
                    {/* Navigation arrows */}
                    {filteredProducts.length > 1 && (
                      <>
                        {currentBillIndex > 0 && (
                          <button
                            type="button"
                            className={styles.modalNavButton}
                            style={{ top: '50%', left: '20px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToBill(currentBillIndex - 1);
                            }}
                            aria-label="Bill trước"
                            title="Bill trước (↑)"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 15l-6-6-6 6"/>
                            </svg>
                          </button>
                        )}
                        {currentBillIndex < filteredProducts.length - 1 && (
                          <button
                            type="button"
                            className={styles.modalNavButton}
                            style={{ top: '50%', right: '20px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToBill(currentBillIndex + 1);
                            }}
                            aria-label="Bill sau"
                            title="Bill sau (↓)"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 9l6 6 6-6"/>
                            </svg>
                          </button>
                        )}
                      </>
                    )}

                    <div className={styles.imageProtectionOverlay} />
                    <ScreenshotProtectionOverlay text={data?.admin?.displayName || "ShowBILL.top"} opacity={0.15} />
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
                        {filteredProducts.length > 1 && (
                          <span className={styles.navHint}>↑ ↓ để lướt bill</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {reportModalOpen && data?.admin?._id && (
            <motion.div
              className={styles.reportOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeReportModal}
            >
              <motion.div
                className={styles.reportModal}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.reportHeader}>
                  <div>
                    <div className={styles.reportTitle}>Báo cáo Admin</div>
                    <div className={styles.reportSubtitle}>Hệ thống sẽ xử lý trong 24–72 giờ.</div>
                  </div>
                  <button type="button" className={styles.reportClose} onClick={closeReportModal} aria-label="Đóng">
                    <Icon name="close" size={18} color="rgba(255, 255, 255, 0.9)" />
                  </button>
                </div>

                <div className={styles.reportBody}>
                  <label className={styles.reportLabel} htmlFor="report-name">
                    Tên người báo cáo <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <input
                    id="report-name"
                    type="text"
                    className={`${styles.reportInput} ${reportErrors.name ? styles.reportInputError : ''}`}
                    value={reportName}
                    onChange={(e) => {
                      setReportName(e.target.value);
                      const error = validateName(e.target.value);
                      setReportErrors((prev) => ({ ...prev, name: error }));
                    }}
                    onBlur={(e) => {
                      const error = validateName(e.target.value);
                      setReportErrors((prev) => ({ ...prev, name: error }));
                    }}
                    placeholder="Nhập tên của bạn"
                    maxLength={100}
                    disabled={reportSubmitting}
                  />
                  {reportErrors.name && (
                    <div className={styles.reportError}>{reportErrors.name}</div>
                  )}

                  <label className={styles.reportLabel} htmlFor="report-zalo" style={{ marginTop: '16px' }}>
                    Số Zalo <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <input
                    id="report-zalo"
                    type="text"
                    className={`${styles.reportInput} ${reportErrors.zalo ? styles.reportInputError : ''}`}
                    value={reportZalo}
                    onChange={(e) => {
                      setReportZalo(e.target.value);
                      const error = validateZalo(e.target.value);
                      setReportErrors((prev) => ({ ...prev, zalo: error }));
                    }}
                    onBlur={(e) => {
                      const error = validateZalo(e.target.value);
                      setReportErrors((prev) => ({ ...prev, zalo: error }));
                    }}
                    placeholder="Nhập số Zalo của bạn"
                    maxLength={20}
                    disabled={reportSubmitting}
                  />
                  {reportErrors.zalo && (
                    <div className={styles.reportError}>{reportErrors.zalo}</div>
                  )}

                  <label className={styles.reportLabel} htmlFor="report-reason" style={{ marginTop: '16px' }}>
                    Lý do báo cáo <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <textarea
                    id="report-reason"
                    className={`${styles.reportTextarea} ${reportErrors.reason ? styles.reportTextareaError : ''}`}
                    value={reportReason}
                    onChange={(e) => {
                      setReportReason(e.target.value);
                      const error = validateReason(e.target.value);
                      setReportErrors((prev) => ({ ...prev, reason: error }));
                    }}
                    onBlur={(e) => {
                      const error = validateReason(e.target.value);
                      setReportErrors((prev) => ({ ...prev, reason: error }));
                    }}
                    rows={4}
                    placeholder="Mô tả vấn đề bạn gặp phải (ví dụ: nội dung vi phạm, lộ thông tin cá nhân, ...)"
                    maxLength={1000}
                    disabled={reportSubmitting}
                  />
                  {reportErrors.reason && (
                    <div className={styles.reportError}>{reportErrors.reason}</div>
                  )}
                </div>

                <div className={styles.reportActions}>
                  <button type="button" className={styles.reportCancel} onClick={closeReportModal} disabled={reportSubmitting}>
                    Huỷ
                  </button>
                  <button
                    type="button"
                    className={styles.reportSubmit}
                    onClick={() => void submitAdminReport()}
                    disabled={reportSubmitting}
                  >
                    {reportSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                  </button>
                </div>
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
