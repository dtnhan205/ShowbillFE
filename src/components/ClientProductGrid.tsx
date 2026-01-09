import React from 'react';
import { motion } from 'framer-motion';
import styles from './ClientProductGrid.module.css';
import type { Product } from '../types';

type Props = {
  products: Product[];
  onOpen?: (product: Product) => void;
};

const ClientProductGrid: React.FC<Props> = ({ products, onOpen }) => {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Chưa có bill nào</p>
      </div>
    );
  }

  return (
    <section id="products" className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Bill đã up</h2>
          <p className={styles.subtitle}>Chọn bill để xem chi tiết</p>
        </div>
        <div className={styles.count}>Tổng: {products.length}</div>
      </div>

      <div className={styles.grid}>
        {products.map((p, idx) => (
          <motion.article
            key={p._id}
            className={styles.card}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.03 }}
            whileHover={{ y: -6 }}
            onClick={() => onOpen?.(p)}
            style={{ cursor: onOpen ? 'pointer' : undefined }}
          >
            <div className={styles.media}>
              {p.imageBase64 ? (
                <img src={p.imageBase64} alt={p.name} className={styles.image} loading="lazy" />
              ) : (
                <div className={styles.noImage}>No image</div>
              )}

              <div className={styles.mediaOverlay} />

              <div className={styles.badge}>
                <span className={styles.badgeDot} />
                BILL
              </div>
            </div>

            <div className={styles.body}>
              <h3 className={styles.name}>{p.name}</h3>
              <p className={styles.desc}>
                OB: <b>{p.obVersion ?? '-'}</b> • Category: <b>{p.category ?? '-'}</b>
              </p>

              <div className={styles.footer}>
                <span className={styles.status}>
                  <span className={styles.statusDot} />
                  Đã duyệt
                </span>
                <button
                  type="button"
                  className={styles.button}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen?.(p);
                  }}
                >
                  Xem bill chi tiết
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default ClientProductGrid;
