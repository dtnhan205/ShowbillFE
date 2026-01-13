import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import CursorTrail from '../CursorTrail/CursorTrail';
import ParticleNetwork from '../ParticleNetwork/ParticleNetwork';
import styles from './ClientLayout.module.css';

type Props = {
  children: React.ReactNode;
  showHeader?: boolean;
};

type AdminProfile = {
  _id: string;
  username: string;
  displayName?: string;
  avatarBase64?: string;
};

const ClientLayout: React.FC<Props> = ({ children, showHeader = true }) => {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAdminProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAdminProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get<AdminProfile>('/admin/profile');
      setAdminProfile(data);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('adminRole');
      setAdminProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdminProfile();
  }, [fetchAdminProfile]);

  // Scroll to top when route changes (but not on hash changes or query params)
  useEffect(() => {
    // Only scroll if pathname actually changed, not just a re-render
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Global protection: Disable common image theft methods
  useEffect(() => {
    // Disable right-click on images globally
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('[data-protected="true"]')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable drag on images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('[data-protected="true"]')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminRole');
    setAdminProfile(null);
    navigate('/');
  };

  return (
    <div className={styles.layout}>
      <ParticleNetwork connectionDistance={200} particleSpeed={0.25} enabled={true} />
      <CursorTrail />
      {showHeader && (
        <header className={styles.header}>
          <div className={styles.headerBg} />
          <div className={styles.headerGrid} />
          <div className={styles.headerBlob1} />
          <div className={styles.headerBlob2} />

          <div className={styles.headerInner}>
            <Link to="/" className={styles.logo}>
              <img src="/images/logoweb.png" alt="ShowBill" className={`${styles.logoImage} ${styles.logoMobile}`} />
              <img src="/images/logowebpc.png" alt="ShowBill" className={`${styles.logoImage} ${styles.logoDesktop}`} />
            </Link>
            <nav className={styles.nav}>
              <Link to="/" className={styles.navLink}>
                Trang chủ
              </Link>
              <Link to="/about" className={styles.navLink}>
                Giới thiệu
              </Link>
              <Link to="/contact" className={styles.navLink}>
                Liên hệ
              </Link>
              {adminProfile && (
                <Link to="/admin" className={styles.navLink}>
                  Admin
                </Link>
              )}
            </nav>
            <div className={styles.authSection}>
              {loading ? (
                <div className={styles.loading}>...</div>
              ) : adminProfile ? (
                <div className={styles.adminInfo}>
                  <Link to="/admin" className={styles.adminLink}>
                    {adminProfile.avatarBase64 && (
                      <img
                        src={adminProfile.avatarBase64}
                        alt={adminProfile.displayName || adminProfile.username}
                        className={styles.adminAvatar}
                      />
                    )}
                    <span className={styles.adminName}>
                      {adminProfile.displayName || adminProfile.username}
                    </span>
                  </Link>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link to="/register" className={styles.authButton}>
                    Đăng ký admin
                  </Link>
                  <Link to="/login" className={`${styles.authButton} ${styles.authButtonPrimary}`}>
                    Đăng nhập admin
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className={styles.headerFade} />
        </header>
      )}

      <main className={`${styles.main} ${location.pathname === '/' ? styles.noHeaderPadding : ''}`}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerBg} />
        <div className={styles.footerContainer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerTitle}>ShowBill</h3>
              <p className={styles.footerDescription}>
                Nền tảng chia sẻ và quản lý bill cho cộng đồng. Giúp bạn khẳng định thương hiệu và tạo niềm tin với khách hàng.
              </p>
              <div className={styles.socialLinks}>
                <a
                  href="https://zalo.me/0342031354"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Zalo"
                >
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 0-.315.063-.471.112-.786.196-1.569.405-2.35.618-.196.053-.4.1-.6.15-.05.012-.1.025-.15.038-.4.1-.8.2-1.2.3-.1.025-.2.05-.3.075-.4.1-.8.2-1.2.3-.05.012-.1.025-.15.038-.2.05-.4.1-.6.15-.781.213-1.564.422-2.35.618-.156.05-.302.112-.471.112a.96.96 0 0 0-.321.063c-.1.05-.2.1-.25.2-.05.1-.05.2-.05.3 0 .1.05.2.1.3.05.1.1.15.2.2.1.05.2.1.3.1.169 0 .315-.063.471-.112.786-.196 1.569-.405 2.35-.618.2-.05.4-.1.6-.15.05-.013.1-.026.15-.038.4-.1.8-.2 1.2-.3.1-.025.2-.05.3-.075.4-.1.8-.2 1.2-.3.05-.013.1-.026.15-.038.2-.05.4-.1.6-.15.781-.213 1.564-.422 2.35-.618.156-.05.302-.112.471-.112.1 0 .2-.05.3-.1.1-.05.15-.1.2-.2.05-.1.1-.2.1-.3 0-.1-.05-.2-.05-.3-.05-.1-.1-.15-.2-.2a.96.96 0 0 0-.321-.063z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@thenhanff"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="TikTok"
                >
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a
                  href="https://t.me/dtnregedit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Telegram"
                >
                  <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Liên kết</h4>
              <nav className={styles.footerNav}>
                <Link to="/" className={styles.footerLink}>
                  Trang chủ
                </Link>
                <Link to="/about" className={styles.footerLink}>
                  Giới thiệu
                </Link>
                <Link to="/contact" className={styles.footerLink}>
                  Liên hệ
                </Link>
              </nav>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Tài khoản</h4>
              <nav className={styles.footerNav}>
                <Link to="/register" className={styles.footerLink}>
                  Đăng ký admin
                </Link>
                <Link to="/login" className={styles.footerLink}>
                  Đăng nhập admin
                </Link>
              </nav>
            </div>

            <div className={styles.footerSection}>
              <h4 className={styles.footerSubtitle}>Hỗ trợ</h4>
              <nav className={styles.footerNav}>
              <Link to="/terms" className={styles.footerLink}>
                  Điều khoản
                </Link>
                <Link to="/guide" className={styles.footerLink}>
                  Hướng dẫn sử dụng
                </Link>
                <Link to="/privacy" className={styles.footerLink}>
                  Chính sách bảo mật
                </Link>
                
              </nav>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.footerCopyright}>
                © {new Date().getFullYear()} ShowBill. Tất cả quyền được bảo lưu.
              </p>
              <div className={styles.footerBottomLinks}>
                <Link to="/terms" className={styles.footerBottomLink}>Điều khoản</Link>
                <span className={styles.footerDivider}>•</span>
                <Link to="/privacy" className={styles.footerBottomLink}>Bảo mật</Link>
                <span className={styles.footerDivider}>•</span>
                <a href="#" className={styles.footerBottomLink}>Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;

