import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Banner.module.css';
import { bannerImages } from './bannerData';

const Banner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Tự động chuyển ảnh mỗi 4 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    }
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  // Tính toán khoảng cách animation dựa trên kích thước màn hình
  const getAnimationDistance = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768 ? 1000 : window.innerWidth > 480 ? 500 : 300;
    }
    return 1000;
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? getAnimationDistance() : -getAnimationDistance(),
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? getAnimationDistance() : -getAnimationDistance(),
      opacity: 0,
    }),
  };

  return (
    <div className={styles.banner}>
      <div className={styles.slider}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={styles.slide}
          >
            <img
              src={bannerImages[currentIndex].src}
              alt={bannerImages[currentIndex].alt}
              className={styles.image}
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          className={styles.navButton}
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonRight}`}
          onClick={goToNext}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      <div className={styles.dots}>
        {bannerImages.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;

