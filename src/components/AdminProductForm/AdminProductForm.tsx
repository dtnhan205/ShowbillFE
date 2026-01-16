import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import type { Product } from '../../types';
import type { ObVersion, Category } from '../../types/adminMeta';
import styles from './AdminProductForm.module.css';

type LoadState = 'idle' | 'loading' | 'error';
type RouteParams = { id?: string };

const AdminProductForm: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [obVersion, setObVersion] = useState('');
  const [category, setCategory] = useState('');
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');

  // API states
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [submitState, setSubmitState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch data states
  const [obVersions, setObVersions] = useState<ObVersion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      previews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [preview, previews]);

  // Fetch product data for edit mode
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoadState('loading');
        setErrorMessage(null);

        const { data } = await api.get<Product[]>(`/products`);
        const found = Array.isArray(data) ? data.find((p) => p._id === id) : undefined;

        if (!found) {
          setErrorMessage('Không tìm thấy sản phẩm.');
          setLoadState('error');
          return;
        }

        setName(found.name ?? '');
        setPreview(found.imageBase64 ?? '');
        setObVersion(found.obVersion ?? '');
        setCategory(found.category ?? '');
        setLoadState('idle');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu sản phẩm.';
        setErrorMessage(message);
        setLoadState('error');
      }
    };

    void fetchProduct();
  }, [id]);

  // Fetch OB versions and categories
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setIsLoadingMeta(true);
        const [obsRes, catsRes] = await Promise.all([
          api.get<ObVersion[]>('/obs'),
          api.get<Category[]>('/categories'),
        ]);
        setObVersions(Array.isArray(obsRes.data) ? obsRes.data : []);
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      } catch (e) {
        console.error('Failed to load meta data', e);
      } finally {
        setIsLoadingMeta(false);
      }
    };

    void fetchMeta();
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleMultipleImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Clean up old previews
    previews.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    const newNames = files.map((file, index) => {
      // Extract name from filename (remove extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      return nameWithoutExt || `Bill ${index + 1}`;
    });

    setImages(files);
    setPreviews(newPreviews);
    setFileNames(newNames);
  }, [previews]);

  const handleFileNameChange = useCallback((index: number, newName: string) => {
    setFileNames((prev) => {
      const updated = [...prev];
      updated[index] = newName;
      return updated;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    // Revoke URL
    if (previews[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(previews[index]);
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  }, [previews]);

  const isSubmitDisabled = useMemo(() => {
    if (submitState === 'loading') return true;
    if (!obVersion || !category) return true;
    if (isEdit) {
      // Edit mode: only need name if updating name
      return false;
    }
    // Create mode
    if (uploadMode === 'single') {
      if (!name.trim()) return true;
      if (!image) return true;
    } else {
      if (images.length === 0) return true;
      if (fileNames.some((n) => !n.trim())) return true;
    }
    return false;
  }, [submitState, name, obVersion, category, isEdit, image, uploadMode, images, fileNames]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!obVersion || !category) {
        toast.error('Vui lòng chọn OB và Category');
        return;
      }

      // Edit mode - single file
      if (isEdit) {
        if (!name.trim()) {
          toast.error('Vui lòng nhập tên sản phẩm');
          return;
        }

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('obVersion', obVersion);
        formData.append('category', category);
        if (image) formData.append('image', image);

        try {
          setSubmitState('loading');
          setErrorMessage(null);
          await api.put(`/products/${id}`, formData);
          toast.success('Cập nhật sản phẩm thành công!');
          navigate('/admin/products');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm.';
          setErrorMessage(message);
          setSubmitState('error');
          toast.error(message);
        } finally {
          setSubmitState('idle');
        }
        return;
      }

      // Create mode - single file
      if (uploadMode === 'single') {
        if (!name.trim()) {
          toast.error('Vui lòng nhập tên sản phẩm');
          return;
        }

        if (!image) {
          toast.error('Vui lòng chọn hình ảnh');
          return;
        }

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('obVersion', obVersion);
        formData.append('category', category);
        formData.append('image', image);

        try {
          setSubmitState('loading');
          setErrorMessage(null);
          await api.post('/products', formData);
          toast.success('Thêm sản phẩm thành công!');
          navigate('/admin/products');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm.';
          setErrorMessage(message);
          setSubmitState('error');
          toast.error(message);
        } finally {
          setSubmitState('idle');
        }
        return;
      }

      // Create mode - multiple files
      if (images.length === 0) {
        toast.error('Vui lòng chọn ít nhất một hình ảnh');
        return;
      }

      if (fileNames.some((n) => !n.trim())) {
        toast.error('Vui lòng nhập tên cho tất cả các bill');
        return;
      }

      const formData = new FormData();
      formData.append('names', JSON.stringify(fileNames.map((n) => n.trim())));
      formData.append('obVersion', obVersion);
      formData.append('category', category);
      images.forEach((file) => {
        formData.append('images', file);
      });

      try {
        setSubmitState('loading');
        setErrorMessage(null);
        const response = await api.post('/products/bulk', formData);
        toast.success(`Đã upload thành công ${response.data.count} bill!`);
        navigate('/admin/products');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi upload bill.';
        setErrorMessage(message);
        setSubmitState('error');
        toast.error(message);
      } finally {
        setSubmitState('idle');
      }
    },
    [
      id,
      name,
      obVersion,
      category,
      image,
      isEdit,
      navigate,
      uploadMode,
      images,
      fileNames,
    ],
  );

  if (loadState === 'loading' || isLoadingMeta) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (loadState === 'error') {
    return (
      <div className={styles.wrapper}>
        <h1 className={styles.title}>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
        <div className={styles.error}>
          <div className={styles.errorTitle}>Có lỗi xảy ra</div>
          <div>{errorMessage ?? 'Đã xảy ra lỗi.'}</div>
          <button type="button" className={styles.backButton} onClick={() => navigate('/admin/products')}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>

      {!isEdit && (
        <div
          style={{
            background: '#1a1a1f',
            border: '2px solid #8a2be2',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(138, 43, 226, 0.2)',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            ⚡ Chọn chế độ upload:
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setUploadMode('single');
                setImages([]);
                setPreviews([]);
                setFileNames([]);
                previews.forEach((url) => {
                  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
                });
              }}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: `3px solid ${uploadMode === 'single' ? '#8a2be2' : '#4a4a5a'}`,
                background: uploadMode === 'single' ? '#8a2be2' : '#2a2a35',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '16px',
                transition: 'all 0.3s',
                flex: '1 1 200px',
                minWidth: '200px',
                boxShadow: uploadMode === 'single' ? '0 4px 12px rgba(138, 43, 226, 0.4)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (uploadMode !== 'single') {
                  e.currentTarget.style.background = '#3a3a45';
                  e.currentTarget.style.borderColor = '#6a6a7a';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (uploadMode !== 'single') {
                  e.currentTarget.style.background = '#2a2a35';
                  e.currentTarget.style.borderColor = '#4a4a5a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              📄 Upload 1 bill
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMode('multiple');
                setImage(null);
                if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
                setPreview('');
                setName('');
              }}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: `3px solid ${uploadMode === 'multiple' ? '#8a2be2' : '#4a4a5a'}`,
                background: uploadMode === 'multiple' ? '#8a2be2' : '#2a2a35',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '16px',
                transition: 'all 0.3s',
                flex: '1 1 200px',
                minWidth: '200px',
                boxShadow: uploadMode === 'multiple' ? '0 4px 12px rgba(138, 43, 226, 0.4)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (uploadMode !== 'multiple') {
                  e.currentTarget.style.background = '#3a3a45';
                  e.currentTarget.style.borderColor = '#6a6a7a';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (uploadMode !== 'multiple') {
                  e.currentTarget.style.background = '#2a2a35';
                  e.currentTarget.style.borderColor = '#4a4a5a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              📚 Upload nhiều bill
            </button>
          </div>
          <div
            style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#a0a0b0',
              textAlign: 'center',
              padding: '12px',
              background: 'rgba(138, 43, 226, 0.1)',
              borderRadius: '8px',
            }}
          >
            {uploadMode === 'single'
              ? '✓ Chế độ này cho phép bạn upload 1 bill với tên và hình ảnh riêng.'
              : '✓ Chế độ này cho phép bạn upload nhiều bill cùng lúc, mỗi bill sẽ có tên riêng.'}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.card}>

        <div className={styles.formGrid}>
          {(uploadMode === 'single' || isEdit) && (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="product-name">
                Tên sản phẩm <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required={!isEdit}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              OB Version <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={obVersion}
              onChange={(e) => setObVersion(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Chọn OB</option>
              {obVersions
                .filter((ob) => ob.isActive)
                .map((ob) => (
                  <option key={ob._id} value={ob.slug}>
                    {ob.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Danh mục <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories
                .filter((cat) => cat.isActive)
                .map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {(uploadMode === 'single' || isEdit) && (
            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label className={styles.label} htmlFor="product-image">
                Hình ảnh sản phẩm {!isEdit && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.file}
                required={!isEdit}
              />

              {preview ? (
                <img src={preview} alt="Preview" className={styles.preview} />
              ) : isEdit ? (
                <p className={styles.hint}>Nếu không chọn ảnh mới, sẽ giữ nguyên ảnh cũ.</p>
              ) : null}
            </div>
          )}

          {uploadMode === 'multiple' && !isEdit && (
            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label className={styles.label} htmlFor="product-images">
                Hình ảnh bill (có thể chọn nhiều) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '12px',
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('product-images')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'rgba(138, 43, 226, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <input
                  id="product-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImagesChange}
                  className={styles.file}
                  required
                  style={{ display: 'none' }}
                />
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📁</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                    {images.length > 0 ? `Đã chọn ${images.length} file` : 'Click để chọn nhiều file'}
                  </div>
                  <p className={styles.hint} style={{ margin: 0, fontSize: '13px' }}>
                    Bạn có thể chọn nhiều file cùng lúc (Ctrl/Cmd + Click hoặc Shift + Click)
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--muted)',
                      marginBottom: '12px',
                    }}
                  >
                    Danh sách bill đã chọn ({images.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {images.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <img
                            src={previews[index]}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '150px',
                              height: '150px',
                              objectFit: 'contain',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              background: 'rgba(0, 0, 0, 0.25)',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label
                                className={styles.label}
                                style={{ marginBottom: '8px', display: 'block' }}
                                htmlFor={`file-name-${index}`}
                              >
                                Tên bill {index + 1} <span style={{ color: '#ef4444' }}>*</span>
                              </label>
                              <input
                                id={`file-name-${index}`}
                                type="text"
                                value={fileNames[index] || ''}
                                onChange={(e) => handleFileNameChange(index, e.target.value)}
                                className={styles.input}
                                required
                                placeholder={`Nhập tên cho bill ${index + 1}`}
                              />
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--muted2)' }}>
                              File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                alignSelf: 'flex-start',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                              }}
                            >
                              🗑️ Xóa bill này
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={isSubmitDisabled}>
          {submitState === 'loading'
            ? 'Đang lưu...'
            : isEdit
              ? 'Cập nhật sản phẩm'
              : uploadMode === 'single'
                ? 'Thêm sản phẩm'
                : `Upload ${images.length} bill`}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
