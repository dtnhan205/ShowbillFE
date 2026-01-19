import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons/Icon';
import styles from './AdminGuide.module.css';

const AdminGuide: React.FC = () => {
  const quickSteps = [
    {
      title: '1. Chuẩn bị hồ sơ',
      description: 'Cập nhật ảnh đại diện, tên hiển thị và mô tả tại mục Hồ sơ trước khi chia sẻ link công khai.',
      action: { to: '/admin/profile', label: 'Đi tới Hồ sơ' },
    },
    {
      title: '2. Thêm OB & Category',
      description: 'Vào Quản lý OB/Category để tạo danh mục trước khi upload, giúp tìm kiếm và duyệt nhanh hơn.',
      action: { to: '/admin/obs', label: 'Thêm OB/Category' },
    },
    {
      title: '3. Tạo bill',
      description: 'Chọn Sản phẩm → Thêm sản phẩm, điền tên, chọn OB/Category vừa tạo và tải ảnh bill rõ nét.',
      action: { to: '/admin/add', label: 'Thêm sản phẩm' },
    },
    {
      title: '4. Chia sẻ hồ sơ',
      description: 'Sau khi tạo bill, vào trang hồ sơ để chia sẻ link công khai.',
      action: { to: '/admin/profile', label: 'Hồ sơ' },
    },
    {
      title: '5. Nâng cấp gói',
      description: 'Khi cần upload nhiều hơn, vào Nâng cấp Gói để chọn Pro/Premium hoặc gói tùy chỉnh.',
      action: { to: '/admin/payment', label: 'Nâng cấp' },
    },
  ];

  const management = [
    {
      title: 'Quản lý OB',
      detail: 'Thêm/chỉnh sửa phiên bản OB để khách tìm kiếm nhanh hơn.',
      link: { to: '/admin/obs', label: 'Mở Quản lý OB' },
    },
    {
      title: 'Quản lý Category',
      detail: 'Tạo category rõ ràng để phân loại bill theo dịch vụ/sản phẩm.',
      link: { to: '/admin/categories', label: 'Mở Category' },
    },
    {
      title: 'Gói & Ngân hàng (Super Admin)',
      detail: 'Cấu hình giá gói, giới hạn bill và tài khoản ngân hàng nhận tiền.',
      link: { to: '/admin/packages', label: 'Cấu hình' },
    },
  ];

  const tips = [
    'Ảnh bill nên rõ nét, không dán watermark cá nhân để tránh bị từ chối.',
    'Tận dụng Dashboard để xem lượt xem/bill theo tuần-tháng-năm và điều chỉnh nội dung.',
    'Khi hết giới hạn upload, chuyển sang gói Pro/Premium để tránh gián đoạn.',
    'Chia sẻ link profile công khai tới khách: /profile/<ID> trong mục Hồ sơ.',
    'Nếu thấy cảnh báo bảo vệ ảnh, hãy giữ nguyên vì đó là lớp bảo vệ mặc định.',
  ];

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div>
          <p className={styles.kicker}>Hướng dẫn nhanh</p>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="book" size={32} color="rgba(255, 255, 255, 0.9)" /> Cách dùng ShowBill cho Admin
          </h1>
          <p className={styles.subtitle}>
            Tổng hợp các bước quan trọng để bắt đầu đăng bill, quản lý danh mục và nâng cấp gói mà không bỏ sót bước nào.
          </p>
          <div className={styles.heroActions}>
            <Link to="/admin/add" className={styles.primaryAction}>
              Tạo bill ngay
            </Link>
            <Link to="/admin/payment" className={styles.secondaryAction}>
              Nâng cấp gói
            </Link>
          </div>
        </div>
        <div className={styles.heroCard}>
          <p className={styles.heroLabel}>Lưu ý quan trọng</p>
          <ul className={styles.heroList}>
            <li>• Bill chờ duyệt sẽ không hiển thị công khai.</li>
            <li>• Đừng quên bổ sung OB/Category trước khi upload hàng loạt.</li>
            <li>• Lịch sử thanh toán nằm tại mục Lịch sử thanh toán.</li>
          </ul>
          <Link to="/admin/payment/history" className={styles.linkInline}>
            Xem lịch sử thanh toán <Icon name="forward" size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
          </Link>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>Bắt đầu</p>
            <h2 className={styles.sectionTitle}>5 bước cơ bản</h2>
          </div>
          <Link to="/admin/products" className={styles.textLink}>
            Mở danh sách sản phẩm <Icon name="forward" size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
          </Link>
        </div>
        <div className={styles.cardsGrid}>
          {quickSteps.map((step) => (
            <div key={step.title} className={styles.card}>
              <div className={styles.cardTitle}>{step.title}</div>
              <p className={styles.cardText}>{step.description}</p>
              <Link to={step.action.to} className={styles.cardAction}>
                {step.action.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>Quản lý nội dung</p>
            <h2 className={styles.sectionTitle}>Danh mục & cấu hình</h2>
          </div>
        </div>
        <div className={styles.cardsGrid}>
          {management.map((item) => (
            <div key={item.title} className={styles.card}>
              <div className={styles.cardTitle}>{item.title}</div>
              <p className={styles.cardText}>{item.detail}</p>
              <Link to={item.link.to} className={styles.cardAction}>
                {item.link.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>Tips</p>
            <h2 className={styles.sectionTitle}>Mẹo vận hành trơn tru</h2>
          </div>
          <Link to="/admin" className={styles.textLink}>
            Xem Dashboard <Icon name="forward" size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
          </Link>
        </div>
        <ul className={styles.tipsList}>
          {tips.map((tip) => (
            <li key={tip} className={styles.tipItem}>
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminGuide;

