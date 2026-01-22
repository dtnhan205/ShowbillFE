import React, { useMemo, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CursorTrail from '../CursorTrail/CursorTrail';
import styles from './AdminLayout.module.css';
import { PLATFORM_DISCLAIMER } from '../../utils/legal';
import Icon from '../Icons/Icon';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const AdminLayout: React.FC<Props> = ({ title = 'Admin', children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const isSuperAdmin = useMemo(() => {
    try {
      const raw = localStorage.getItem('adminRole');
      return raw === 'super';
    } catch {
      return false;
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminRole');
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => activePath === path;

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className={styles.layout}>
      <CursorTrail />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>
            <span className={styles.brandAccent}>Show</span>Bill Admin
          </h1>
        </div>

        <nav className={styles.nav}>
          <Link
            to="/admin"
            className={`${styles.navItem} ${isActive('/admin') ? styles.navItemActive : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/products"
            className={`${styles.navItem} ${isActive('/admin/products') ? styles.navItemActive : ''}`}
          >
            Sản phẩm
          </Link>

          <Link
            to="/admin/obs"
            className={`${styles.navItem} ${isActive('/admin/obs') ? styles.navItemActive : ''}`}
          >
            Quản lý OB
          </Link>
          <Link
            to="/admin/categories"
            className={`${styles.navItem} ${isActive('/admin/categories') ? styles.navItemActive : ''}`}
          >
            Quản lý Category
          </Link>

          {isSuperAdmin && (
            <>
              <Link
                to="/admin/users"
                className={`${styles.navItem} ${isActive('/admin/users') ? styles.navItemActive : ''}`}
              >
                Quản lý Admin
              </Link>
              <Link
                to="/admin/packages"
                className={`${styles.navItem} ${isActive('/admin/packages') ? styles.navItemActive : ''}`}
              >
                Quản lý Gói & Ngân hàng
              </Link>
              <Link
                to="/admin/reports"
                className={`${styles.navItem} ${isActive('/admin/reports') ? styles.navItemActive : ''}`}
              >
                Report Admin
              </Link>
            </>
          )}

          <Link
            to="/admin/payment"
            className={`${styles.navItem} ${isActive('/admin/payment') ? styles.navItemActive : ''}`}
          >
            Nâng cấp Gói
          </Link>
          <Link
            to="/admin/payment/history"
            className={`${styles.navItem} ${isActive('/admin/payment/history') ? styles.navItemActive : ''}`}
          >
            Lịch sử thanh toán
          </Link>
          {isSuperAdmin && (
            <Link
              to="/admin/payment/admin/history"
              className={`${styles.navItem} ${isActive('/admin/payment/admin/history') ? styles.navItemActive : ''}`}
            >
              Lịch sử giao dịch (Tất cả)
            </Link>
          )}

          <Link
            to="/admin/profile"
            className={`${styles.navItem} ${isActive('/admin/profile') ? styles.navItemActive : ''}`}
          >
            Hồ sơ
          </Link>
          <Link
            to="/admin/guide"
            className={`${styles.navItem} ${isActive('/admin/guide') ? styles.navItemActive : ''}`}
          >
            Cách dùng
          </Link>
        </nav>

        <div className={styles.footer}>
          <Link to="/" className={styles.clientButton}>
            Truy cập trang client
          </Link>
          <button type="button" onClick={logout} className={styles.logoutButton}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <Icon name="menu" size={24} />
          </button>
          <h1 className={styles.pageTitle}>{title}</h1>
        </div>

        <div className={styles.content}>{children}</div>

        <footer className={styles.mainFooter}>
          <div className={styles.mainFooterInner}>
            <p className={styles.mainFooterText}>
              © {new Date().getFullYear()} ShowBill Admin. All rights reserved.
            </p>
            <p className={styles.mainFooterText} style={{ marginTop: 8 }}>
              {PLATFORM_DISCLAIMER}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
