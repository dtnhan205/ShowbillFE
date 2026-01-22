import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';
import type { Product } from '../types';
import { getImageUrl } from '../utils/imageUrl';
import Icon from './Icons/Icon';
import styles from './AdminDashboard/AdminDashboard.module.css';

type LoadState = 'idle' | 'loading' | 'error';

type MyStats = {
  totalBills: number;
  totalVisibleBills: number;
  totalViews: number;
};

type SystemStats = {
  totalAdmins: number;
  totalBills: number;
  totalViews: number;
};

type PaymentStats = {
  totalRevenue: number;
  totalPurchases: number;
  packageStats: Array<{
    packageType: string;
    count: number;
    totalAmount: number;
  }>;
  monthlyStats: Array<{
    year: number;
    month: number;
    count: number;
    totalAmount: number;
  }>;
};

type ChartDataPoint = {
  date: string;
  bills: number;
  views?: number;
  admins?: number;
  count?: number;
};

type MyChartData = {
  viewsTotal: number;
  viewsData?: ChartDataPoint[];
  billsData: ChartDataPoint[];
};

type SystemChartData = {
  viewsTotal: number;
  viewsData?: ChartDataPoint[];
  billsData: ChartDataPoint[];
  adminsData: ChartDataPoint[];
};

const RECENT_LIMIT = 8;

type MyPackage = {
  package: 'basic' | 'pro' | 'premium' | 'vip' | 'custom';
  activePackage?: 'basic' | 'pro' | 'premium' | 'vip' | 'custom';
  packageExpiry: string | null;
  billsUploaded: number;
  billLimit: number | null;
  canUpload: boolean;
};

const AdminDashboard: React.FC = () => {
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [myChartData, setMyChartData] = useState<MyChartData | null>(null);
  const [systemChartData, setSystemChartData] = useState<SystemChartData | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [myPackage, setMyPackage] = useState<MyPackage | null>(null);
  
  // Tính toán giá trị mặc định cho các dropdown
  const getDefaultWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const year = today.getFullYear();
    return `${monday.getDate()}/${monday.getMonth() + 1}/${year} - ${sunday.getDate()}/${sunday.getMonth() + 1}/${year}`;
  };
  
  const [selectedWeek, setSelectedWeek] = useState<string>(getDefaultWeek());
  const [selectedMonth, setSelectedMonth] = useState<string>(`Tháng ${new Date().getMonth() + 1}`);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoadState('loading');
      setErrorMessage(null);

      // Build query params based on period with actual dates
      let queryParams = `period=${period}`;
      const currentYear = new Date().getFullYear();
      
      if (period === 'week' && selectedWeek) {
        // Parse week string with year: "DD/MM/YYYY - DD/MM/YYYY" or "DD/MM - DD/MM"
        const parts = selectedWeek.split(' - ');
        if (parts.length === 2) {
          const part1 = parts[0].trim().split('/');
          const part2 = parts[1].trim().split('/');
          
          if (part1.length === 3 && part2.length === 3) {
            // Has year: "DD/MM/YYYY - DD/MM/YYYY"
            queryParams += `&week=${encodeURIComponent(selectedWeek)}`;
          } else {
            // No year: "DD/MM - DD/MM" - add current year
            const [day1, month1] = part1.map(Number);
            const [day2, month2] = part2.map(Number);
            const year1 = month1 === 12 ? currentYear - 1 : currentYear;
            const year2 = month2 === 1 && month1 === 12 ? currentYear : currentYear;
            queryParams += `&week=${encodeURIComponent(`${day1}/${month1}/${year1} - ${day2}/${month2}/${year2}`)}`;
          }
        } else {
          queryParams += `&week=${encodeURIComponent(selectedWeek)}`;
        }
      } else if (period === 'month' && selectedMonth) {
        // Parse month string: "Tháng 1" -> extract month number
        const monthMatch = selectedMonth.match(/Tháng (\d+)/);
        if (monthMatch) {
          const monthNum = parseInt(monthMatch[1]);
          queryParams += `&month=${encodeURIComponent(selectedMonth)}&year=${selectedYear || currentYear}`;
        } else {
          queryParams += `&month=${encodeURIComponent(selectedMonth)}`;
        }
      } else if (period === 'year' && selectedYear) {
        queryParams += `&year=${selectedYear}`;
      }

      const [myStatsRes, productsRes, myChartRes, packageRes] = await Promise.all([
        api.get<MyStats>(`/admin/stats?${queryParams}`),
        api.get<Product[]>('/products/mine'),
        api.get<MyChartData>(`/admin/chart-data?${queryParams}`),
        api.get<MyPackage>('/payment/my-package').catch(() => null),
      ]);

      setMyStats(myStatsRes.data);
      setMyChartData(myChartRes.data);
      if (packageRes) {
        setMyPackage(packageRes.data);
      }

      const list = Array.isArray(productsRes.data) ? productsRes.data : [];
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setProducts(sorted.slice(0, RECENT_LIMIT));

      // Super admin: system stats and chart data
      try {
        const [sysRes, sysChartRes, paymentStatsRes] = await Promise.all([
          api.get<SystemStats>(`/admin/system-stats?${queryParams}`),
          api.get<SystemChartData>(`/admin/system-chart-data?${queryParams}`),
          api.get<PaymentStats>(`/payment/admin/stats?${queryParams}`).catch(() => null),
        ]);
        setSystemStats(sysRes.data);
        setSystemChartData(sysChartRes.data);
        if (paymentStatsRes) {
          setPaymentStats(paymentStatsRes.data);
        }
      } catch {
        setSystemStats(null);
        setSystemChartData(null);
        setPaymentStats(null);
      }

      setLoadState('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu dashboard.';
      setErrorMessage(message);
      setLoadState('error');
    }
  }, [period, selectedWeek, selectedMonth, selectedYear]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll, period, selectedWeek, selectedMonth, selectedYear]);
  
  // Generate danh sách tuần (4 tuần gần nhất)
  const generateWeeks = () => {
    const weeks: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (i * 7));
      const dayOfWeek = date.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(date);
      monday.setDate(date.getDate() - daysToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const mondayYear = monday.getFullYear();
      const sundayYear = sunday.getFullYear();
      weeks.push(`${monday.getDate()}/${monday.getMonth() + 1}/${mondayYear} - ${sunday.getDate()}/${sunday.getMonth() + 1}/${sundayYear}`);
    }
    
    return weeks;
  };
  
  // Generate danh sách tháng
  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  };
  
  // Generate danh sách năm (3 năm gần nhất)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => (currentYear - i).toString());
  };

  // Format period label for badge
  const getPeriodLabel = useMemo(() => {
    if (period === 'week' && selectedWeek) {
      // Extract month from week string (format: "1/1 - 7/1")
      const monthMatch = selectedWeek.match(/\/(\d+)/);
      if (monthMatch) {
        const month = parseInt(monthMatch[1]);
        return `Tháng ${month}`;
      }
      return selectedWeek;
    } else if (period === 'month' && selectedMonth) {
      // selectedMonth already has format "Tháng X"
      return selectedMonth;
    } else if (period === 'year' && selectedYear) {
      return `Năm ${selectedYear}`;
    }
    // Default: current month
    return `Tháng ${new Date().getMonth() + 1}`;
  }, [period, selectedWeek, selectedMonth, selectedYear]);

  const statsCards = useMemo(() => {
    // Super admin view
    if (systemStats) {
      return (
        <>
          <div className={styles.stats}>
            <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                <div className={styles.statCardLeft}>
              <div className={styles.statValue}>{systemStats.totalAdmins}</div>
              <div className={styles.statLabel}>Tổng Admin</div>
              </div>
              <div className={styles.statIcon}>
                <Icon name="users" size={28} color="rgba(59, 130, 246, 0.9)" />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                <div className={styles.statCardLeft}>
              <div className={styles.statValue}>{systemStats.totalBills}</div>
              <div className={styles.statLabel}>Tổng Bill (tất cả admin)</div>
                <div className={styles.statBadge}>{getPeriodLabel}</div>
              </div>
              <div className={styles.statIcon}>
                <Icon name="file-text" size={28} color="rgba(34, 197, 94, 0.9)" />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                <div className={styles.statCardLeft}>
              <div className={styles.statValue}>{systemStats.totalViews}</div>
              <div className={styles.statLabel}>Tổng lượt xem (tất cả admin)</div>
                <div className={styles.statBadge}>{getPeriodLabel}</div>
              </div>
              <div className={styles.statIcon}>
                <Icon name="eye" size={28} color="rgba(168, 85, 247, 0.9)" />
              </div>
            </div>
          </div>
          {paymentStats && (
            <div className={styles.stats} style={{ marginTop: 24 }}>
              <div className={`${styles.statCard} ${styles.statCardOrange}`}>
                <div className={styles.statCardLeft}>
                <div className={styles.statValue}>{paymentStats.totalRevenue.toLocaleString('vi-VN')}</div>
                <div className={styles.statLabel}>Tổng doanh thu (VNĐ)</div>
                  <div className={styles.statBadge}>{getPeriodLabel}</div>
                </div>
                <div className={styles.statIcon}>
                  <Icon name="dollar-sign" size={28} color="rgba(249, 115, 22, 0.9)" />
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statCardPink}`}>
                <div className={styles.statCardLeft}>
                <div className={styles.statValue}>{paymentStats.totalPurchases}</div>
                <div className={styles.statLabel}>Tổng lượt mua gói</div>
                  <div className={styles.statBadge}>{getPeriodLabel}</div>
                </div>
                <div className={styles.statIcon}>
                  <Icon name="package" size={28} color="rgba(236, 72, 153, 0.9)" />
                </div>
              </div>
              {paymentStats.packageStats.length > 0 && (
                <div className={`${styles.statCard} ${styles.statCardYellow}`}>
                  <div className={styles.statCardLeft}>
                  <div className={styles.statValue}>
                    {paymentStats.packageStats[0].packageType.charAt(0).toUpperCase() + paymentStats.packageStats[0].packageType.slice(1)}
                  </div>
                  <div className={styles.statLabel}>
                    Gói bán chạy nhất ({paymentStats.packageStats[0].count} lượt)
                    </div>
                    <div className={styles.statBadge}>{getPeriodLabel}</div>
                  </div>
                  <div className={styles.statIcon}>
                    <Icon name="star" size={28} color="rgba(234, 179, 8, 0.9)" />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      );
    }

    // Normal admin view
    if (myStats) {
      return (
        <div className={styles.stats}>
          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <div className={styles.statCardLeft}>
            <div className={styles.statValue}>{myStats.totalBills}</div>
            <div className={styles.statLabel}>Tổng Bill đã up</div>
              <div className={styles.statBadge}>{getPeriodLabel}</div>
            </div>
            <div className={styles.statIcon}>
              <Icon name="file-text" size={28} color="rgba(34, 197, 94, 0.9)" />
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardPurple}`}>
            <div className={styles.statCardLeft}>
            <div className={styles.statValue}>{myStats.totalViews}</div>
            <div className={styles.statLabel}>Tổng lượt xem</div>
              <div className={styles.statBadge}>{getPeriodLabel}</div>
            </div>
            <div className={styles.statIcon}>
              <Icon name="eye" size={28} color="rgba(168, 85, 247, 0.9)" />
            </div>
          </div>
        </div>
      );
    }

    return null;
  }, [myStats, systemStats, paymentStats, getPeriodLabel]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (period === 'year') {
      // dateStr format: YYYY-MM
      const [, month] = dateStr.split('-');
      return `Tháng ${parseInt(month)}`;
    }
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const chartsSection = useMemo(() => {
    // Super admin charts
    if (systemStats && systemChartData) {
      return (
        <>
          <div className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Thống kê lượt xem hệ thống</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={systemChartData.viewsData || systemChartData.billsData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #444',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => `Ngày: ${value}`}
                    formatter={(value: number | undefined) => [
                      (value ?? 0).toLocaleString(),
                      'Lượt xem',
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="Lượt xem"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.chartNote}>
              Tổng lượt xem: <strong>{systemChartData.viewsTotal.toLocaleString()}</strong>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartCardTitle}>Thống kê tất cả Admin</h3>
              <div className={styles.chartContainerSmall}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={systemChartData.adminsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="#888"
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis stroke="#888" style={{ fontSize: '10px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #444',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => `Ngày: ${value}`}
                    />
                    <Bar dataKey="count" fill="#82ca9d" name="Admin đăng ký" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartCardTitle}>Tỉ lệ đăng ký Admin</h3>
              <div className={styles.chartContainerSmall}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={systemChartData.adminsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="#888"
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis stroke="#888" style={{ fontSize: '10px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #444',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => `Ngày: ${value}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#ffc658"
                      strokeWidth={2}
                      name="Admin mới"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      );
    }

    // Normal admin charts
    if (myStats && myChartData) {
      return (
        <>
          <div className={styles.chartSection}>
            <h2 className={styles.chartTitle}>Thống kê lượt xem</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={myChartData.viewsData || myChartData.billsData}>
                  <defs>
                    <linearGradient id="colorMyViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #444',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => `Ngày: ${value}`}
                    formatter={(value: number | undefined) => [
                      (value ?? 0).toLocaleString(),
                      'Lượt xem',
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorMyViews)"
                    name="Lượt xem"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.chartNote}>
              Tổng lượt xem: <strong>{myChartData.viewsTotal.toLocaleString()}</strong>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartCardTitle}>Thống kê tải lên Bill</h3>
            <div className={styles.chartContainerSmall}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={myChartData.billsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#888"
                    style={{ fontSize: '10px' }}
                  />
                  <YAxis stroke="#888" style={{ fontSize: '10px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid #444',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => `Ngày: ${value}`}
                  />
                  <Bar dataKey="bills" fill="#82ca9d" name="Bill" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      );
    }

    return null;
  }, [myStats, myChartData, systemStats, systemChartData]);

  const content = useMemo(() => {
    if (loadState === 'loading') {
      return <div className={styles.loading}>Đang tải dữ liệu...</div>;
    }

    if (loadState === 'error') {
      return (
        <div className={styles.error}>
          <p>{errorMessage ?? 'Đã xảy ra lỗi.'}</p>
          <button className={styles.retryButton} onClick={() => void fetchAll()}>
            Thử lại
          </button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="chart" size={28} color="rgba(255, 255, 255, 0.9)" /> Dashboard
          </h1>
          <div className={styles.filterContainer}>
            <div className={styles.periodButtons}>
              <button
                type="button"
                className={`${styles.periodButton} ${period === 'week' ? styles.periodButtonActive : ''}`}
                onClick={() => setPeriod('week')}
              >
                Tuần
              </button>
              <button
                type="button"
                className={`${styles.periodButton} ${period === 'month' ? styles.periodButtonActive : ''}`}
                onClick={() => setPeriod('month')}
              >
                Tháng
              </button>
              <button
                type="button"
                className={`${styles.periodButton} ${period === 'year' ? styles.periodButtonActive : ''}`}
                onClick={() => setPeriod('year')}
              >
                Năm
              </button>
            </div>
            <div className={styles.periodDropdowns}>
              {period === 'week' && (
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className={styles.periodDropdown}
                >
                  {generateWeeks().map((week) => (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  ))}
                </select>
              )}
              {period === 'month' && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={styles.periodDropdown}
                >
                  {generateMonths().map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              )}
              {period === 'year' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={styles.periodDropdown}
                >
                  {generateYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {myPackage && (() => {
          // Sử dụng activePackage nếu có, nếu không thì dùng package, mặc định là 'basic'
          const currentPackage = myPackage.activePackage || myPackage.package || 'basic';
          const packageNames: Record<string, string> = {
            basic: 'Basic',
            pro: 'Pro',
            premium: 'Premium',
            vip: 'VIP',
            custom: 'Custom',
          };
          const packageDisplayName = packageNames[currentPackage] || currentPackage.charAt(0).toUpperCase() + currentPackage.slice(1);
          
          return (
            <div className={styles.packageCard}>
              <div className={styles.packageHeader}>
                <h3 className={styles.packageTitle}>
                  Gói hiện tại: {packageDisplayName}
                </h3>
                {!myPackage.canUpload && (
                  <span className={styles.warning}>Đã đạt giới hạn upload</span>
                )}
              </div>
            <div className={styles.packageInfo}>
              <div className={styles.packageStat}>
                <span className={styles.packageStatLabel}>Đã upload:</span>
                <span className={styles.packageStatValue}>
                  {myPackage.billsUploaded} / {myPackage.billLimit === null ? '∞' : myPackage.billLimit}
                </span>
              </div>
              {myPackage.packageExpiry && (
                <div className={styles.packageStat}>
                  <span className={styles.packageStatLabel}>Hết hạn:</span>
                  <span className={styles.packageStatValue}>
                    {new Date(myPackage.packageExpiry).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
            {currentPackage === 'basic' && (
              <a href="/admin/payment" className={styles.upgradeLink}>
                Nâng cấp gói để upload thêm <Icon name="forward" size={14} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />
              </a>
            )}
          </div>
          );
        })()}

        {statsCards}

        {chartsSection}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Bill gần đây của bạn</h2>
          </div>

          {products.length === 0 ? (
            <div className={styles.noProducts}>Chưa có bill nào.</div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((p) => (
                <div key={p._id} className={styles.productCard}>
                  {p.imageUrl ? (
                    <img
                      src={getImageUrl(p.imageUrl)}
                      alt={p.name}
                      className={styles.productImage}
                      loading="lazy"
                    />
                  ) : p.imageBase64 ? (
                    <img
                      src={p.imageBase64}
                      alt={p.name}
                      className={styles.productImage}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.noImage}>No image</div>
                  )}
                  <p className={styles.productName} title={p.name}>
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }, [errorMessage, fetchAll, loadState, products, statsCards, chartsSection]);

  return <div>{content}</div>;
};

export default AdminDashboard;
