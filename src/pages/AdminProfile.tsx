import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { getImageUrl } from '../utils/imageUrl';
import Icon from '../components/Icons/Icon';
import styles from './AdminProfile.module.css';

type Profile = {
  _id: string;
  username: string;
  email: string;
  role: 'super' | 'admin';
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  avatarBase64?: string; // Backward compatibility
  bannerUrl?: string;
  bannerBase64?: string; // Backward compatibility
  avatarFrame?: string;
  activePackage?: string;
};

type LoadState = 'idle' | 'loading' | 'error';

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [avatarFrame, setAvatarFrame] = useState('');

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [saveState, setSaveState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordState, setChangePasswordState] = useState<LoadState>('idle');

  const fetchProfile = useCallback(async () => {
    try {
      setLoadState('loading');
      setError(null);

      const { data } = await api.get<Profile>('/admin/profile');
      setProfile(data);

      // Prefill form fields
      setDisplayName(data.displayName ?? data.username ?? '');
      setBio(data.bio ?? '');
      // Set preview từ URL hoặc base64
      if (data.avatarUrl) {
        setAvatarPreview(getImageUrl(data.avatarUrl));
      } else if (data.avatarBase64) {
        setAvatarPreview(data.avatarBase64);
      } else {
        setAvatarPreview(''); // Clear nếu không có
      }
      
      if (data.bannerUrl) {
        setBannerPreview(getImageUrl(data.bannerUrl));
      } else if (data.bannerBase64) {
        setBannerPreview(data.bannerBase64);
      } else {
        setBannerPreview(''); // Clear nếu không có
      }
      setAvatarFrame(data.avatarFrame ?? '');
      
      // Log để debug
      console.log('[AdminProfile] Loaded profile:', {
        avatarUrl: data.avatarUrl,
        avatarBase64: data.avatarBase64 ? 'exists' : 'none',
        bannerUrl: data.bannerUrl,
        bannerBase64: data.bannerBase64 ? 'exists' : 'none',
        avatarFrame: data.avatarFrame,
      });

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
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }, []);

  const onBannerFile = useCallback((file: File) => {
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setBannerPreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }, []);

  const canSave = useMemo(() => saveState !== 'loading', [saveState]);

  const publicProfileLink = useMemo(() => {
    if (!profile?._id) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/profile/${profile._id}`;
  }, [profile?._id]);

  const copyProfileLink = useCallback(async () => {
    if (!publicProfileLink) return;
    try {
      await navigator.clipboard.writeText(publicProfileLink);
      toast.success('Đã sao chép link hồ sơ');
    } catch {
      toast.error('Không thể sao chép. Hãy copy thủ công.');
    }
  }, [publicProfileLink]);

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

      const formData = new FormData();
      formData.append('displayName', displayName.trim());
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (bannerFile) formData.append('banner', bannerFile);
      formData.append('avatarFrame', avatarFrame);

      const { data } = await api.put<Profile>('/admin/profile', formData);

      setProfile(data);
      
      // Cập nhật preview từ response (nếu có URL mới)
      if (data.avatarUrl) {
        setAvatarPreview(getImageUrl(data.avatarUrl));
        setAvatarFile(null); // Clear file sau khi upload thành công
      } else if (data.avatarBase64) {
        setAvatarPreview(data.avatarBase64);
      } else {
        setAvatarPreview(''); // Clear nếu không có
      }
      
      if (data.bannerUrl) {
        setBannerPreview(getImageUrl(data.bannerUrl));
        setBannerFile(null); // Clear file sau khi upload thành công
      } else if (data.bannerBase64) {
        setBannerPreview(data.bannerBase64);
      } else {
        setBannerPreview(''); // Clear nếu không có
      }
      
      setSaveState('idle');
      toast.success('Cập nhật hồ sơ thành công');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Cập nhật hồ sơ thất bại';
      setError(msg);
      setSaveState('error');
    } finally {
      setSaveState('idle');
    }
  }, [avatarFile, bannerFile, bio, displayName, avatarFrame]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setChangePasswordState('loading');
      
      await api.post('/admin/change-password', {
        currentPassword,
        newPassword,
      });
      
      toast.success('Đổi mật khẩu thành công');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      // Extract error message from response
      let errorMessage = 'Đổi mật khẩu thất bại';
      
      if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.response?.status === 401) {
        errorMessage = 'Mật khẩu hiện tại không đúng';
      } else if (e?.response?.status === 400) {
        errorMessage = e?.response?.data?.message || 'Dữ liệu không hợp lệ';
      } else if (e?.response?.status === 404) {
        errorMessage = 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.';
      } else if (e?.response?.status === 500) {
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      toast.error(errorMessage);
      console.error('[AdminProfile] Change password error:', e);
    } finally {
      setChangePasswordState('idle');
    }
  }, [currentPassword, newPassword, confirmPassword]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="user" size={28} color="rgba(255, 255, 255, 0.9)" /> Hồ sơ Admin
        </h2>
      </div>

      {error ? (
        <div className={styles.error}>{error}</div>
      ) : null}

      {loadState === 'loading' ? <div className={styles.loading}>Đang tải...</div> : null}

      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarPreview}>
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="avatar" 
                onError={() => {
                  console.error('[AdminProfile] Failed to load avatar:', avatarPreview);
                  // Fallback: clear preview nếu load lỗi
                  setAvatarPreview('');
                }}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <span>Chưa có ảnh đại diện</span>
              </div>
            )}
          </div>

          <div className={styles.userInfo}>
            <div className={styles.username}>{profile?.username ?? '...'}</div>
            <div className={styles.email}>{profile?.email ?? ''}</div>
            <div className={styles.role}>Role: {profile?.role ?? '...'}</div>
          </div>

          {/* Change Password Section */}
          <div className={styles.passwordSection}>
            <div className={styles.passwordHeader}>
              <h3 className={styles.passwordTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="lock" size={18} color="rgba(59, 130, 246, 0.8)" />
                Đổi mật khẩu
              </h3>
              {!showChangePassword && (
                <button
                  type="button"
                  className={styles.togglePasswordButton}
                  onClick={() => setShowChangePassword(true)}
                >
                  Đổi mật khẩu
                </button>
              )}
            </div>

            {showChangePassword && (
              <div className={styles.passwordForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    autoComplete="current-password"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Mật khẩu mới</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    autoComplete="new-password"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                  />
                </div>

                <div className={styles.passwordActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={changePasswordState === 'loading'}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={() => void handleChangePassword()}
                    disabled={
                      changePasswordState === 'loading' ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword ||
                      newPassword.length < 6
                    }
                  >
                    {changePasswordState === 'loading' ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên hiển thị</label>
            <input
              className={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="VD: Bomay"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Mô tả ngắn về bạn..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAvatarFile(f);
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Khung avatar</label>
            <div className={styles.framesGrid}>
              <div
                className={`${styles.frameItem} ${avatarFrame === '' ? styles.selected : ''}`}
                onClick={async () => {
                  setAvatarFrame('');
                  // Tự động lưu khi chọn "Không" (xóa khung)
                  try {
                    const formData = new FormData();
                    formData.append('avatarFrame', '');
                    const response = await api.put<Profile>('/admin/profile', formData);
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
                title="Không dùng khung"
              >
                <span className={styles.noFrame}>Không</span>
                {avatarFrame === '' && <div className={styles.frameCheck}>✓</div>}
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
                      className={`${styles.frameItem} ${isSelected ? styles.selected : ''} ${isLocked ? styles.locked : ''}`}
                      onClick={async () => {
                        if (isAvailable) {
                          const newFrame = frame;
                          setAvatarFrame(newFrame);
                          // Tự động lưu khi chọn khung
                          try {
                            const formData = new FormData();
                            formData.append('avatarFrame', newFrame);
                            const response = await api.put<Profile>('/admin/profile', formData);
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
                          // Xác định gói cần thiết cho khung này
                          const framePackage = frame.split('/')[0].toLowerCase();
                          const requiredPackage = framePackage === 'basic' 
                            ? null 
                            : framePackage.charAt(0).toUpperCase() + framePackage.slice(1);
                          const errorMessage = requiredPackage
                            ? `Vui lòng nâng cấp gói ${requiredPackage} để sử dụng khung này.`
                            : 'Vui lòng nâng cấp gói để sử dụng khung này.';
                          toast.error(errorMessage);
                        }
                      }}
                      title={isLocked ? (() => {
                        const framePackage = frame.split('/')[0].toLowerCase();
                        const requiredPackage = framePackage === 'basic' 
                          ? null 
                          : framePackage.charAt(0).toUpperCase() + framePackage.slice(1);
                        return requiredPackage
                          ? `Vui lòng nâng cấp gói ${requiredPackage} để sử dụng`
                          : 'Vui lòng nâng cấp gói để sử dụng';
                      })() : frame}
                    >
                      <img
                        src={`/images/${frame}`}
                        alt={frame}
                      />
                      {isLocked && (
                        <div className={styles.frameLockOverlay}>
                          <Icon name="lock" size={24} color="rgba(255, 255, 255, 0.9)" />
                        </div>
                      )}
                      {isSelected && !isLocked && (
                        <div className={styles.frameCheck}>
                          <Icon name="check" size={14} color="rgba(34, 197, 94, 0.9)" />
                        </div>
                      )}
                    </div>
                  );
                });
              })}
            </div>
            <div className={styles.frameHint}>
              Gói hiện tại: <strong>{profile?.activePackage?.toUpperCase() || 'BASIC'}</strong>. 
              Chỉ có thể chọn khung của gói hiện tại hoặc gói thấp hơn.
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Banner (cho slider)</label>
            {bannerPreview && (
              <div className={styles.bannerPreview}>
                <img src={bannerPreview} alt="banner preview" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onBannerFile(f);
              }}
            />
          </div>

          {publicProfileLink && (
            <div className={styles.shareCard}>
              <div>
                <div className={styles.shareLabel}>Chia sẻ link hồ sơ công khai</div>
                <div className={styles.shareLink} title={publicProfileLink}>
                  {publicProfileLink}
                </div>
              </div>
              <div className={styles.shareActions}>
                <LinkPreviewButton href={publicProfileLink} />
                <button type="button" className={styles.copyButton} onClick={() => void copyProfileLink()}>
                  Sao chép
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className={styles.saveButton}
            disabled={!canSave}
            onClick={() => void save()}
          >
            {saveState === 'loading' ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LinkPreviewButton: React.FC<{ href: string }> = ({ href }) => {
  return (
    <a className={styles.previewButton} href={href} target="_blank" rel="noreferrer">
      Xem hồ sơ
    </a>
  );
};

export default AdminProfile;
