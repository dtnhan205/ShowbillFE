import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import type { AdminLoginResponse } from '../types';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import Icon from '../components/Icons/Icon';
import styles from './Login.module.css';

type SubmitState = 'idle' | 'submitting';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotState, setForgotState] = useState<SubmitState>('idle');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetState, setResetState] = useState<SubmitState>('idle');

  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    if (submitState === 'submitting') return false;
    if (!username.trim()) return false;
    if (!password) return false;
    return true;
  }, [password, submitState, username]);

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (!username.trim() || !password) {
        setError('Vui lòng nhập đầy đủ username và password.');
        return;
      }

      try {
        setSubmitState('submitting');

        const { data } = await api.post<AdminLoginResponse>('/auth/login', {
          username: username.trim(),
          password,
        });

        if (!data?.token) {
          setError('Phản hồi đăng nhập không hợp lệ.');
          return;
        }

        localStorage.setItem('token', data.token);
        // Lưu role để hiển thị menu cho super admin
        if (data.admin?.role) {
          localStorage.setItem('adminRole', data.admin.role);
        } else {
          localStorage.removeItem('adminRole');
        }
        navigate('/admin', { replace: true });
      } catch (err: unknown) {
        let message = 'Đăng nhập thất bại.';

        // Ưu tiên message trả về từ backend (axios error)
        if (err && typeof err === 'object' && 'response' in err) {
          const anyErr = err as any;
          const status = anyErr?.response?.status as number | undefined;
          const backendMessage = anyErr?.response?.data?.message as string | undefined;

          if (backendMessage) {
            message = backendMessage;
          } else if (status === 403) {
            message = 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ admin để biết thêm chi tiết.';
          } else if (status === 401) {
            message = 'Sai tên đăng nhập hoặc mật khẩu';
          }
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
      } finally {
        setSubmitState('idle');
      }
    },
    [navigate, password, username],
  );

  const handleForgotPassword = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!forgotEmail.trim()) {
        toast.error('Vui lòng nhập email');
        return;
      }

      try {
        setForgotState('submitting');
        await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
        toast.success('Đã gửi mã đặt lại mật khẩu qua email. Vui lòng kiểm tra hộp thư của bạn.');
        setShowForgotPassword(false);
        setShowResetPassword(true);
        setResetEmail(forgotEmail.trim());
        setForgotEmail('');
      } catch (err: any) {
        toast.error(err?.message || 'Gửi email thất bại');
      } finally {
        setForgotState('idle');
      }
    },
    [forgotEmail],
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!resetToken.trim()) {
        toast.error('Vui lòng nhập mã xác nhận');
        return;
      }
      if (!resetPassword || resetPassword.length < 6) {
        toast.error('Mật khẩu mới tối thiểu 6 ký tự');
        return;
      }
      if (resetPassword !== resetConfirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }

      try {
        setResetState('submitting');
        await api.post('/auth/reset-password', {
          email: resetEmail,
          token: resetToken.trim(),
          newPassword: resetPassword,
        });
        toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
        setShowResetPassword(false);
        setResetEmail('');
        setResetToken('');
        setResetPassword('');
        setResetConfirmPassword('');
      } catch (err: any) {
        toast.error(err?.message || 'Đặt lại mật khẩu thất bại');
      } finally {
        setResetState('idle');
      }
    },
    [resetEmail, resetToken, resetPassword, resetConfirmPassword],
  );

  return (
    <ClientLayout>
      <div className={styles.page}>
        {!showForgotPassword && !showResetPassword ? (
          <form onSubmit={handleLogin} className={styles.card} noValidate>
            <h2 className={styles.title}>Admin Login</h2>

            {error ? <div className={styles.error}>{error}</div> : null}

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Nhập username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                autoComplete="username"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nhập password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => setShowForgotPassword(true)}
            >
              Quên mật khẩu?
            </button>

            <button type="submit" className={styles.button} disabled={!canSubmit}>
              {submitState === 'submitting' ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        ) : showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className={styles.card} noValidate>
            <h2 className={styles.title}>
              <Icon name="lock" size={24} color="currentColor" style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Quên mật khẩu
            </h2>
            <p className={styles.description}>
              Nhập email của bạn để nhận mã đặt lại mật khẩu
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="forgotEmail">
                Email
              </label>
              <input
                id="forgotEmail"
                type="email"
                placeholder="Nhập email của bạn"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className={styles.input}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                }}
              >
                Quay lại
              </button>
              <button
                type="submit"
                className={styles.button}
                disabled={forgotState === 'submitting' || !forgotEmail.trim()}
              >
                {forgotState === 'submitting' ? 'Đang gửi...' : 'Gửi mã'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className={styles.card} noValidate>
            <h2 className={styles.title}>
              <Icon name="lock" size={24} color="currentColor" style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Đặt lại mật khẩu
            </h2>
            <p className={styles.description}>
              Nhập mã xác nhận đã gửi đến email <strong>{resetEmail}</strong>
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="resetToken">
                Mã xác nhận (6 chữ số)
              </label>
              <input
                id="resetToken"
                type="text"
                placeholder="Nhập mã xác nhận"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={styles.input}
                maxLength={6}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="resetPassword">
                Mật khẩu mới
              </label>
              <input
                id="resetPassword"
                type="password"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className={styles.input}
                autoComplete="new-password"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="resetConfirmPassword">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="resetConfirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                className={styles.input}
                autoComplete="new-password"
                required
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setShowResetPassword(false);
                  setResetEmail('');
                  setResetToken('');
                  setResetPassword('');
                  setResetConfirmPassword('');
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={styles.button}
                disabled={
                  resetState === 'submitting' ||
                  !resetToken.trim() ||
                  !resetPassword ||
                  resetPassword !== resetConfirmPassword
                }
              >
                {resetState === 'submitting' ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </ClientLayout>
  );
};

export default Login;
