import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import CursorTrail from '../CursorTrail/CursorTrail';
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminRole');
    setAdminProfile(null);
    navigate('/');
  };

  return (
    <div className={styles.layout}>
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
              <a
                href="/#all-admins"
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/#all-admins');
                  } else {
                    const element = document.getElementById('all-admins');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
              >
                Tất cả admin
              </a>
              <Link to="/contact" className={styles.navLink}>
                Liên hệ
              </Link>
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

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default ClientLayout;

