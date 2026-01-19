import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icons/Icon';
import styles from './ClientProductGrid.module.css';
import type { Product } from '../types';
import { base64ToBlobUrl } from '../utils/imageProtection';
import { maskSensitiveText } from '../utils/legal';
import { getImageUrl } from '../utils/imageUrl';

type Props = {
  products: Product[];
  onOpen?: (product: Product) => void;
};

const ClientProductGrid: React.FC<Props> = ({ products, onOpen }) => {
  // Get image URL (prefer imageUrl, fallback to imageBase64 for backward compatibility)
  const productsWithBlobUrls = useMemo(() => {
    return products.map((p) => {
      let imageBlobUrl: string | null = null;
      
      if (p.imageUrl) {
        // Use imageUrl directly (backend serves static files)
        imageBlobUrl = getImageUrl(p.imageUrl);
      } else if (p.imageBase64) {
        // Fallback to base64 (backward compatibility)
        imageBlobUrl = base64ToBlobUrl(p.imageBase64);
      }
      
      return {
      ...p,
        imageBlobUrl,
      };
    });
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
          <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="clipboard" size={28} color="rgba(255, 255, 255, 0.9)" /> Bill đã up
          </h2>
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
            data-protected="true"
          >
            <div className={styles.media} data-protected="true">
              {p.imageBlobUrl ? (
                <img
                  src={p.imageBlobUrl}
                  alt={maskSensitiveText(p.name)}
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
              <h3 className={styles.name}>{maskSensitiveText(p.name)}</h3>
              <p className={styles.desc}>
                OB: <b>{p.obVersion ?? '-'}</b> • Category: <b>{p.category ?? '-'}</b>
              </p>

              <div className={styles.footer}>
                {p.views !== undefined && (
                  <div className={styles.viewsContainer}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span className={styles.views}>{p.views}</span>
                  </div>
                )}
                <button
                  type="button"
                  className={styles.button}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen?.(p);
                  }}
                >
                  Xem chi tiết
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
