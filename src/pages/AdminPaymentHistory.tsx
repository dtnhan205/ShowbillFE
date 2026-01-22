import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Icon from '../components/Icons/Icon';
import styles from './PaymentHistory.module.css';

type Payment = {
  _id: string;
  packageType: string;
  amount: number;
  transferContent: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
  adminId: {
    _id: string;
    username: string;
    email: string;
    displayName?: string;
  };
  bankAccountId: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const AdminPaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    packageType: '',
    startDate: '',
    endDate: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, [page, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.packageType) params.append('packageType', filters.packageType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await api.get<{ payments: Payment[]; pagination: Pagination }>(
        `/payment/admin/history?${params.toString()}`
      );
      setPayments(res.data.payments);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset về trang 1 khi filter thay đổi
  };

  const handleViewDetail = (id: string) => {
    navigate(`/admin/payment/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className={`${styles.statusBadge} ${styles.completed}`}>Đã thanh toán</span>;
      case 'pending':
        return <span className={`${styles.statusBadge} ${styles.pending}`}>Chưa thanh toán</span>;
      case 'expired':
        return <span className={`${styles.statusBadge} ${styles.expired}`}>Đã hết hạn</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  const getPackageName = (packageType: string) => {
    return packageType.charAt(0).toUpperCase() + packageType.slice(1);
  };

  if (loading && payments.length === 0) {
    return <div className={styles.loading}>Đang tải lịch sử thanh toán...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="history" size={28} color="rgba(255, 255, 255, 0.9)" /> Lịch sử giao dịch (Tất cả Admin)
        </h2>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.filterSelect}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chưa thanh toán</option>
          <option value="completed">Đã thanh toán</option>
          <option value="expired">Đã hết hạn</option>
        </select>

        <select
          value={filters.packageType}
          onChange={(e) => handleFilterChange('packageType', e.target.value)}
          className={styles.filterSelect}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          <option value="">Tất cả gói</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          placeholder="Từ ngày"
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '14px',
          }}
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          placeholder="Đến ngày"
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '14px',
          }}
        />

        <button
          onClick={() => {
            setFilters({ status: '', packageType: '', startDate: '', endDate: '' });
            setPage(1);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Summary Stats */}
      {pagination && (
        <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ padding: '12px 20px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>Tổng số giao dịch</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{pagination.total}</div>
          </div>
          <div style={{ padding: '12px 20px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>Trang hiện tại</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
              {pagination.page} / {pagination.totalPages}
            </div>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className={styles.noPayments}>Không có giao dịch nào.</div>
      ) : (
        <>
          <div className={styles.paymentsList}>
            {payments.map((payment) => (
              <div key={payment._id} className={styles.paymentCard}>
                <div className={styles.paymentHeader}>
                  <div>
                    <h3 className={styles.paymentTitle}>
                      Gói {getPackageName(payment.packageType)}
                    </h3>
                    <p className={styles.paymentAdmin}>
                      Admin: <strong>{payment.adminId?.displayName || payment.adminId?.username || 'N/A'}</strong> ({payment.adminId?.email || 'N/A'})
                    </p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className={styles.paymentDetails}>
                  <div className={styles.detailRow}>
                    <span>Số tiền:</span>
                    <strong>{payment.amount.toLocaleString('vi-VN')} VNĐ</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Nội dung CK:</span>
                    <strong>{payment.transferContent}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Ngân hàng:</span>
                    <strong>{payment.bankAccountId?.bankName || 'N/A'}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Tạo lúc:</span>
                    <strong>{new Date(payment.createdAt).toLocaleString('vi-VN')}</strong>
                  </div>
                  {payment.completedAt && (
                    <div className={styles.detailRow}>
                      <span>Hoàn thành:</span>
                      <strong>{new Date(payment.completedAt).toLocaleString('vi-VN')}</strong>
                    </div>
                  )}
                  {payment.status === 'pending' && (
                    <div className={styles.detailRow}>
                      <span>Hết hạn:</span>
                      <strong>{new Date(payment.expiresAt).toLocaleString('vi-VN')}</strong>
                    </div>
                  )}
                </div>

                <div className={styles.paymentActions}>
                  <button
                    onClick={() => handleViewDetail(payment._id)}
                    className={styles.viewButton}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: page === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                Trước
              </button>
              <span style={{ padding: '8px 16px', color: '#fff', display: 'flex', alignItems: 'center' }}>
                Trang {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: page === pagination.totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPaymentHistory;

