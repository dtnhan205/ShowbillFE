import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import styles from './PaymentHistory.module.css';

type Payment = {
  _id: string;
  packageType: 'pro' | 'premium';
  amount: number;
  transferContent: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
  bankAccountId: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
};

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get<Payment[]>('/payment/history');
      setPayments(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeletePayment = async () => {
    if (!confirmDelete) return;

    try {
      setDeletingId(confirmDelete);
      await api.delete(`/payment/${confirmDelete}`);
      toast.success('Đã xóa đơn thành công!');
      await fetchPayments();
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa đơn');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePayNow = (id: string) => {
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

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const completedPayments = payments.filter((p) => p.status === 'completed');
  const expiredPayments = payments.filter((p) => p.status === 'expired');

  if (loading) {
    return <div className={styles.loading}>Đang tải lịch sử thanh toán...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Lịch sử thanh toán</h2>
        <div className={styles.summary}>
          <span>Tổng: {payments.length}</span>
          <span className={styles.pendingCount}>Chưa thanh toán: {pendingPayments.length}</span>
        </div>
      </div>

      {pendingPayments.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Đơn chưa thanh toán ({pendingPayments.length})</h3>
          <div className={styles.paymentsList}>
            {pendingPayments.map((payment) => (
              <div key={payment._id} className={styles.paymentCard}>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentHeader}>
                    <h4>Gói {getPackageName(payment.packageType)}</h4>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className={styles.paymentDetails}>
                    <div className={styles.detailItem}>
                      <span>Số tiền:</span>
                      <strong>{payment.amount.toLocaleString()} VNĐ</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Nội dung CK:</span>
                      <strong>{payment.transferContent}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Ngân hàng:</span>
                      <strong>{payment.bankAccountId.bankName}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Ngày tạo:</span>
                      <strong>{new Date(payment.createdAt).toLocaleString('vi-VN')}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Hết hạn:</span>
                      <strong>{new Date(payment.expiresAt).toLocaleString('vi-VN')}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.paymentActions}>
                  <button
                    onClick={() => handlePayNow(payment._id)}
                    className={styles.payButton}
                  >
                    Thanh toán ngay
                  </button>
                  <button
                    onClick={() => handleDelete(payment._id)}
                    className={styles.deleteButton}
                    disabled={deletingId === payment._id}
                  >
                    {deletingId === payment._id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedPayments.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Đơn đã thanh toán ({completedPayments.length})</h3>
          <div className={styles.paymentsList}>
            {completedPayments.map((payment) => (
              <div key={payment._id} className={`${styles.paymentCard} ${styles.completedCard}`}>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentHeader}>
                    <h4>Gói {getPackageName(payment.packageType)}</h4>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className={styles.paymentDetails}>
                    <div className={styles.detailItem}>
                      <span>Số tiền:</span>
                      <strong>{payment.amount.toLocaleString()} VNĐ</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Nội dung CK:</span>
                      <strong>{payment.transferContent}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Ngày thanh toán:</span>
                      <strong>
                        {payment.completedAt
                          ? new Date(payment.completedAt).toLocaleString('vi-VN')
                          : 'N/A'}
                      </strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Ngày tạo:</span>
                      <strong>{new Date(payment.createdAt).toLocaleString('vi-VN')}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiredPayments.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Đơn đã hết hạn ({expiredPayments.length})</h3>
          <div className={styles.paymentsList}>
            {expiredPayments.map((payment) => (
              <div key={payment._id} className={`${styles.paymentCard} ${styles.expiredCard}`}>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentHeader}>
                    <h4>Gói {getPackageName(payment.packageType)}</h4>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className={styles.paymentDetails}>
                    <div className={styles.detailItem}>
                      <span>Số tiền:</span>
                      <strong>{payment.amount.toLocaleString()} VNĐ</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Nội dung CK:</span>
                      <strong>{payment.transferContent}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Ngày tạo:</span>
                      <strong>{new Date(payment.createdAt).toLocaleString('vi-VN')}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Hết hạn:</span>
                      <strong>{new Date(payment.expiresAt).toLocaleString('vi-VN')}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.paymentActions}>
                  <button
                    onClick={() => handleDelete(payment._id)}
                    className={styles.deleteButton}
                    disabled={deletingId === payment._id}
                  >
                    {deletingId === payment._id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 && (
        <div className={styles.empty}>
          <p>Bạn chưa có đơn thanh toán nào.</p>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Xác nhận xóa</h3>
            <p className={styles.modalMessage}>Bạn có chắc muốn xóa đơn này?</p>
            <div className={styles.modalActions}>
              <button onClick={confirmDeletePayment} className={styles.modalConfirmButton}>
                Xóa
              </button>
              <button onClick={() => setConfirmDelete(null)} className={styles.modalCancelButton}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

