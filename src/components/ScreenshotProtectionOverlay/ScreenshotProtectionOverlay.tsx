import React, { useEffect, useRef } from 'react';
import styles from './ScreenshotProtectionOverlay.module.css';

type Props = {
  text?: string;
  opacity?: number;
};

/**
 * Watermark overlay component to make screenshots less useful
 * Displays a repeating watermark pattern over protected content
 */
const ScreenshotProtectionOverlay: React.FC<Props> = ({
  text = 'ShowBILL',
  opacity = 0.3,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make overlay non-interactive but visible in screenshots
    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = 'none';
    }
  }, []);

  // Tạo 2 dòng chữ đứng im: một ở góc trái dưới, một ở góc phải dưới
  const watermarks = Array.from({ length: 2 }, (_, i) => (
    <div key={i} className={styles.watermark} data-index={i}>
      {text}
    </div>
  ));

  return (
    <div ref={overlayRef} className={styles.overlay} style={{ opacity }}>
      {watermarks}
    </div>
  );
};

export default ScreenshotProtectionOverlay;

