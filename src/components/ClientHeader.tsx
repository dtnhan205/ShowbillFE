import React from 'react';
import { motion } from 'framer-motion';
import styles from './ClientHeader.module.css';

const ClientHeader: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.bg} />
      <div className={styles.gridOverlay} />
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.inner}>
        <motion.div
          className={styles.pill}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className={styles.dot} />
          Tech Web • Nền tảng công nghệ
        </motion.div>

        <motion.h1
          className={styles.h1}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Khám phá sản phẩm công nghệ <span className={styles.accent}>hiện đại</span>
        </motion.h1>

        <motion.p
          className={styles.p}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
        >
          Giao diện tối giản, hiệu ứng mượt và danh mục sản phẩm được cập nhật liên tục.
        </motion.p>

        <div className={styles.actions}>
          <a href="#products" className={styles.btnPrimary}>
            Xem sản phẩm
          </a>
          <a href="#" className={styles.btnGhost}>
            Tư vấn cấu hình
          </a>
        </div>
      </div>

      <div className={styles.fadeBottom} />
    </header>
  );
};

export default ClientHeader;

