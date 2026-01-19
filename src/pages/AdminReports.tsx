import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Icon from '../components/Icons/Icon';
import styles from './AdminReports.module.css';

type AdminReportItem = {
  adminId: string;
  displayName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isPublicHidden: boolean;
  reportCount: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  lastReason?: string;
  lastReporterName?: string;
  lastReporterZalo?: string;
  lastStatus?: 'pending' | 'resolved';
  lastAt?: string;
  createdAt?: string;
};

type ReportDetail = {
  _id: string;
  reporterName: string;
  reporterZalo: string;
  reason: string;
  status: 'pending' | 'resolved';
  ip: string;
  userAgent: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    username: string;
    displayName: string;
  } | null;
};

type ReportDetailsData = {
  admin: {
    _id: string;
    displayName: string;
    username: string;
    email: string;
    role: string;
  };
  reports: ReportDetail[];
  total: number;
  pendingCount: number;
  resolvedCount: number;
};

const AdminReports: React.FC = () => {
  const [items, setItems] = useState<AdminReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  
  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hidden' | 'visible'>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'reports' | 'date'>('reports');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<ReportDetailsData | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsStatusFilter, setDetailsStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<AdminReportItem[]>('/admin/reports');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  // Filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.displayName.toLowerCase().includes(query) ||
          item.username.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query),
      );
    }

    // Status filter (public visibility)
    if (statusFilter === 'hidden') {
      filtered = filtered.filter((item) => item.isPublicHidden);
    } else if (statusFilter === 'visible') {
      filtered = filtered.filter((item) => !item.isPublicHidden);
    }

    // Report status filter
    if (reportStatusFilter === 'pending') {
      filtered = filtered.filter((item) => item.pendingReports > 0);
    } else if (reportStatusFilter === 'resolved') {
      filtered = filtered.filter((item) => item.resolvedReports > 0 && item.pendingReports === 0);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'reports') {
        comparison = a.pendingReports - b.pendingReports;
      } else if (sortBy === 'date') {
        const dateA = a.lastAt ? new Date(a.lastAt).getTime() : 0;
        const dateB = b.lastAt ? new Date(b.lastAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, statusFilter, sortBy, sortOrder]);

  const toggleHide = useCallback(
    async (adminId: string) => {
      try {
        setTogglingId(adminId);
        const { data } = await api.patch<{ admin: AdminReportItem }>(`/admin/reports/${adminId}/toggle-hide`);
        setItems((prev) =>
          prev.map((item) => (item.adminId === adminId ? { ...item, isPublicHidden: data.admin.isPublicHidden } : item)),
        );
        toast.success(data.message || 'Đã cập nhật trạng thái');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái hiển thị');
      } finally {
        setTogglingId(null);
      }
    },
    [],
  );

  const fetchReportDetails = useCallback(async (adminId: string, statusFilter: 'all' | 'pending' | 'resolved' = 'all') => {
    try {
      setDetailsLoading(true);
      const statusParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await api.get<ReportDetailsData>(`/admin/reports/${adminId}/details${statusParam}`);
      setDetailsData(data);
      setDetailsModalOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải chi tiết báo cáo');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const handleOpenDetails = useCallback((adminId: string) => {
    setDetailsStatusFilter('all');
    void fetchReportDetails(adminId, 'all');
  }, [fetchReportDetails]);

  const updateReportStatus = useCallback(async (reportId: string, status: 'pending' | 'resolved') => {
    try {
      setUpdatingStatusId(reportId);
      await api.patch(`/admin/reports/report/${reportId}/status`, { status });
      toast.success(`Đã đánh dấu report là ${status === 'resolved' ? 'đã xử lý' : 'chờ xử lý'}`);
      // Refresh details if modal is open
      if (detailsData?.admin._id) {
        await fetchReportDetails(detailsData.admin._id, detailsStatusFilter);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingStatusId(null);
    }
  }, [detailsData, detailsStatusFilter, fetchReportDetails]);

  const resetReports = useCallback(
    async (adminId: string) => {
      if (!confirm('Bạn có chắc chắn muốn xóa tất cả báo cáo và reset report count của admin này?')) {
        return;
      }
      try {
        setResettingId(adminId);
        const { data } = await api.delete<{ message: string; deletedCount: number }>(`/admin/reports/${adminId}/reset`);
        toast.success(data.message || `Đã xóa ${data.deletedCount} báo cáo`);
        await fetchReports(); // Refresh list
        if (detailsModalOpen && detailsData?.admin._id === adminId) {
          setDetailsModalOpen(false);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Không thể reset báo cáo');
      } finally {
        setResettingId(null);
      }
    },
    [fetchReports, detailsModalOpen, detailsData],
  );

  const closeDetailsModal = useCallback(() => {
    setDetailsModalOpen(false);
    setDetailsData(null);
  }, []);

  if (loading) {
    return <div className={styles.empty}>Đang tải báo cáo...</div>;
  }

  if (error) {
    return (
      <div className={styles.empty}>
        <p>{error}</p>
        <button type="button" className={styles.btn} onClick={() => void fetchReports()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="flag" size={28} color="rgba(255, 255, 255, 0.9)" /> Quản lý Report Admin
        </h2>
        <p className={styles.subtitle}>
          Chỉ super admin. Tổng admin bị report: {items.length}. Hiển thị: {filteredAndSortedItems.length}
        </p>
      </div>

      {/* Filters and sorting */}
      <div className={styles.filtersRow}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={styles.select}>
            <option value="all">Tất cả trạng thái public</option>
            <option value="hidden">Đã ẩn public</option>
            <option value="visible">Đang hiển thị</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <select value={reportStatusFilter} onChange={(e) => setReportStatusFilter(e.target.value as typeof reportStatusFilter)} className={styles.select}>
            <option value="all">Tất cả report</option>
            <option value="pending">Có report chờ xử lý</option>
            <option value="resolved">Đã xử lý hết</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={styles.select}>
            <option value="reports">Sắp xếp theo số báo cáo</option>
            <option value="date">Sắp xếp theo ngày</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)} className={styles.select}>
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <div className={styles.empty}>Không tìm thấy admin nào phù hợp với bộ lọc.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Báo cáo</th>
                <th>Trạng thái public</th>
                <th>Người báo cáo gần nhất</th>
                <th>Lý do gần nhất</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item) => (
                <tr key={item.adminId}>
                  <td>
                    <div style={{ fontWeight: 800 }}>{item.displayName}</div>
                    <div style={{ color: 'rgba(229,231,235,0.7)', fontSize: 12 }}>{item.username}</div>
                  </td>
                  <td>{item.email}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className={styles.badge} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Có {item.totalReports} báo cáo
                      </div>
                      {item.lastStatus && (
                        <span className={`${styles.badge} ${item.lastStatus === 'pending' ? styles.badgePending : styles.badgeResolved}`}>
                          {item.lastStatus === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                        </span>
                      )}
                      {item.lastAt && (
                        <div style={{ color: 'rgba(229,231,235,0.6)', fontSize: 12, marginTop: 4 }}>
                          Gần nhất: {new Date(item.lastAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${item.isPublicHidden ? styles.badgeHidden : styles.badgeVisible}`}>
                      {item.isPublicHidden ? 'Đã ẩn public' : 'Đang hiển thị'}
                    </span>
                  </td>
                  <td>
                    {item.lastReporterName || item.lastReporterZalo ? (
                      <div>
                        <div style={{ fontWeight: 700, color: 'rgba(229,231,235,0.9)' }}>
                          {item.lastReporterName || 'N/A'}
                        </div>
                        <div style={{ color: 'rgba(229,231,235,0.6)', fontSize: 12, marginTop: 4 }}>
                          Zalo: {item.lastReporterZalo || 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'rgba(229,231,235,0.5)' }}>Không có</span>
                    )}
                  </td>
                  <td>
                    {item.lastReason ? (
                      <div className={styles.reason}>{item.lastReason}</div>
                    ) : (
                      <span style={{ color: 'rgba(229,231,235,0.5)' }}>Không có</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnInfo}`}
                        onClick={() => void handleOpenDetails(item.adminId)}
                        disabled={detailsLoading}
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${item.isPublicHidden ? '' : styles.btnDanger}`}
                        onClick={() => void toggleHide(item.adminId)}
                        disabled={togglingId === item.adminId}
                      >
                        {item.isPublicHidden ? 'Hiện public' : 'Ẩn public'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {detailsModalOpen && detailsData && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailsModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h3 className={styles.modalTitle}>Chi tiết báo cáo</h3>
                  <p className={styles.modalSubtitle}>
                    {detailsData.admin.displayName} ({detailsData.admin.username}) - Tổng: {detailsData.total} ({detailsData.pendingCount} chờ / {detailsData.resolvedCount} đã xử lý)
                  </p>
                </div>
                <button type="button" className={styles.modalClose} onClick={closeDetailsModal} aria-label="Đóng">
                  <Icon name="close" size={18} color="rgba(255, 255, 255, 0.9)" />
                </button>
              </div>

              <div className={styles.modalFilters}>
                <select
                  value={detailsStatusFilter}
                  onChange={(e) => {
                    const newFilter = e.target.value as typeof detailsStatusFilter;
                    setDetailsStatusFilter(newFilter);
                    void fetchReportDetails(detailsData.admin._id, newFilter);
                  }}
                  className={styles.select}
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="resolved">Đã xử lý</option>
                </select>
              </div>

              <div className={styles.modalBody}>
                {detailsLoading ? (
                  <div className={styles.empty}>Đang tải...</div>
                ) : detailsData.reports.length === 0 ? (
                  <div className={styles.empty}>Không có báo cáo nào.</div>
                ) : (
                  <div className={styles.reportsList}>
                    {detailsData.reports.map((report) => (
                      <div key={report._id} className={styles.reportCard}>
                        <div className={styles.reportCardHeader}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <div className={styles.reportCardName}>{report.reporterName}</div>
                              <span className={`${styles.badge} ${report.status === 'pending' ? styles.badgePending : styles.badgeResolved}`}>
                                {report.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                              </span>
                            </div>
                            <div className={styles.reportCardMeta}>
                              Zalo: {report.reporterZalo} • {new Date(report.createdAt).toLocaleString('vi-VN')}
                              {report.resolvedAt && report.resolvedBy && (
                                <> • Xử lý bởi {report.resolvedBy.displayName} lúc {new Date(report.resolvedAt).toLocaleString('vi-VN')}</>
                              )}
                            </div>
                          </div>
                          {report.status === 'pending' && (
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnSuccess}`}
                              onClick={() => void updateReportStatus(report._id, 'resolved')}
                              disabled={updatingStatusId === report._id}
                              style={{ fontSize: 11, padding: '6px 10px' }}
                            >
                              {updatingStatusId === report._id ? '...' : 'Đánh dấu đã xử lý'}
                            </button>
                          )}
                          {/* Không hiển thị nút chuyển về pending khi đã resolved - chỉ cho phép một chiều */}
                        </div>
                        <div className={styles.reportCardReason}>{report.reason}</div>
                        {(report.ip || report.userAgent) && (
                          <div className={styles.reportCardTech}>
                            {report.ip && <span>IP: {report.ip}</span>}
                            {report.userAgent && <span>UA: {report.userAgent.substring(0, 50)}...</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => void resetReports(detailsData.admin._id)}
                  disabled={resettingId === detailsData.admin._id}
                >
                  {resettingId === detailsData.admin._id ? 'Đang xóa...' : 'Xóa tất cả & Reset'}
                </button>
                <button type="button" className={styles.btn} onClick={closeDetailsModal}>
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReports;
