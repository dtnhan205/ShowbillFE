import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import type { AdminLoginResponse } from '../types';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import styles from './Login.module.css';

type SubmitState = 'idle' | 'submitting';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

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

  return (
    <ClientLayout>
      <div className={styles.page}>
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

          <button type="submit" className={styles.button} disabled={!canSubmit}>
            {submitState === 'submitting' ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </ClientLayout>
  );
};

export default Login;
