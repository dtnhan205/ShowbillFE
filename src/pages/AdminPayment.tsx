import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import styles from './AdminPayment.module.css';

type PackageConfig = {
  _id: string;
  packageType: 'basic' | 'pro' | 'premium';
  price: number;
  billLimit: number;
};

type MyPackage = {
  package: 'basic' | 'pro' | 'premium';
  packageExpiry: string | null;
  billsUploaded: number;
  billLimit: number | null;
  canUpload: boolean;
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

  const handleCreatePayment = async (packageType: 'pro' | 'premium') => {
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

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (!myPackage) {
    return <div className={styles.error}>Không thể tải thông tin gói</div>;
  }

  const proPackage = packages.find((p) => p.packageType === 'pro');
  const premiumPackage = packages.find((p) => p.packageType === 'premium');

  return (
    <>
      <div className={styles.currentPackage}>
        <h2>Gói hiện tại của bạn</h2>
        <div className={styles.packageInfo}>
          <div className={styles.infoItem}>
            <span>Gói:</span>
            <strong>
              {myPackage.package === 'basic'
                ? 'Basic'
                : myPackage.package === 'pro'
                ? 'Pro'
                : 'Premium'}
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

      <div className={styles.upgradeSection}>
        <h2>Nâng cấp gói</h2>
        <div className={styles.packagesGrid}>
          {proPackage && (
            <div className={styles.packageCard}>
              <h3>Gói Pro</h3>
              <div className={styles.price}>{proPackage.price.toLocaleString()} VNĐ</div>
              <div className={styles.features}>
                <p>✓ Upload {proPackage.billLimit} bill/tháng</p>
                <p>✓ Thời hạn: 1 tháng</p>
              </div>
              <button
                onClick={() => handleCreatePayment('pro')}
                className={styles.upgradeButton}
                disabled={!!(myPackage.package === 'pro' && myPackage.packageExpiry && new Date(myPackage.packageExpiry) > new Date())}
              >
                {myPackage.package === 'pro' && myPackage.packageExpiry && new Date(myPackage.packageExpiry) > new Date()
                  ? 'Đang sử dụng'
                  : 'Nâng cấp Pro'}
              </button>
            </div>
          )}

          {premiumPackage && (
            <div className={styles.packageCard}>
              <h3>Gói Premium</h3>
              <div className={styles.price}>{premiumPackage.price.toLocaleString()} VNĐ</div>
              <div className={styles.features}>
                <p>✓ Upload không giới hạn</p>
                <p>✓ Thời hạn: 1 tháng</p>
              </div>
              <button
                onClick={() => handleCreatePayment('premium')}
                className={styles.upgradeButton}
                disabled={!!(myPackage.package === 'premium' && myPackage.packageExpiry && new Date(myPackage.packageExpiry) > new Date())}
              >
                {myPackage.package === 'premium' && myPackage.packageExpiry && new Date(myPackage.packageExpiry) > new Date()
                  ? 'Đang sử dụng'
                  : 'Nâng cấp Premium'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPayment;

