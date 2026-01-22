import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import { shortenId } from '../utils/idUtils';
import { getImageUrl } from '../utils/imageUrl';
import Icon from '../components/Icons/Icon';
import styles from './Home.module.css';

type PublicAdminItem = {
  _id: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  avatarBase64?: string; // Backward compatibility
  bannerUrl?: string;
  bannerBase64?: string; // Backward compatibility
  avatarFrame?: string;
  stats?: {
    totalBills: number;
    totalViews: number;
  };
};

const Home: React.FC = () => {
  const [admins, setAdmins] = useState<PublicAdminItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdminIndex, setSelectedAdminIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerView = 4;
  const adminsPerPage = 10;

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<PublicAdminItem[]>('/public/admins');
      setAdmins(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải danh sách admin');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  // Scroll to all-admins section if hash is present
  useEffect(() => {
    if (window.location.hash === '#all-admins') {
      setTimeout(() => {
        const element = document.getElementById('all-admins');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, []);


  // Sắp xếp tất cả admin theo view giảm dần
  const sortedAdmins = useMemo(() => {
    return [...admins].sort((a, b) => {
      const viewA = a.stats?.totalViews ?? 0;
      const viewB = b.stats?.totalViews ?? 0;
      return viewB - viewA; // Giảm dần
    });
  }, [admins]);

  // Top 10 admin cho slider
  const top10Admins = useMemo(() => {
    return sortedAdmins.slice(0, 10);
  }, [sortedAdmins]);

  // Lọc theo search cho section tất cả admin
  const filteredAdmins = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedAdmins;
    
    return sortedAdmins.filter((a) => {
      const name = a.displayName?.toLowerCase() ?? '';
      const bio = a.bio?.toLowerCase() ?? '';
      return name.includes(q) || bio.includes(q);
    });
  }, [sortedAdmins, query]);

  // Pagination cho section tất cả admin
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);
  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * adminsPerPage;
    return filteredAdmins.slice(start, start + adminsPerPage);
  }, [filteredAdmins, currentPage]);

  // Reset selected admin khi filter thay đổi
  useEffect(() => {
    setSelectedAdminIndex(0);
    setCurrentPage(1);
  }, [query]);

  // Selected admin để hiển thị trên banner (từ top 10)
  const selectedAdmin = useMemo(() => {
    if (top10Admins.length === 0) return null;
    const index = Math.min(selectedAdminIndex, top10Admins.length - 1);
    return top10Admins[index] || top10Admins[0];
  }, [top10Admins, selectedAdminIndex]);

  // Carousel admins (hiển thị cards) dạng vòng lặp từ top 10
  const carouselAdmins = useMemo(() => {
    if (top10Admins.length === 0) return [];
    const list = [];
    for (let i = 0; i < Math.min(cardsPerView, top10Admins.length); i += 1) {
      const idx = (selectedAdminIndex + i) % top10Admins.length;
      list.push(top10Admins[idx]);
    }
    return list;
  }, [top10Admins, selectedAdminIndex]);

  const handlePrev = () => {
    if (top10Admins.length === 0) return;
    setDirection('right');
    setSelectedAdminIndex((prev) => (prev - 1 + top10Admins.length) % top10Admins.length);
  };

  const handleNext = () => {
    if (top10Admins.length === 0) return;
    setDirection('left');
    setSelectedAdminIndex((prev) => (prev + 1) % top10Admins.length);
  };

  const handleScrollToAllAdmins = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('all-admins');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };


  return (
    <ClientLayout>
      <div className={styles.pageWrapper}>
        {/* Main Content Area */}
        <div className={styles.mainContent}>
          {loading ? (
            <div className={styles.loading}>Đang tải...</div>
          ) : error ? (
            <motion.div
              className={styles.error}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={styles.errorText}>{error}</div>
              <button className={styles.retryButton} onClick={() => void fetchAdmins()}>
                Thử lại
              </button>
            </motion.div>
          ) : (
            <>
              {/* Section 1: Hero Section */}
              <section className={styles.heroSection}>
                <div className={styles.heroContainer}>
                  <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <motion.div
                      className={styles.heroBadge}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                    >
                      <span className={styles.heroBadgeText}>Nền tảng ShowBill</span>
                    </motion.div>
                    
                    <h1 className={styles.heroTitle}>
                      <span className={styles.heroTitleGradient}>Khám phá</span>
                      <br />
                      ShowBill Platform
                    </h1>
                    
                    <p className={styles.heroDescription}>
                      Nền tảng chia sẻ và quản lý bill cho cộng đồng. Dễ dàng tạo, chia sẻ và theo dõi các bill của bạn một cách chuyên nghiệp.
                    </p>
                    
                    <div className={styles.heroActions}>
                      <motion.a
                        href="#all-admins"
                        className={styles.heroButtonPrimary}
                        onClick={handleScrollToAllAdmins}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                      >
                        <span>Khám phá ngay</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.a>
                      <motion.a
                        href="/guide"
                        className={styles.heroButtonSecondary}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        Tìm hiểu thêm
                      </motion.a>
                    </div>
                    
                    <motion.div
                      className={styles.heroFeatures}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                    >
                      <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className={styles.featureContent}>
                          <span className={styles.featureTitle}>Dễ dàng quản lý</span>
                          <span className={styles.featureDesc}>Tạo và quản lý bill nhanh chóng</span>
                        </div>
                      </div>
                      <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className={styles.featureContent}>
                          <span className={styles.featureTitle}>Chia sẻ cộng đồng</span>
                          <span className={styles.featureDesc}>Kết nối với cộng đồng người dùng</span>
                        </div>
                      </div>
                      <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18 7v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13 11l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13 16l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className={styles.featureContent}>
                          <span className={styles.featureTitle}>Thống kê chi tiết</span>
                          <span className={styles.featureDesc}>Theo dõi lượt xem và phân tích</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    className={styles.heroVisual}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const centerX = rect.width / 2;
                      const centerY = rect.height / 2;
                      const rotateX = ((y - centerY) / centerY) * -10;
                      const rotateY = ((x - centerX) / centerX) * 10;
                      e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                    }}
                  >
                    <div className={styles.heroVisualBg}>
                      <div className={styles.heroVisualGradient} />
                      <div className={styles.heroVisualGrid} />
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Section 2: Top 10 Admin Slider */}
              {top10Admins.length > 0 && (
                <motion.section
                  className={styles.top10Section}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                >
                <motion.div
                  className={styles.sectionHeader}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className={styles.sectionTitle}>
                    <Icon name="users" size={40} color="rgba(255, 255, 255, 0.9)" style={{ marginRight: 12 }} />
                    Top 10 Admin Nổi Bật
                  </h2>
                  <p className={styles.sectionSubtitle}>Những admin có lượt xem cao nhất</p>
                </motion.div>
                  
                  {/* Progress Indicator */}
                  <div className={styles.progressIndicator}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${((selectedAdminIndex + 1) / top10Admins.length) * 100}%`,
                      }}
                    />
                  </div>

                  {selectedAdmin && (
                    <>
                      {/* Animated Banner Section */}
                      <section className={styles.bannerSection}>
                <AnimatePresence>
                  <motion.div
                    key={selectedAdmin._id}
                    className={styles.bannerBackground}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    style={{
                      backgroundImage: selectedAdmin.bannerUrl
                        ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${getImageUrl(selectedAdmin.bannerUrl)})`
                        : selectedAdmin.bannerBase64
                        ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${selectedAdmin.bannerBase64})`
                        : selectedAdmin.avatarUrl
                        ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${getImageUrl(selectedAdmin.avatarUrl)})`
                        : selectedAdmin.avatarBase64
                        ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${selectedAdmin.avatarBase64})`
                        : 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(0, 238, 255, 0.2))',
                    }}
                  />
                </AnimatePresence>
                <div className={styles.bannerContent}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedAdmin._id}-text`}
                      className={styles.bannerText}
                      initial={{ opacity: 0, x: -25, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, x: 25, y: -10 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.05
                      }}
                    >
                    <p className={styles.bannerLocation}>
                      {selectedAdmin.displayName} • ShowBill Admin
                    </p>
                    <h1 className={styles.bannerTitle}>{selectedAdmin.displayName}</h1>
                    <p className={styles.bannerDescription}>
                      {selectedAdmin.bio || 'Place Description Here'}
                    </p>
                    <Link
                      to={`/profile/${shortenId(selectedAdmin._id)}`}
                      className={styles.discoverButton}
                    >
                      <span>DISCOVER PROFILE</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12h14M12 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                    </motion.div>
                  </AnimatePresence>

                  {/* Admin Cards Carousel */}
                  <div className={styles.carouselContainer}>
                    <AnimatePresence mode="popLayout" custom={direction}>
                      <motion.div
                        key={`carousel-${selectedAdminIndex}`}
                        className={styles.carouselWrapper}
                        custom={direction}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        variants={{
                          enter: (dir: 'left' | 'right') => ({
                            x: dir === 'left' ? 300 : -300,
                            opacity: 0,
                          }),
                          center: {
                            x: 0,
                            opacity: 1,
                          },
                          exit: (dir: 'left' | 'right') => ({
                            x: dir === 'left' ? -300 : 300,
                            opacity: 0,
                          }),
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                      >
                        {carouselAdmins.map((admin, idx) => {
                          const actualIndex = (selectedAdminIndex + idx) % filteredAdmins.length;
                          const isActive = actualIndex === selectedAdminIndex;
                          return (
                            <motion.div
                              key={`${admin._id}-${actualIndex}`}
                              className={`${styles.carouselCard} ${isActive ? styles.carouselCardActive : ''}`}
                              layout
                              transition={{
                                layout: { 
                                  duration: 0.4,
                                  ease: [0.25, 0.1, 0.25, 1],
                                },
                              }}
                            >
                            <div
                              className={styles.carouselCardImage}
                              style={{
                                backgroundImage: admin.avatarUrl
                                  ? `url(${getImageUrl(admin.avatarUrl)})`
                                  : admin.avatarBase64
                                  ? `url(${admin.avatarBase64})`
                                  : 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(0, 238, 255, 0.2))',
                              }}
                            >
                            </div>
                            <div className={styles.carouselCardOverlay}>
                              <h3 className={styles.carouselCardTitle}>{admin.displayName}</h3>
                              <p className={styles.carouselCardSubtitle}>
                                {admin.stats?.totalBills ?? 0} Bills • {admin.stats?.totalViews ?? 0} Views
                              </p>
                            </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>

                    {/* Carousel Controls */}
                    <div className={styles.carouselControls}>
                             <button
                               type="button"
                               className={styles.carouselNavButton}
                               onClick={handlePrev}
                               disabled={top10Admins.length <= 1}
                             >
                        ‹
                      </button>
                      <div className={styles.carouselPagination}>
                        <span className={styles.carouselNumbers}>
                          {selectedAdminIndex + 1} / {top10Admins.length}
                        </span>
                      </div>
                             <button
                               type="button"
                               className={styles.carouselNavButton}
                               onClick={handleNext}
                               disabled={top10Admins.length <= 1}
                             >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
                      </section>
                    </>
                  )}
                </motion.section>
              )}

              {/* Section 3: All Admins Grid */}
              <motion.section
                id="all-admins"
                className={styles.allAdminsSection}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className={styles.sectionHeader}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className={styles.sectionTitle}>
                    <Icon name="users" size={40} color="rgba(255, 255, 255, 0.9)" style={{ marginRight: 12 }} />
                    Tất Cả Admin
                  </h2>
                  <p className={styles.sectionSubtitle}>
                    {filteredAdmins.length} admin{filteredAdmins.length !== 1 ? 's' : ''} tổng cộng
                  </p>
                </motion.div>

                {/* Search Section */}
                <motion.div
                  className={styles.searchSection}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className={styles.searchInputWrapper}>
                    <Icon name="search" size={20} color="rgba(148, 163, 184, 0.8)" className={styles.searchIcon} />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Tìm kiếm admin..."
                      className={styles.searchInput}
                    />
                  </div>
                </motion.div>

                {filteredAdmins.length === 0 ? (
                  <div className={styles.emptySearch}>
                    <p className={styles.emptySearchTitle}>Không tìm thấy admin phù hợp</p>
                    <p className={styles.emptySearchText}>Thử đổi từ khóa hoặc xóa bộ lọc tìm kiếm.</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.adminGrid}>
                      {paginatedAdmins.map((admin, idx) => (
                        <motion.div
                          key={admin._id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-50px' }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                          <Link
                            to={`/profile/${shortenId(admin._id)}`}
                            className={styles.adminCard}
                          >
                          <div className={styles.cardHeader}>
                            <div className={styles.cardAvatar}>
                              {admin.avatarUrl ? (
                                <img src={getImageUrl(admin.avatarUrl)} alt={admin.displayName} className={styles.avatarImg} />
                              ) : admin.avatarBase64 ? (
                                <img src={admin.avatarBase64} alt={admin.displayName} className={styles.avatarImg} />
                              ) : (
                                <div className={styles.avatarPlaceholder} />
                              )}
                              {admin.avatarFrame && 
                               typeof admin.avatarFrame === 'string' && 
                               admin.avatarFrame.trim() !== '' && (
                                <img
                                  src={`/images/${admin.avatarFrame.trim()}`}
                                  alt="Avatar Frame"
                                  className={styles.cardAvatarFrame}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                            <h3 className={styles.cardName}>{admin.displayName}</h3>
                          </div>
                          {admin.bio && (
                            <p className={styles.cardBio}>{admin.bio}</p>
                          )}
                          <div className={styles.cardMetrics}>
                            <div className={styles.metric}>
                              <span className={styles.metricLabel}>Bills</span>
                              <span className={styles.metricValue}>{admin.stats?.totalBills ?? 0}</span>
                            </div>
                            <div className={styles.metric}>
                              <span className={styles.metricLabel}>Views</span>
                              <span className={styles.metricValue}>{admin.stats?.totalViews ?? 0}</span>
                            </div>
                          </div>
                        </Link>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <motion.div
                        className={styles.pagination}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5 }}
                      >
                        <button
                          type="button"
                          className={styles.pageButton}
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          ‹
                        </button>
                        <span className={styles.pageInfo}>
                          Trang {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          className={styles.pageButton}
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          ›
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.section>
            </>
          )}
        </div>

        {/* Stats Footer */}
        <footer className={styles.statsFooter}>
          <div className={styles.statsFooterContent}>
            <div className={styles.statsItem}>
              <span className={styles.statsLabel}>SHOWBILL</span>
            </div>
            <div className={styles.statsDivider} />
            <div className={styles.statsItem}>
              <span className={styles.statsValue}>{admins.length}</span>
              <span className={styles.statsText}>Admins</span>
            </div>
            <div className={styles.statsDivider} />
            <div className={styles.statsItem}>
              <span className={styles.statsValue}>{filteredAdmins.length}</span>
              <span className={styles.statsText}>Active</span>
            </div>
          </div>
        </footer>
      </div>
    </ClientLayout>
  );
};

export default Home;

