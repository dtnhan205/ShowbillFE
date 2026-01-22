import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Icon from '../components/Icons/Icon';
import styles from './AdminPackages.module.css';

type PackageConfig = {
  _id: string;
  packageType: string;
  price: number;
  billLimit: number;
  descriptions?: string[];
};

type BankAccount = {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  apiUrl?: string;
  isActive: boolean;
};

const AdminPackages: React.FC = () => {
  const [packageConfigs, setPackageConfigs] = useState<PackageConfig[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingBillLimit, setEditingBillLimit] = useState<number>(100);
  const [editingDescriptions, setEditingDescriptions] = useState<string[]>([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPackage, setNewPackage] = useState({
    packageType: '',
    price: 0,
    billLimit: 100,
    descriptions: [] as string[],
  });
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    apiUrl: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; bankName: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configsRes, banksRes] = await Promise.all([
        api.get<PackageConfig[]>('/payment/admin/packages/config'),
        api.get<BankAccount[]>('/payment/admin/bank-accounts'),
      ]);
      setPackageConfigs(configsRes.data);
      setBankAccounts(banksRes.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackage = async (type: string) => {
    try {
      await api.put(`/payment/admin/packages/config/${type}`, {
        price: editingPrice,
        billLimit: editingBillLimit,
        descriptions: editingDescriptions,
      });
      await fetchData();
      setEditingPackage(null);
      setEditingDescriptions([]);
      toast.success('Đã cập nhật gói thành công!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật gói');
    }
  };

  const handleAddPackage = async () => {
    try {
      if (!newPackage.packageType.trim()) {
        toast.error('Vui lòng nhập tên gói');
        return;
      }
      if (newPackage.price < 0) {
        toast.error('Giá không hợp lệ');
        return;
      }
      await api.post('/payment/admin/packages/config', newPackage);
      setNewPackage({ packageType: '', price: 0, billLimit: 100, descriptions: [] });
      setShowAddPackage(false);
      await fetchData();
      toast.success('Đã thêm gói mới thành công!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể thêm gói mới');
    }
  };

  const handleDeletePackage = async (type: string) => {
    if (type === 'basic') {
      toast.error('Không thể xóa gói Basic');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa gói ${type}?`)) {
      return;
    }
    try {
      await api.delete(`/payment/admin/packages/config/${type}`);
      await fetchData();
      toast.success('Đã xóa gói thành công!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa gói');
    }
  };

  const handleAddBank = async () => {
    try {
      if (!newBank.bankName || !newBank.accountNumber || !newBank.accountHolder) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      await api.post('/payment/admin/bank-accounts', newBank);
      setNewBank({ bankName: '', accountNumber: '', accountHolder: '', apiUrl: '' });
      setShowAddBank(false);
      await fetchData();
      toast.success('Đã thêm tài khoản ngân hàng thành công!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể thêm tài khoản ngân hàng');
    }
  };

  const handleToggleBank = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/payment/admin/bank-accounts/${id}`, { isActive: !isActive });
      await fetchData();
      toast.success(isActive ? 'Đã tắt tài khoản ngân hàng' : 'Đã bật tài khoản ngân hàng');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật tài khoản');
    }
  };

  const handleDeleteBank = (id: string, bankName: string) => {
    setConfirmDelete({ id, bankName });
  };

  const confirmDeleteBank = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/payment/admin/bank-accounts/${confirmDelete.id}`);
      await fetchData();
      toast.success('Đã xóa tài khoản ngân hàng thành công!');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa tài khoản');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Icon name="package" size={24} color="rgba(255, 255, 255, 0.9)" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Cấu hình Giá Gói
          </h2>
          <button onClick={() => setShowAddPackage(true)} className={styles.addButton}>
            + Thêm gói mới
          </button>
        </div>

        {showAddPackage && (
          <div className={styles.addPackageForm}>
            <input
              type="text"
              placeholder="Tên gói (ví dụ: enterprise, vip, ...)"
              value={newPackage.packageType}
              onChange={(e) => setNewPackage({ ...newPackage, packageType: e.target.value })}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Giá (VNĐ)"
              value={newPackage.price}
              onChange={(e) => setNewPackage({ ...newPackage, price: Number(e.target.value) })}
              className={styles.input}
              min="0"
            />
            <input
              type="number"
              placeholder="Giới hạn bill/tháng (-1 = không giới hạn)"
              value={newPackage.billLimit}
              onChange={(e) => setNewPackage({ ...newPackage, billLimit: Number(e.target.value) })}
              className={styles.input}
              min="-1"
            />
            <div className={styles.descriptionsSection}>
              <label style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: 8, display: 'block', fontSize: 14, fontWeight: 600 }}>
                Mô tả gói:
              </label>
              {newPackage.descriptions.map((desc, index) => (
                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => {
                      const newDescs = [...newPackage.descriptions];
                      newDescs[index] = e.target.value;
                      setNewPackage({ ...newPackage, descriptions: newDescs });
                    }}
                    placeholder="Nhập mô tả..."
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newDescs = newPackage.descriptions.filter((_, i) => i !== index);
                      setNewPackage({ ...newPackage, descriptions: newDescs });
                    }}
                    className={styles.deleteButton}
                    style={{ padding: '8px 12px', fontSize: 12 }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNewPackage({ ...newPackage, descriptions: [...newPackage.descriptions, ''] })}
                className={styles.addButton}
                style={{ padding: '8px 12px', fontSize: 12, width: '100%' }}
              >
                + Thêm mô tả
              </button>
            </div>
            <div className={styles.formActions}>
              <button onClick={handleAddPackage} className={styles.saveButton}>
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddPackage(false);
                  setNewPackage({ packageType: '', price: 0, billLimit: 100, descriptions: [] });
                }}
                className={styles.cancelButton}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className={styles.packagesGrid}>
          {packageConfigs.map((config) => (
            <div key={config._id} className={styles.packageCard}>
              <h3 className={styles.packageName}>
                Gói {config.packageType.charAt(0).toUpperCase() + config.packageType.slice(1)}
              </h3>
              {editingPackage === config.packageType ? (
                <div className={styles.editForm}>
                  <input
                    type="number"
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(Number(e.target.value))}
                    placeholder="Giá (VNĐ)"
                    className={styles.input}
                    disabled={config.packageType === 'basic'}
                    min="0"
                  />
                  <input
                    type="number"
                    value={editingBillLimit}
                    onChange={(e) => setEditingBillLimit(Number(e.target.value))}
                    placeholder="Giới hạn bill/tháng (-1 = không giới hạn)"
                    className={styles.input}
                    disabled={config.packageType === 'basic'}
                    min="-1"
                  />
                  <div className={styles.descriptionsSection}>
                    <label style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: 8, display: 'block', fontSize: 14, fontWeight: 600 }}>
                      Mô tả gói:
                    </label>
                    {editingDescriptions.map((desc, index) => (
                      <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <input
                          type="text"
                          value={desc}
                          onChange={(e) => {
                            const newDescs = [...editingDescriptions];
                            newDescs[index] = e.target.value;
                            setEditingDescriptions(newDescs);
                          }}
                          placeholder="Nhập mô tả..."
                          className={styles.input}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDescs = editingDescriptions.filter((_, i) => i !== index);
                            setEditingDescriptions(newDescs);
                          }}
                          className={styles.deleteButton}
                          style={{ padding: '8px 12px', fontSize: 12 }}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditingDescriptions([...editingDescriptions, ''])}
                      className={styles.addButton}
                      style={{ padding: '8px 12px', fontSize: 12, width: '100%' }}
                    >
                      + Thêm mô tả
                    </button>
                  </div>
                  <div className={styles.editActions}>
                    <button
                      onClick={() => handleUpdatePackage(config.packageType)}
                      className={styles.saveButton}
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setEditingPackage(null);
                        setEditingPrice(0);
                        setEditingBillLimit(100);
                        setEditingDescriptions([]);
                      }}
                      className={styles.cancelButton}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.packageInfo}>
                    <div className={styles.infoRow}>
                      <span>Giá:</span>
                      <strong>{config.price.toLocaleString()} VNĐ</strong>
                    </div>
                    <div className={styles.infoRow}>
                      <span>Giới hạn:</span>
                      <strong>
                        {config.billLimit === -1 ? 'Không giới hạn' : `${config.billLimit} bill/tháng`}
                      </strong>
                    </div>
                    {config.descriptions && config.descriptions.length > 0 && (
                      <div className={styles.infoRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                        <span>Mô tả:</span>
                        <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(255, 255, 255, 0.8)' }}>
                          {config.descriptions.map((desc, index) => (
                            <li key={index}>{desc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={styles.packageActions}>
                    {config.packageType !== 'basic' && (
                      <>
                        <button
                          onClick={() => {
                            setEditingPackage(config.packageType);
                            setEditingPrice(config.price);
                            setEditingBillLimit(config.billLimit);
                            setEditingDescriptions(config.descriptions || []);
                          }}
                          className={styles.editButton}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeletePackage(config.packageType)}
                          className={styles.deleteButton}
                        >
                          Xóa gói
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="credit-card" size={28} color="rgba(255, 255, 255, 0.9)" /> Tài khoản Ngân hàng
          </h2>
          <button onClick={() => setShowAddBank(true)} className={styles.addButton}>
            + Thêm tài khoản
          </button>
        </div>

        {showAddBank && (
          <div className={styles.addBankForm}>
            <input
              type="text"
              placeholder="Tên ngân hàng"
              value={newBank.bankName}
              onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Số tài khoản"
              value={newBank.accountNumber}
              onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Tên chủ tài khoản *"
              value={newBank.accountHolder}
              onChange={(e) => setNewBank({ ...newBank, accountHolder: e.target.value })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Link API LSGD"
              value={newBank.apiUrl}
              onChange={(e) => setNewBank({ ...newBank, apiUrl: e.target.value })}
              className={styles.input}
            />
            <div className={styles.formActions}>
              <button onClick={handleAddBank} className={styles.saveButton}>
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddBank(false);
                  setNewBank({ bankName: '', accountNumber: '', accountHolder: '', apiUrl: '' });
                }}
                className={styles.cancelButton}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className={styles.banksList}>
          {bankAccounts.map((bank) => (
            <div key={bank._id} className={styles.bankCard}>
              <div className={styles.bankInfo}>
                <h3>{bank.bankName}</h3>
                <p>Số TK: {bank.accountNumber}</p>
                <p>Chủ TK: {bank.accountHolder}</p>
                {bank.apiUrl && (
                  <p className={styles.apiUrl}>
                    API: <span>{bank.apiUrl}</span>
                  </p>
                )}
                <span className={bank.isActive ? styles.active : styles.inactive}>
                  {bank.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                </span>
              </div>
              <div className={styles.bankActions}>
                <button
                  onClick={() => handleToggleBank(bank._id, bank.isActive)}
                  className={styles.toggleButton}
                >
                  {bank.isActive ? 'Tắt' : 'Bật'}
                </button>
                <button
                  onClick={() => handleDeleteBank(bank._id, bank.bankName)}
                  className={styles.deleteButton}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Xác nhận xóa</h3>
            <p className={styles.modalMessage}>
              Bạn có chắc muốn xóa tài khoản ngân hàng <strong>{confirmDelete.bankName}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button onClick={confirmDeleteBank} className={styles.modalConfirmButton}>
                Xóa
              </button>
              <button onClick={() => setConfirmDelete(null)} className={styles.modalCancelButton}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPackages;

