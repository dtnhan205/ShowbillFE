import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './ClientProductGrid.module.css';
import type { Product } from '../types';
import { base64ToBlobUrl } from '../utils/imageProtection';

type Props = {
  products: Product[];
  onOpen?: (product: Product) => void;
};

const ClientProductGrid: React.FC<Props> = ({ products, onOpen }) => {
  // Convert base64 to blob URLs for all products to hide from Network tab
  const productsWithBlobUrls = useMemo(() => {
    return products.map((p) => ({
      ...p,
      imageBlobUrl: p.imageBase64 ? base64ToBlobUrl(p.imageBase64) : null,
    }));
  }, [products]);

  // Cleanup blob URLs on unmount
  React.useEffect(() => {
    return () => {
      productsWithBlobUrls.forEach((p) => {
        if (p.imageBlobUrl && p.imageBlobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(p.imageBlobUrl);
        }
      });
    };
  }, [productsWithBlobUrls]);

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
        {productsWithBlobUrls.map((p, idx) => (
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
              {p.imageBlobUrl ? (
                <img
                  src={p.imageBlobUrl}
                  alt={p.name}
                  className={styles.image}
                  loading="lazy"
                  draggable={false}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                  onDragStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                  onMouseDown={(e) => {
                    // Prevent text selection
                    if (e.detail > 1) {
                      e.preventDefault();
                    }
                  }}
                />
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
