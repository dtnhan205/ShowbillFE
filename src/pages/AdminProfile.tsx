import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

type Profile = {
  _id: string;
  username: string;
  email: string;
  role: 'super' | 'admin';
  displayName?: string;
  bio?: string;
  avatarBase64?: string;
  bannerBase64?: string;
};

type LoadState = 'idle' | 'loading' | 'error';

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [bannerBase64, setBannerBase64] = useState('');

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [saveState, setSaveState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadState('loading');
      setError(null);

      const { data } = await api.get<Profile>('/admin/profile');
      setProfile(data);

      // Prefill form fields
      setDisplayName(data.displayName ?? data.username ?? '');
      setBio(data.bio ?? '');
      setAvatarBase64(data.avatarBase64 ?? '');
      setBannerBase64(data.bannerBase64 ?? '');

      setLoadState('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải hồ sơ');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const onAvatarFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const onBannerFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setBannerBase64(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const canSave = useMemo(() => saveState !== 'loading', [saveState]);

  const save = useCallback(async () => {
    try {
      setSaveState('loading');
      setError(null);

      const { data } = await api.put<Profile>('/admin/profile', {
        displayName: displayName.trim(),
        bio,
        avatarBase64,
        bannerBase64,
      });

      setProfile(data);
      setSaveState('idle');
      alert('Cập nhật hồ sơ thành công');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Cập nhật hồ sơ thất bại';
      setError(msg);
      setSaveState('error');
    } finally {
      setSaveState('idle');
    }
  }, [avatarBase64, bannerBase64, bio, displayName]);

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={{ marginTop: 0, fontWeight: 900 }}>Hồ sơ Admin</h2>

      {error ? (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.12)', color: '#fecaca' }}>
          {error}
        </div>
      ) : null}

      {loadState === 'loading' ? <div>Đang tải...</div> : null}

      <div
        style={{
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(0,0,0,0.25)',
            }}
          >
            {avatarBase64 ? (
              <img src={avatarBase64} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null}
          </div>

          <div>
            <div style={{ fontWeight: 900 }}>{profile?.username ?? '...'}</div>
            <div style={{ color: 'rgba(229,231,255,0.7)' }}>{profile?.email ?? ''}</div>
            <div style={{ color: 'rgba(229,231,255,0.7)' }}>Role: {profile?.role ?? '...'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'rgba(229,231,235,0.75)', fontWeight: 800 }}>Tên hiển thị</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="VD: Bomay"
              style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.95)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'rgba(229,231,255,0.75)', fontWeight: 800 }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Mô tả ngắn về bạn..."
              style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.95)', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'rgba(229,231,235,0.75)', fontWeight: 800 }}>Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAvatarFile(f);
              }}
            />
            <div style={{ marginTop: 6, color: 'rgba(229,231,235,0.6)', fontSize: 13 }}>
              Chọn ảnh để tự convert sang base64.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'rgba(229,231,235,0.75)', fontWeight: 800 }}>Banner (cho slider)</label>
            {bannerBase64 && (
              <div style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.10)' }}>
                <img src={bannerBase64} alt="banner preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onBannerFile(f);
              }}
            />
            <div style={{ marginTop: 6, color: 'rgba(229,231,235,0.6)', fontSize: 13 }}>
              Chọn banner để hiển thị trên trang chủ slider. Khuyến nghị tỷ lệ 16:9 hoặc 21:9.
            </div>
          </div>

          <button
            type="button"
            disabled={!canSave}
            onClick={() => void save()}
            style={{
              marginTop: 6,
              padding: '12px 14px',
              borderRadius: 12,
              border: 0,
              background: '#8a2be2',
              color: '#fff',
              fontWeight: 900,
              cursor: 'pointer',
              opacity: canSave ? 1 : 0.7,
            }}
          >
            {saveState === 'loading' ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
