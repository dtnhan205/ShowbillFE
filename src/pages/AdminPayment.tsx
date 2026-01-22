import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Icon from '../components/Icons/Icon';
import styles from './AdminPayment.module.css';
import { UPGRADE_DISCLAIMER } from '../utils/legal';

type PackageConfig = {
  _id: string;
  packageType: string;
  price: number;
  billLimit: number;
  color?: string;
  descriptions?: string[];
};

type OwnedPackage = {
  packageType: string;
  expiryDate: string;
  purchasedAt: string;
  isActive: boolean;
};

type MyPackage = {
  package: string;
  activePackage: string;
  packageExpiry: string | null;
  billsUploaded: number;
  billLimit: number | null;
  canUpload: boolean;
  ownedPackages?: OwnedPackage[];
};

const AdminPayment: React.FC = () => {
  const [myPackage, setMyPackage] = useState<MyPackage | null>(null);
  const [packages, setPackages] = useState<PackageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myPackageRes, packagesRes] = await Promise.all([
        api.get<MyPackage>('/payment/my-package'),
        api.get<PackageConfig[]>('/payment/packages'),
      ]);
      setMyPackage(myPackageRes.data);
      setPackages(packagesRes.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (packageType: string) => {
    try {
      const packageConfig = packages.find((p) => p.packageType === packageType);
      if (!packageConfig) {
        toast.error('Không tìm thấy gói');
        return;
      }

      const res = await api.post('/payment/create', {
        packageType,
        amount: packageConfig.price,
      });

      toast.success('Đã tạo hóa đơn thanh toán thành công!');
      // Chuyển đến trang thanh toán
      navigate(`/admin/payment/${res.data._id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo hóa đơn';
      toast.error(errorMessage);
    }
  };

  const handleSwitchPackage = async (packageType: string) => {
    try {
      await api.post('/payment/switch-package', { packageType });
      const packageName = packageType === 'basic' ? 'Basic' : packageType.charAt(0).toUpperCase() + packageType.slice(1);
      toast.success(`Đã chuyển sang gói ${packageName}`);
      await fetchData(); // Refresh data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể chuyển đổi gói';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (!myPackage) {
    return <div className={styles.error}>Không thể tải thông tin gói</div>;
  }

  // Lọc bỏ gói basic (miễn phí, không cần mua)
  const availablePackages = packages.filter((p) => p.packageType !== 'basic');

  return (
    <>
      <div className={styles.currentPackage}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="lightning" size={24} color="rgba(251, 191, 36, 0.9)" /> Gói đang sử dụng
        </h2>
        <p style={{ marginTop: 8, marginBottom: 0, color: 'rgba(229,231,235,0.7)', fontWeight: 700, fontSize: 13 }}>
          {UPGRADE_DISCLAIMER}
        </p>
        <div className={styles.packageInfo}>
          <div className={styles.infoItem}>
            <span>Gói:</span>
            <strong>
              {myPackage.activePackage === 'basic'
                ? 'Basic'
                : myPackage.activePackage.charAt(0).toUpperCase() + myPackage.activePackage.slice(1)}
            </strong>
          </div>
          <div className={styles.infoItem}>
            <span>Đã upload:</span>
            <strong>
              {myPackage.billsUploaded} / {myPackage.billLimit === null ? '∞' : myPackage.billLimit}
            </strong>
          </div>
          {myPackage.packageExpiry && (
            <div className={styles.infoItem}>
              <span>Hết hạn:</span>
              <strong>{new Date(myPackage.packageExpiry).toLocaleDateString('vi-VN')}</strong>
            </div>
          )}
        </div>
      </div>

      {myPackage.ownedPackages && myPackage.ownedPackages.length > 0 && (
        <div className={styles.ownedPackages}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="package" size={28} color="rgba(255, 255, 255, 0.9)" /> Gói đã mua
          </h2>
          <div className={styles.packagesGrid}>
            {/* Basic package - luôn có sẵn */}
            <div
              className={`${styles.packageCard} ${styles.basicPackage} ${myPackage.activePackage === 'basic' ? styles.activePackage : ''}`}
            >
              <h3>Gói Basic</h3>
              <div className={styles.price}>Miễn phí</div>
              <div className={styles.features}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Upload 20 bill/tháng
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Vĩnh viễn
                </p>
              </div>
              <button
                onClick={() => handleSwitchPackage('basic')}
                className={styles.switchButton}
                disabled={myPackage.activePackage === 'basic'}
              >
                {myPackage.activePackage === 'basic' ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Đang sử dụng
                  </span>
                ) : (
                  'Chuyển sang Basic'
                )}
              </button>
            </div>

            {/* Owned packages */}
            {myPackage.ownedPackages.map((pkg, index) => {
              const packageConfig = packages.find((p) => p.packageType === pkg.packageType);
              const isExpired = new Date(pkg.expiryDate) <= new Date();
              const isActive = pkg.isActive;

              const getOwnedPackageClass = () => {
                if (pkg.packageType === 'pro') return styles.proPackage;
                if (pkg.packageType === 'premium') return styles.premiumPackage;
                return ''; // Gói tùy chỉnh không có class đặc biệt
              };

              // Màu cho gói (sử dụng màu từ config hoặc màu mặc định)
              const packageColor = packageConfig?.color || '#3b82f6';
              const isCustomPackage = pkg.packageType !== 'pro' && pkg.packageType !== 'premium';

              // Style động cho gói tùy chỉnh
              const customPackageStyle = isCustomPackage ? {
                borderColor: `${packageColor}40`,
                '--package-color': packageColor,
              } as React.CSSProperties : {};

              return (
                <div
                  key={index}
                  className={`${styles.packageCard} ${getOwnedPackageClass()} ${isActive ? styles.activePackage : ''} ${isExpired ? styles.expiredPackage : ''}`}
                  style={customPackageStyle}
                >
                  <h3>Gói {pkg.packageType.charAt(0).toUpperCase() + pkg.packageType.slice(1)}</h3>
                  <div 
                    className={styles.price}
                    style={isCustomPackage ? {
                      background: `linear-gradient(135deg, ${packageColor} 0%, ${packageColor}dd 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : {}}
                  >
                    {packageConfig ? `${packageConfig.price.toLocaleString()} VNĐ` : 'Đã mua'}
                  </div>
                  <div className={styles.features}>
                    {packageConfig?.descriptions && packageConfig.descriptions.length > 0 ? (
                      packageConfig.descriptions.map((desc, idx) => (
                        <p key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> {desc}
                        </p>
                      ))
                    ) : (
                      <>
                        <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Upload {packageConfig?.billLimit === -1 ? 'không giới hạn' : `${packageConfig?.billLimit} bill`}/tháng
                        </p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Hết hạn: {new Date(pkg.expiryDate).toLocaleDateString('vi-VN')}
                        </p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Mua ngày: {new Date(pkg.purchasedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </>
                    )}
                  </div>
                  {isExpired ? (
                    <div className={styles.expiredBadge}>Đã hết hạn</div>
                  ) : (
                    <button
                      onClick={() => handleSwitchPackage(pkg.packageType)}
                      className={styles.switchButton}
                      disabled={isActive}
                    >
                      {isActive ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Đang sử dụng
                        </span>
                      ) : (
                        'Chuyển sang gói này'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.upgradeSection}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="rocket" size={28} color="rgba(255, 255, 255, 0.9)" /> Nâng cấp gói
        </h2>
        <p style={{ marginTop: 8, marginBottom: 16, color: 'rgba(229,231,235,0.7)', fontWeight: 700, fontSize: 13 }}>
          {UPGRADE_DISCLAIMER}
        </p>
        <div className={styles.packagesGrid}>
          {availablePackages.map((pkg) => {
            // Kiểm tra xem đã mua gói này chưa (còn hạn)
            const hasPackage = myPackage.ownedPackages?.some(
              (owned) => owned.packageType === pkg.packageType && new Date(owned.expiryDate) > new Date()
            );
            const isActive = myPackage.activePackage === pkg.packageType;
            const isDisabled = hasPackage || isActive;

            // Xác định class CSS dựa trên tên gói
            const getPackageClass = () => {
              if (pkg.packageType === 'pro') return styles.proPackage;
              if (pkg.packageType === 'premium') return styles.premiumPackage;
              return ''; // Gói tùy chỉnh không có class đặc biệt
            };

            // Format tên gói (viết hoa chữ cái đầu)
            const packageName = pkg.packageType.charAt(0).toUpperCase() + pkg.packageType.slice(1);

            // Màu cho gói (sử dụng màu từ config hoặc màu mặc định)
            const packageColor = pkg.color || '#3b82f6';
            const isCustomPackage = pkg.packageType !== 'pro' && pkg.packageType !== 'premium';

            // Style động cho gói tùy chỉnh
            const customPackageStyle = isCustomPackage ? {
              borderColor: `${packageColor}40`,
              '--package-color': packageColor,
            } as React.CSSProperties : {};

            return (
              <div
                key={pkg._id}
                className={`${styles.packageCard} ${getPackageClass()} ${isDisabled ? styles.ownedPackage : ''}`}
                style={customPackageStyle}
              >
                <h3>Gói {packageName}</h3>
                <div 
                  className={styles.price}
                  style={isCustomPackage ? {
                    background: `linear-gradient(135deg, ${packageColor} 0%, ${packageColor}dd 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : {}}
                >
                  {pkg.price.toLocaleString()} VNĐ
                </div>
                <div className={styles.features}>
                  {pkg.descriptions && pkg.descriptions.length > 0 ? (
                    pkg.descriptions.map((desc, idx) => (
                      <p key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> {desc}
                      </p>
                    ))
                  ) : (
                    <>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Upload {pkg.billLimit === -1 ? 'không giới hạn' : `${pkg.billLimit} bill`}/tháng
                      </p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" /> Thời hạn: 1 tháng
                      </p>
                    </>
                  )}
                </div>
                {hasPackage && !isActive && (
                  <div className={styles.ownedBadge}>Đã mua gói này</div>
                )}
                <button
                  onClick={() => handleCreatePayment(pkg.packageType)}
                  className={styles.upgradeButton}
                  disabled={isDisabled}
                >
                  {isActive ? 'Đang sử dụng' : hasPackage ? 'Đã mua' : `Nâng cấp ${packageName}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.upgradeSection}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="refresh-cw" size={28} color="rgba(255, 255, 255, 0.9)" /> Hoàn tiền
        </h2>
        <div style={{ color: 'rgba(229,231,235,0.75)', fontWeight: 700, lineHeight: 1.6 }}>
          <p style={{ marginTop: 0 }}>
            Không hoàn tiền khi vi phạm Terms hoặc dùng vào scam; hoàn tiền khi lỗi hệ thống nghiêm trọng.
          </p>
          <p style={{ marginBottom: 0 }}>
            Trường hợp cần hỗ trợ, vui lòng liên hệ để được xử lý trong 24–72 giờ.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminPayment;

