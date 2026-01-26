import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Icon from '../components/Icons/Icon';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import api from '../utils/api';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userInfo, setUserInfo] = useState<{ email: string; displayName?: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra đăng nhập và lấy thông tin user
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }

      try {
        // Lấy thông tin admin từ API
        const { data } = await api.get('/admin/profile');
        setIsAuthenticated(true);
        setUserInfo({
          email: data.email,
          displayName: data.displayName || data.username,
        });
        // Tự động điền email và tên từ tài khoản
        setFormData((prev) => ({
          ...prev,
          email: data.email,
          name: data.displayName || data.username || '',
        }));
      } catch (err) {
        // Token không hợp lệ hoặc đã hết hạn
        localStorage.removeItem('token');
        localStorage.removeItem('adminRole');
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      // Không cho phép thay đổi email
      if (name === 'email') {
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      // Kiểm tra đã đăng nhập chưa
      if (!isAuthenticated) {
        setError('Vui lòng đăng nhập để gửi tin nhắn.');
        toast.error('Vui lòng đăng nhập để gửi tin nhắn.');
        navigate('/login');
        return;
      }

      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
        return;
      }

      // Kiểm tra email phải trùng với email tài khoản
      if (userInfo && formData.email.trim().toLowerCase() !== userInfo.email.toLowerCase()) {
        setError('Email phải trùng với email tài khoản của bạn.');
        toast.error('Email phải trùng với email tài khoản của bạn.');
        return;
      }

      try {
        setSubmitState('submitting');
        setError(null);

        // Gửi form đến backend API
        await api.post('/contact', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || undefined,
          message: formData.message.trim(),
        });
        
        setSubmitState('success');
        // Giữ lại email từ tài khoản, chỉ reset các field khác
        setFormData((prev) => ({
          name: prev.name,
          email: prev.email, // Giữ lại email từ tài khoản
          subject: '',
          message: '',
        }));
        toast.success('Tin nhắn đã được gửi thành công!');
        
        setTimeout(() => {
          setSubmitState('idle');
        }, 3000);
      } catch (err: any) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Gửi tin nhắn thất bại. Vui lòng thử lại.';
        
        setError(errorMessage);
        setSubmitState('idle');
        
        // Hiển thị toast error nếu có thông báo từ server
        if (err?.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error(errorMessage);
        }
      }
    },
    [formData, isAuthenticated, userInfo, navigate],
  );

  return (
    <ClientLayout>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.hero}
        >
          <h1 className={styles.title}>
            <Icon name="message" size={40} color="rgba(96, 165, 250, 0.9)" />
            <span>Liên hệ với chúng tôi</span>
          </h1>
          <p className={styles.subtitle}>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi tin nhắn cho chúng tôi!
          </p>
        </motion.div>

        <div className={styles.content}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styles.info}
          >
            <h2 className={styles.infoTitle}>Thông tin liên hệ</h2>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <Icon name="email" size={24} color="rgba(255, 255, 255, 0.9)" />
              </div>
              <div>
                <h3 className={styles.infoLabel}>Email</h3>
                <p className={styles.infoText}>support@showbill.com</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <Icon name="message" size={24} color="rgba(255, 255, 255, 0.9)" />
              </div>
              <div>
                <h3 className={styles.infoLabel}>Hỗ trợ</h3>
                <p className={styles.infoText}>Chúng tôi phản hồi trong vòng 24 giờ</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <Icon name="clock" size={24} color="rgba(255, 255, 255, 0.9)" />
              </div>
              <div>
                <h3 className={styles.infoLabel}>Thời gian</h3>
                <p className={styles.infoText}>Thứ 2 - Thứ 6: 9:00 - 18:00</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <img src="/images/zalo.png" alt="Zalo" className={styles.iconImage} />
              </div>
              <div>
                <h3 className={styles.infoLabel}>Zalo</h3>
                <a
                  href="https://zalo.me/0342031354"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                  onClick={(e) => {
                    // Try to open Zalo app first
                    window.location.href = 'zalo://chat?phone=0342031354';
                    // Also open web link as fallback
                    setTimeout(() => {
                      window.open('https://zalo.me/0342031354', '_blank');
                    }, 250);
                    e.preventDefault();
                  }}
                >
                  0342031354
                </a>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <img src="/images/tiktok.jpg" alt="TikTok" className={styles.iconImage} />
              </div>
              <div>
                <h3 className={styles.infoLabel}>TikTok</h3>
                <a
                  href="https://www.tiktok.com/@thenhanff"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                  onClick={(e) => {
                    // Try to open TikTok app first
                    window.location.href = 'tiktok://user?username=thenhanff';
                    // Also open web link as fallback
                    setTimeout(() => {
                      window.open('https://www.tiktok.com/@thenhanff', '_blank');
                    }, 250);
                    e.preventDefault();
                  }}
                >
                  @thenhanff
                </a>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <img src="/images/Telegram.png" alt="Telegram" className={styles.iconImage} />
              </div>
              <div>
                <h3 className={styles.infoLabel}>Telegram</h3>
                <a
                  href="https://t.me/dtnregedit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                  onClick={(e) => {
                    // Try to open Telegram app first
                    window.location.href = 'tg://resolve?domain=dtnregedit';
                    // Also open web link as fallback
                    setTimeout(() => {
                      window.open('https://t.me/dtnregedit', '_blank');
                    }, 250);
                    e.preventDefault();
                  }}
                >
                  @dtnregedit
                </a>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className={styles.form}
          >
            <h2 className={styles.formTitle}>Gửi tin nhắn</h2>

            {isLoadingAuth ? (
              <div className={styles.infoMessage}>
                <Icon name="clock" size={20} color="rgba(255, 255, 255, 0.7)" style={{ marginRight: 8 }} />
                Đang kiểm tra đăng nhập...
              </div>
            ) : !isAuthenticated ? (
              <div className={styles.warningMessage}>
                <Icon name="alert-circle" size={20} color="rgba(251, 191, 36, 0.9)" style={{ marginRight: 8 }} />
                <div>
                  <strong>Vui lòng đăng nhập để gửi tin nhắn</strong>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                    Chỉ người dùng đã đăng nhập mới có thể gửi tin nhắn liên hệ để đảm bảo an toàn.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className={styles.loginButton}
                    style={{ marginTop: '12px' }}
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            ) : null}

            {error && <div className={styles.error}>{error}</div>}

            {submitState === 'success' && (
              <div className={styles.success}>
                Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.
              </div>
            )}

            {isAuthenticated && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Họ và tên <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email <span className={styles.required}>*</span>
                    <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '8px', opacity: 0.7 }}>
                      (Email từ tài khoản của bạn)
                    </span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.input} ${styles.disabledInput}`}
                    placeholder="your.email@example.com"
                    disabled
                    required
                    title="Email được lấy từ tài khoản đã đăng nhập"
                  />
                </div>
              </>
            )}

            {isAuthenticated && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.label}>
                    Chủ đề
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Chủ đề tin nhắn (tùy chọn)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Tin nhắn <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows={6}
                    placeholder="Nhập tin nhắn của bạn..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitState === 'submitting' || !isAuthenticated}
                  className={styles.submitButton}
                >
                  {submitState === 'submitting'
                    ? 'Đang gửi...'
                    : submitState === 'success'
                    ? 'Đã gửi thành công!'
                    : 'Gửi tin nhắn'}
                </button>
              </>
            )}
          </motion.form>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Contact;

