import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import styles from './Login.module.css';

type SubmitState = 'idle' | 'submitting';

type RegisterResponse = {
  message: string;
  token: string;
  admin: {
    _id: string;
    username: string;
    email: string;
    displayName?: string;
    role?: string;
  };
};

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    if (submitState === 'submitting') return false;
    if (!username.trim()) return false;
    if (!email.trim()) return false;
    if (!password) return false;
    return true;
  }, [email, password, submitState, username]);

  const handleRegister = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      try {
        setSubmitState('submitting');

        const { data } = await api.post<RegisterResponse>('/auth/register', {
          username: username.trim(),
          email: email.trim(),
          password,
        });

        if (!data?.token) {
          setError('Phản hồi đăng ký không hợp lệ.');
          return;
        }

        localStorage.setItem('token', data.token);
        // Lưu role nếu có
        if (data.admin?.role) {
          localStorage.setItem('adminRole', data.admin.role);
        } else {
          localStorage.removeItem('adminRole');
        }
        navigate('/', { replace: true });
      } catch (err: unknown) {
        let message = 'Đăng ký thất bại.';

        // Ưu tiên message trả về từ backend (axios error)
        if (err && typeof err === 'object' && 'response' in err) {
          const anyErr = err as any;
          const status = anyErr?.response?.status as number | undefined;
          const backendMessage = anyErr?.response?.data?.message as string | undefined;

          if (backendMessage) {
            message = backendMessage;
          } else if (status === 409) {
            message = 'Tên đăng nhập hoặc email đã tồn tại.';
          } else if (status === 400) {
            message = 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.';
          }
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
      } finally {
        setSubmitState('idle');
      }
    },
    [email, navigate, password, username],
  );

  return (
    <ClientLayout>
      <div className={styles.page}>
        <form onSubmit={handleRegister} className={styles.card} noValidate>
          <h2 className={styles.title}>Admin Register</h2>

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
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              autoComplete="email"
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
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={!canSubmit}>
            {submitState === 'submitting' ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div style={{ marginTop: 14, textAlign: 'center', color: 'rgba(229,231,235,0.75)', fontSize: 14 }}>
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              style={{
                color: '#fbbf24',
                fontWeight: 800,
              }}
            >
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
};

export default Register;

