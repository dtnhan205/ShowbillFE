import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import styles from './PaymentDetail.module.css';

type Payment = {
  _id: string;
  packageType: 'pro' | 'premium';
  amount: number;
  transferContent: string;
  status: 'pending' | 'completed' | 'expired';
  bankAccountId: {
    _id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  createdAt: string;
  expiresAt: string;
};

const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  useEffect(() => {
    if (payment && payment.status === 'pending') {
      generateQRCode();
      // Bắt đầu polling khi payment status là pending
      setIsPolling(true);
    } else if (payment && payment.status === 'completed') {
      // Dừng polling khi đã thanh toán thành công
      setIsPolling(false);
    }
  }, [payment]);

  // Polling mỗi 10 giây để kiểm tra trạng thái thanh toán
  useEffect(() => {
    if (!isPolling || !id) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await api.get<Payment>(`/payment/${id}`);
        const updatedPayment = res.data;

        setPayment((prevPayment) => {
          if (!prevPayment) return updatedPayment;

          // Nếu status thay đổi từ pending sang completed
          if (prevPayment.status === 'pending' && updatedPayment.status === 'completed') {
            setIsPolling(false);
            toast.success('Thanh toán thành công! Gói của bạn đã được kích hoạt.', {
              duration: 5000,
            });
            // Redirect sau 3 giây
            setTimeout(() => {
              navigate('/admin/payment');
            }, 3000);
            return updatedPayment;
          }

          // Nếu status thay đổi sang expired
          if (updatedPayment.status === 'expired' && prevPayment.status !== 'expired') {
            setIsPolling(false);
            toast.error('Hóa đơn đã hết hạn.');
            return updatedPayment;
          }

          // Cập nhật payment data
          return updatedPayment;
        });
      } catch (err) {
        console.error('Error polling payment status:', err);
        // Không hiển thị toast để tránh spam
      }
    }, 10000); // Mỗi 10 giây

    return () => {
      clearInterval(intervalId);
    };
  }, [isPolling, id, navigate]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get<Payment>(`/payment/${id}`);
      setPayment(res.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin thanh toán';
      toast.error(errorMessage);
      navigate('/admin/payment');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = () => {
    if (!payment) return;

    // Sử dụng VietQR API để tạo QR code
    // Format: https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact2.jpg?amount={amount}&addInfo={content}&accountName={accountName}
    const bankCode = getBankCode(payment.bankAccountId.bankName);
    const accountNumber = payment.bankAccountId.accountNumber;
    const amount = payment.amount;
    const content = payment.transferContent;
    const accountName = payment.bankAccountId.accountHolder;

    // VietQR API format với accountName
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
    setQrCodeUrl(qrUrl);
  };

  // Helper: Map tên ngân hàng sang bank code của VietQR (lowercase)
  const getBankCode = (bankName: string): string => {
    const bankMap: Record<string, string> = {
      'Vietcombank': 'vcb',
      'Vietinbank': 'ctg',
      'BIDV': 'bid',
      'Agribank': 'vba',
      'Techcombank': 'tcb',
      'MBBank': 'mbbank',
      'MB Bank': 'mbbank',
      'ACB': 'acb',
      'VPBank': 'vpb',
      'TPBank': 'tpb',
      'Sacombank': 'stb',
      'HDBank': 'hdb',
      'DongA Bank': 'dab',
      'Eximbank': 'eib',
      'SHB': 'shb',
      'OCB': 'ocb',
      'SeABank': 'ssb',
      'VIB': 'vib',
      'VietABank': 'vab',
      'ABBank': 'abb',
      'Nam A Bank': 'nab',
      'PGBank': 'pgb',
      'PublicBank': 'pbv',
      'Bac A Bank': 'bab',
      'SCB': 'scb',
      'VietBank': 'vccb',
      'Kienlongbank': 'klb',
      'GPBank': 'gpb',
      'BaoVietBank': 'bvb',
      'VietCapitalBank': 'vcb',
    };

    // Tìm bank code (case insensitive)
    for (const [name, code] of Object.entries(bankMap)) {
      if (bankName.toLowerCase().includes(name.toLowerCase())) {
        return code;
      }
    }

    // Default: vcb (Vietcombank)
    return 'vcb';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào clipboard!', { duration: 2000 });
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (!payment) {
    return <div className={styles.error}>Không tìm thấy hóa đơn</div>;
  }

  return (
    <div className={styles.paymentContainer}>
        {payment.status === 'completed' && (
          <div className={styles.successMessage}>
            <h2>✓ Thanh toán thành công!</h2>
            <p>Gói của bạn đã được kích hoạt.</p>
          </div>
        )}

        {payment.status === 'expired' && (
          <div className={styles.errorMessage}>
            <h2>Hóa đơn đã hết hạn</h2>
            <p>Vui lòng tạo hóa đơn mới để thanh toán.</p>
          </div>
        )}

        {payment.status === 'pending' && (
          <>
            <div className={styles.paymentInfo}>
              <h2>Thông tin thanh toán</h2>
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span>Gói:</span>
                  <strong>{payment.packageType === 'pro' ? 'Pro' : 'Premium'}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Số tiền:</span>
                  <strong>{payment.amount.toLocaleString()} VNĐ</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Hết hạn:</span>
                  <strong>{new Date(payment.expiresAt).toLocaleString('vi-VN')}</strong>
                </div>
              </div>
            </div>

            <div className={styles.bankInfo}>
              <h2>Thông tin chuyển khoản</h2>
              <div className={styles.bankCard}>
                <div className={styles.bankDetail}>
                  <div className={styles.detailRow}>
                    <span>Ngân hàng:</span>
                    <strong>{payment.bankAccountId.bankName}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Số tài khoản:</span>
                    <div className={styles.copyable}>
                      <strong>{payment.bankAccountId.accountNumber}</strong>
                      <button onClick={() => copyToClipboard(payment.bankAccountId.accountNumber)}>
                        📋
                      </button>
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Chủ tài khoản:</span>
                    <strong>{payment.bankAccountId.accountHolder}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Nội dung CK:</span>
                    <div className={styles.copyable}>
                      <strong>{payment.transferContent}</strong>
                      <button onClick={() => copyToClipboard(payment.transferContent)}>
                        📋
                      </button>
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Số tiền:</span>
                    <strong>{payment.amount.toLocaleString()} VNĐ</strong>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className={styles.qrCode}>
                    <h3>Quét mã QR để thanh toán</h3>
                    <img src={qrCodeUrl} alt="QR Code" className={styles.qrImage} />
                    <p className={styles.qrNote}>
                      Quét mã QR bằng ứng dụng ngân hàng để chuyển khoản nhanh chóng
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.note}>
              <h3>Lưu ý:</h3>
              <ul>
                <li>Vui lòng chuyển khoản đúng số tiền và nội dung chuyển khoản</li>
                <li>Hệ thống sẽ tự động kiểm tra thanh toán mỗi 10 giây</li>
                <li>Gói của bạn sẽ được kích hoạt ngay sau khi thanh toán thành công</li>
                <li>Hóa đơn sẽ hết hạn sau 24 giờ nếu chưa thanh toán</li>
              </ul>
              {isPolling && (
                <div className={styles.pollingIndicator}>
                  <span className={styles.pollingDot}></span>
                  Đang kiểm tra thanh toán...
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
};

export default PaymentDetail;

