import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import type { Product, ObVersion, Category } from '../../types';
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
  const [obVersion, setObVersion] = useState('');
  const [category, setCategory] = useState('');

  // API states
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [submitState, setSubmitState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch data states
  const [obVersions, setObVersions] = useState<ObVersion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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

  const isSubmitDisabled = useMemo(() => {
    if (submitState === 'loading') return true;
    if (!name.trim()) return true;
    if (!obVersion || !category) return true;
    if (!isEdit && !image) return true;
    return false;
  }, [submitState, name, obVersion, category, isEdit, image]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        alert('Vui lòng nhập tên sản phẩm');
        return;
      }

      if (!obVersion || !category) {
        alert('Vui lòng chọn OB và Category');
        return;
      }

      if (!isEdit && !image) {
        alert('Vui lòng chọn hình ảnh');
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

        if (id) {
          await api.put(`/products/${id}`, formData);
        } else {
          await api.post('/products', formData);
        }

        navigate('/admin/products');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm.';
        setErrorMessage(message);
        setSubmitState('error');
        alert(message);
      } finally {
        setSubmitState('idle');
      }
    },
    [id, name, obVersion, category, image, isEdit, navigate],
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

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.formGrid}>
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
              required
            />
          </div>

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
        </div>

        <button type="submit" className={styles.submit} disabled={isSubmitDisabled}>
          {submitState === 'loading' ? 'Đang lưu...' : `${isEdit ? 'Cập nhật' : 'Thêm'} sản phẩm`}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
