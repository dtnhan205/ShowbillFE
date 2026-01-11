import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const AdminLayout: React.FC<Props> = ({ title = 'Admin', children }) => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
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
            to="/admin/add"
            className={`${styles.navItem} ${isActive('/admin/add') ? styles.navItemActive : ''}`}
          >
            Thêm sản phẩm
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
            <Link
              to="/admin/users"
              className={`${styles.navItem} ${isActive('/admin/users') ? styles.navItemActive : ''}`}
            >
              Quản lý Admin
            </Link>
          )}

          <Link
            to="/admin/profile"
            className={`${styles.navItem} ${isActive('/admin/profile') ? styles.navItemActive : ''}`}
          >
            Hồ sơ
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
          <h1 className={styles.pageTitle}>{title}</h1>
        </div>

        <div className={styles.content}>{children}</div>

        <footer className={styles.mainFooter}>
          <div className={styles.mainFooterInner}>
            <p className={styles.mainFooterText}>
              © {new Date().getFullYear()} ShowBill Admin. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
