import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
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
  avatarFrame?: string;
  activePackage?: string;
};

type LoadState = 'idle' | 'loading' | 'error';

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [bannerBase64, setBannerBase64] = useState('');
  const [avatarFrame, setAvatarFrame] = useState('');

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
      setAvatarFrame(data.avatarFrame ?? '');
      
      // Log để debug
      console.log('[AdminProfile] Loaded avatarFrame:', data.avatarFrame);

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

  // Danh sách frames theo gói
  const framesByPackage: Record<string, string[]> = {
    basic: ['basic/basic1.gif', 'basic/basic2.gif'],
    pro: ['pro/pro1.gif', 'pro/pro2.gif', 'pro/pro4.gif'],
    premium: ['premium/premium1.gif', 'premium/premium3.gif', 'premium/premium4.gif', 'premium/premium6.gif'],
    vip: ['vip/vip1.gif', 'vip/vip2.gif', 'vip/vip3.gif'],
  };


  const save = useCallback(async () => {
    try {
      setSaveState('loading');
      setError(null);

      const { data } = await api.put<Profile>('/admin/profile', {
        displayName: displayName.trim(),
        bio,
        avatarBase64,
        bannerBase64,
        avatarFrame,
      });

      setProfile(data);
      setSaveState('idle');
      toast.success('Cập nhật hồ sơ thành công');
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
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: 'rgba(229,231,235,0.75)', fontWeight: 800 }}>
              Khung avatar
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
              gap: 12,
              marginBottom: 12,
            }}>
              <div
                onClick={async () => {
                  setAvatarFrame('');
                  // Tự động lưu khi chọn "Không" (xóa khung)
                  try {
                    const response = await api.put<Profile>('/admin/profile', {
                      avatarFrame: '',
                    });
                    // Cập nhật profile từ response
                    setProfile(response.data);
                    // Đảm bảo state sync với server
                    if (response.data.avatarFrame !== '') {
                      console.warn('[AdminProfile] AvatarFrame mismatch, refetching...');
                      const updatedProfile = await api.get<Profile>('/admin/profile');
                      setProfile(updatedProfile.data);
                      setAvatarFrame(updatedProfile.data.avatarFrame || '');
                    }
                    toast.success('Đã xóa khung avatar');
                  } catch (e: any) {
                    const errorMsg = e?.response?.data?.message || 'Không thể xóa khung avatar';
                    toast.error(errorMsg);
                    console.error('[AdminProfile] Error removing frame:', e);
                    // Rollback nếu lỗi
                    setAvatarFrame(profile?.avatarFrame || '');
                  }
                }}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 12,
                  border: `2px solid ${avatarFrame === '' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                title="Không dùng khung"
              >
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Không</span>
                {avatarFrame === '' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
              {Object.entries(framesByPackage).map(([pkg, frames]) => {
                const userPackage = (profile?.activePackage || 'basic').toLowerCase();
                const pkgLower = pkg.toLowerCase();
                let isLocked = false;
                
                // Logic theo yêu cầu:
                // - Basic: chỉ mở basic, đóng tất cả trả phí
                // - Pro: mở basic + pro, đóng premium + vip
                // - Premium: mở tất cả (basic + pro + premium + vip)
                // - VIP: mở basic + vip, đóng pro + premium
                
                if (userPackage === 'basic') {
                  // Basic: chỉ mở basic
                  isLocked = pkgLower !== 'basic';
                } else if (userPackage === 'pro') {
                  // Pro: mở basic + pro, đóng premium + vip
                  isLocked = pkgLower !== 'basic' && pkgLower !== 'pro';
                } else if (userPackage === 'premium') {
                  // Premium: mở tất cả
                  isLocked = false;
                } else if (userPackage === 'vip') {
                  // VIP: mở basic + vip, đóng pro + premium
                  isLocked = pkgLower !== 'basic' && pkgLower !== 'vip';
                } else {
                  // Gói tùy chỉnh: chỉ mở frames của chính gói đó
                  isLocked = pkgLower !== userPackage;
                }

                return frames.map((frame) => {
                  const isSelected = avatarFrame === frame;
                  const isAvailable = !isLocked;

                  return (
                    <div
                      key={frame}
                      onClick={async () => {
                        if (isAvailable) {
                          const newFrame = frame;
                          setAvatarFrame(newFrame);
                          // Tự động lưu khi chọn khung
                          try {
                            const response = await api.put<Profile>('/admin/profile', {
                              avatarFrame: newFrame,
                            });
                            // Cập nhật profile từ response
                            setProfile(response.data);
                            // Đảm bảo state sync với server
                            if (response.data.avatarFrame !== newFrame) {
                              console.warn('[AdminProfile] AvatarFrame mismatch, refetching...');
                              const updatedProfile = await api.get<Profile>('/admin/profile');
                              setProfile(updatedProfile.data);
                              setAvatarFrame(updatedProfile.data.avatarFrame || '');
                            }
                            toast.success('Đã cập nhật khung avatar');
                          } catch (e: any) {
                            const errorMsg = e?.response?.data?.message || 'Không thể lưu khung avatar';
                            toast.error(errorMsg);
                            console.error('[AdminProfile] Error saving frame:', e);
                            // Rollback nếu lỗi
                            setAvatarFrame(profile?.avatarFrame || '');
                          }
                        } else {
                          toast.error('Vui lòng nâng cấp gói để sử dụng khung này.');
                        }
                      }}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: 12,
                        border: `2px solid ${isSelected ? '#3b82f6' : isLocked ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        background: isLocked ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.04)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isLocked ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                      title={isLocked ? 'Vui lòng nâng cấp gói để sử dụng' : frame}
                    >
                      <img
                        src={`/images/${frame}`}
                        alt={frame}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          pointerEvents: 'none',
                        }}
                      />
                      {isLocked && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ color: '#ef4444', fontSize: 20 }}>🔒</span>
                        </div>
                      )}
                      {isSelected && !isLocked && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  );
                });
              })}
            </div>
            <div style={{ marginTop: 6, color: 'rgba(229,231,235,0.6)', fontSize: 13 }}>
              Gói hiện tại: <strong>{profile?.activePackage?.toUpperCase() || 'BASIC'}</strong>. 
              Chỉ có thể chọn khung của gói hiện tại hoặc gói thấp hơn.
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
              background: 'linear-gradient(135deg, #0f766e, #f59e0b)',
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
