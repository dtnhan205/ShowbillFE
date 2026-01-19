import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Icon from '../components/Icons/Icon';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
        return;
      }

      try {
        setSubmitState('submitting');
        // TODO: Gửi form đến backend API
        // await api.post('/contact', formData);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        setSubmitState('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        setTimeout(() => {
          setSubmitState('idle');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gửi tin nhắn thất bại. Vui lòng thử lại.');
        setSubmitState('idle');
      }
    },
    [formData],
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
          <h1 className={styles.title}>Liên hệ với chúng tôi</h1>
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
              <div className={styles.infoIcon}>📧</div>
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

            {error && <div className={styles.error}>{error}</div>}

            {submitState === 'success' && (
              <div className={styles.success}>
                Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.
              </div>
            )}

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
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="your.email@example.com"
                required
              />
            </div>

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
              disabled={submitState === 'submitting'}
              className={styles.submitButton}
            >
              {submitState === 'submitting'
                ? 'Đang gửi...'
                : submitState === 'success'
                ? 'Đã gửi thành công!'
                : 'Gửi tin nhắn'}
            </button>
          </motion.form>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Contact;

