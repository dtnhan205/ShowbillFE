import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import type { Product } from '../types';
import type { Category, ObVersion } from '../types/adminMeta';
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
  const [obVersion, setObVersion] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [submitState, setSubmitState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [obVersions, setObVersions] = useState<ObVersion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);

  // Kiểm tra role super admin
  const isSuperAdmin = useMemo(() => {
    try {
      const raw = localStorage.getItem('adminRole');
      return raw === 'super';
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // load OB + Category lists
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setMetaLoading(true);
        // Super admin có thể xem tất cả, admin thường chỉ xem của mình
        const obsEndpoint = isSuperAdmin ? '/obs' : '/obs/mine';
        const catsEndpoint = isSuperAdmin ? '/categories' : '/categories/mine';
        
        const [obsRes, catsRes] = await Promise.all([
          api.get<ObVersion[]>(obsEndpoint),
          api.get<Category[]>(catsEndpoint),
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
  }, [id, isSuperAdmin]);

  // load product for edit
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoadState('loading');
        setErrorMessage(null);

        const { data } = await api.get<Product[]>('/products');
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

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const isSubmitDisabled = useMemo(() => {
    if (submitState === 'loading') return true;
    if (metaLoading) return true;
    if (!name.trim()) return true;
    if (!obVersion || !category) return true;
    if (!isEdit && !image) return true;
    return false;
  }, [category, image, isEdit, metaLoading, name, obVersion, submitState]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) return alert('Vui lòng nhập tên sản phẩm');
      if (!obVersion || !category) return alert('Vui lòng chọn OB và Category');
      if (!isEdit && !image) return alert('Vui lòng chọn hình ảnh');

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

        // Nếu có callback thì dùng, thay vì điều hướng sang trang riêng
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/admin/products');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm.';
        setErrorMessage(message);
        alert(message);
      } finally {
        setSubmitState('idle');
      }
    },
    [category, id, image, isEdit, name, navigate, obVersion, onSuccess],
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

  return (
    <div className={styles.wrapper}>
      {!inlineMode && <h1 className={styles.title}>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>}

      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.formGrid}>
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
              required
            />
          </div>

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

            {preview ? <img src={preview} alt="Preview" className={styles.preview} /> : null}
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button type="submit" className={styles.submit} disabled={isSubmitDisabled}>
            {submitState === 'loading' ? 'Đang lưu...' : `${isEdit ? 'Cập nhật' : 'Thêm'} sản phẩm`}
          </button>
          {onCancel && (
            <button type="button" className={styles.backButton} onClick={onCancel}>
              Hủy / quay lại
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
