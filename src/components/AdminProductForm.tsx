import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import type { Product } from '../types';
import type { Category, ObVersion } from '../types/adminMeta';
import { getImageUrl } from '../utils/imageUrl';
import Icon from './Icons/Icon';
import styles from './AdminProductForm/AdminProductForm.module.css';

type LoadState = 'idle' | 'loading' | 'error';

type RouteParams = {
  id?: string;
};

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
  inlineMode?: boolean;
};

const AdminProductForm: React.FC<Props> = ({ onSuccess, onCancel, inlineMode = false }) => {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [billObVersions, setBillObVersions] = useState<string[]>([]); // OB cho từng bill
  const [billCategories, setBillCategories] = useState<string[]>([]); // Category cho từng bill
  const [obVersion, setObVersion] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');
  const [legalConfirmed, setLegalConfirmed] = useState(false);

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [submitState, setSubmitState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [obVersions, setObVersions] = useState<ObVersion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      previews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [preview, previews]);

  // load OB + Category lists
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setMetaLoading(true);
        const [obsRes, catsRes] = await Promise.all([
          api.get<ObVersion[]>('/obs/mine'),
          api.get<Category[]>('/categories/mine'),
        ]);

        const obs = Array.isArray(obsRes.data) ? obsRes.data : [];
        const cats = Array.isArray(catsRes.data) ? catsRes.data : [];

        setObVersions(obs);
        setCategories(cats);

        // default selection (create mode)
        if (!id) {
          const firstOb = obs.find((x) => x.isActive) ?? obs[0];
          const firstCat = cats.find((x) => x.isActive) ?? cats[0];
          if (firstOb?.slug) setObVersion(firstOb.slug);
          if (firstCat?.slug) setCategory(firstCat.slug);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setMetaLoading(false);
      }
    };

    void fetchMeta();
  }, [id]);

  // load product for edit
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoadState('loading');
        setErrorMessage(null);

        // Kiểm tra role để gọi đúng endpoint
        const isSuperAdmin = localStorage.getItem('adminRole') === 'super';
        const endpoint = isSuperAdmin ? '/products/all?page=1&limit=1000' : '/products/mine?page=1&limit=1000';
        const { data } = await api.get<Product[]>(endpoint);
        const found = Array.isArray(data) ? data.find((p) => p._id === id) : undefined;

        if (!found) {
          setErrorMessage('Không tìm thấy sản phẩm.');
          setLoadState('error');
          return;
        }

        setName(found.name ?? '');
        // Set preview từ URL hoặc base64
        if (found.imageUrl) {
          setPreview(getImageUrl(found.imageUrl));
        } else if (found.imageBase64) {
          setPreview(found.imageBase64);
        } else {
          setPreview('');
        }
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

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
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

    // Initialize OB and Category for each file (use default if available)
    const defaultOb = obVersions.find((x) => x.isActive)?.slug ?? obVersions[0]?.slug ?? '';
    const defaultCat = categories.find((x) => x.isActive)?.slug ?? categories[0]?.slug ?? '';
    const newObVersions = files.map(() => defaultOb);
    const newCategories = files.map(() => defaultCat);

    setImages(files);
    setPreviews(newPreviews);
    setFileNames(newNames);
    setBillObVersions(newObVersions);
    setBillCategories(newCategories);
  }, [previews, obVersions, categories]);

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
    setBillObVersions((prev) => prev.filter((_, i) => i !== index));
    setBillCategories((prev) => prev.filter((_, i) => i !== index));
  }, [previews]);

  const handleObVersionChange = useCallback((index: number, value: string) => {
    setBillObVersions((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleCategoryChange = useCallback((index: number, value: string) => {
    setBillCategories((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const isSubmitDisabled = useMemo(() => {
    if (submitState === 'loading') return true;
    if (metaLoading) return true;
    if (!obVersion || !category) return true;
    if (isEdit) {
      // Edit mode: only need name if updating name
      return false;
    }
    if (!legalConfirmed) return true;
    // Create mode
    if (uploadMode === 'single') {
      if (!name.trim()) return true;
      if (!image) return true;
    } else {
      if (images.length === 0) return true;
      if (fileNames.some((n) => !n.trim())) return true;
      // Check if all bills have OB and Category
      if (billObVersions.some((ob) => !ob) || billCategories.some((cat) => !cat)) return true;
    }
    return false;
  }, [submitState, metaLoading, name, obVersion, category, isEdit, image, uploadMode, images, fileNames, billObVersions, billCategories, legalConfirmed]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!obVersion || !category) {
        toast.error('Vui lòng chọn OB và Category');
        return;
      }

      if (!isEdit && !legalConfirmed) {
        toast.error('Vui lòng xác nhận đã che thông tin nhạy cảm và có sự đồng ý của chủ thể dữ liệu.');
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
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/admin/products');
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm.';
          setErrorMessage(message);
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
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/admin/products');
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm.';
          setErrorMessage(message);
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

      if (billObVersions.some((ob) => !ob)) {
        toast.error('Vui lòng chọn OB cho tất cả các bill');
        return;
      }

      if (billCategories.some((cat) => !cat)) {
        toast.error('Vui lòng chọn Category cho tất cả các bill');
        return;
      }

      const formData = new FormData();
      formData.append('names', JSON.stringify(fileNames.map((n) => n.trim())));
      formData.append('obVersions', JSON.stringify(billObVersions));
      formData.append('categories', JSON.stringify(billCategories));
      images.forEach((file) => {
        formData.append('images', file);
      });

      try {
        setSubmitState('loading');
        setErrorMessage(null);
        const response = await api.post('/products/bulk', formData);
        toast.success(`Đã upload thành công ${response.data.count} bill!`);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/admin/products');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi upload bill.';
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setSubmitState('idle');
      }
    },
    [
      category,
      id,
      image,
      isEdit,
      legalConfirmed,
      name,
      navigate,
      obVersion,
      onSuccess,
      uploadMode,
      images,
      fileNames,
    ],
  );

  if (loadState === 'loading' || metaLoading) {
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

  // Debug: Log để kiểm tra
  console.log('AdminProductForm render:', { isEdit, inlineMode, uploadMode });

  return (
    <div className={styles.wrapper}>
      {!inlineMode && <h1 className={styles.title}>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>}

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
            display: 'block',
            visibility: 'visible',
            opacity: 1,
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="lightning" size={18} color="rgba(251, 191, 36, 0.9)" /> Chọn chế độ upload:
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setUploadMode('single');
                setImages([]);
                setPreviews([]);
                setFileNames([]);
                setBillObVersions([]);
                setBillCategories([]);
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} color="rgba(34, 197, 94, 0.8)" />
              {uploadMode === 'single'
                ? 'Chế độ này cho phép bạn upload 1 bill với tên và hình ảnh riêng.'
                : 'Chế độ này cho phép bạn upload nhiều bill cùng lúc, mỗi bill sẽ có tên riêng.'}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.formGrid}>
          {(uploadMode === 'single' || isEdit) && (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="product-name">
                Tên sản phẩm
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
            <label className={styles.label} htmlFor="product-ob">
              OB
            </label>
            <select
              id="product-ob"
              value={obVersion}
              onChange={(e) => setObVersion(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Chọn OB</option>
              {obVersions
                .filter((x) => x.isActive)
                .map((x) => (
                  <option key={x._id} value={x.slug}>
                    {x.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.fullRow}`}>
            <label className={styles.label} htmlFor="product-category">
              Category
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Chọn category</option>
              {categories
                .filter((x) => x.isActive)
                .map((x) => (
                  <option key={x._id} value={x.slug}>
                    {x.name}
                  </option>
                ))}
            </select>
          </div>

          {(uploadMode === 'single' || isEdit) && (
            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label className={styles.label} htmlFor="product-image">
                Hình ảnh {!isEdit ? '(bắt buộc)' : '(tùy chọn)'}
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
                <p className={styles.hint} style={{ marginTop: 12, color: 'rgba(229, 231, 235, 0.7)' }}>
                  Nếu không chọn ảnh mới, sẽ giữ nguyên ảnh cũ.
                </p>
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
                  border: '2px dashed #4a4a5a',
                  borderRadius: '12px',
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('product-images')?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8a2be2';
                  e.currentTarget.style.background = 'rgba(138, 43, 226, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#4a4a5a';
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
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                    <Icon name="folder" size={48} color="rgba(255, 255, 255, 0.7)" />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    {images.length > 0 ? `Đã chọn ${images.length} file` : 'Click để chọn nhiều file'}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#a0a0b0' }}>
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
                      color: '#a0a0b0',
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
                          border: '1px solid #4a4a5a',
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
                              border: '1px solid #4a4a5a',
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div>
                                <label
                                  className={styles.label}
                                  style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}
                                  htmlFor={`file-ob-${index}`}
                                >
                                  OB <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                  id={`file-ob-${index}`}
                                  value={billObVersions[index] || ''}
                                  onChange={(e) => handleObVersionChange(index, e.target.value)}
                                  className={styles.select}
                                  required
                                  style={{ width: '100%' }}
                                >
                                  <option value="">Chọn OB</option>
                                  {obVersions
                                    .filter((x) => x.isActive)
                                    .map((x) => (
                                      <option key={x._id} value={x.slug}>
                                        {x.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div>
                                <label
                                  className={styles.label}
                                  style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}
                                  htmlFor={`file-category-${index}`}
                                >
                                  Category <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                  id={`file-category-${index}`}
                                  value={billCategories[index] || ''}
                                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                                  className={styles.select}
                                  required
                                  style={{ width: '100%' }}
                                >
                                  <option value="">Chọn Category</option>
                                  {categories
                                    .filter((x) => x.isActive)
                                    .map((x) => (
                                      <option key={x._id} value={x.slug}>
                                        {x.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#a0a0b0', marginTop: '8px' }}>
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
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="trash" size={16} color="currentColor" /> Xóa bill này
                              </span>
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

        {!isEdit && (
          <label
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              marginTop: 12,
              marginBottom: 6,
              color: 'rgba(229,231,235,0.85)',
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <input
              type="checkbox"
              checked={legalConfirmed}
              onChange={(e) => setLegalConfirmed(e.target.checked)}
              style={{ marginTop: 3, width: 18, height: 18, cursor: 'pointer' }}
              required
            />
            Tôi xác nhận đã che thông tin nhạy cảm và có sự đồng ý của chủ thể dữ liệu.
          </label>
        )}

        <div className={styles.actionsRow} style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="submit" className={styles.submit} disabled={isSubmitDisabled} style={{ flex: 1 }}>
            {submitState === 'loading'
              ? 'Đang lưu...'
              : isEdit
                ? 'Cập nhật sản phẩm'
                : uploadMode === 'single'
                  ? 'Thêm sản phẩm'
                  : `Upload ${images.length} bill`}
          </button>
          {(isEdit || onCancel) && (
            <button
              type="button"
              onClick={() => {
                if (onCancel) {
                  onCancel();
                } else {
                  navigate('/admin/products');
                }
              }}
              className={styles.cancelButton}
              disabled={submitState === 'loading'}
              style={{ padding: '12px 24px', minWidth: '100px' }}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
