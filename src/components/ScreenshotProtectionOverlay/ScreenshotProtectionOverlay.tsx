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

  // Tạo grid pattern với watermark để phủ kín toàn bộ overlay
  // Tạo 4 hàng x 3 cột = 12 watermark, tất cả xoay cùng một góc
  const rows = 4;
  const cols = 3;
  const rotation = -25; // Tất cả xoay cùng một góc
  const watermarks = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const topPercent = (row + 1) * (100 / (rows + 1)) - 5; // Dịch lên trên 5%
      const leftPercent = (col + 1) * (100 / (cols + 1)) - 8; // Dịch sang trái 8%
      
      watermarks.push(
        <div
          key={index}
          className={styles.watermark}
          style={{
            top: `${topPercent}%`,
            left: `${leftPercent}%`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {text}
        </div>
      );
    }
  }

  return (
    <div ref={overlayRef} className={styles.overlay} style={{ opacity }}>
      {watermarks}
    </div>
  );
};

export default ScreenshotProtectionOverlay;

