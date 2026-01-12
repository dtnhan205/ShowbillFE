import React, { useEffect, useRef, useState } from 'react';
import styles from './CursorTrail.module.css';

const CursorTrail: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const particleIdRef = useRef(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const currentPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Khởi tạo cursor position
    const initCursor = () => {
      if (cursorRef.current) {
        setIsCursorVisible(true);
      }
    };
    initCursor();

    const animateCursor = () => {
      const current = currentPositionRef.current;
      const target = targetPositionRef.current;
      
      // Smooth interpolation với easing nhanh hơn
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      
      // Tăng tốc độ phản ứng để giảm độ trễ - dùng speed cao hơn
      const speed = 0.6; // Tăng lên 0.6 để cursor bám sát chuột hơn
      current.x += dx * speed;
      current.y += dy * speed;
      
      setCursorPosition({ x: current.x, y: current.y });
      
      // Tiếp tục animate nếu còn khoảng cách đáng kể
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        animationFrameRef.current = requestAnimationFrame(animateCursor);
      } else {
        // Snap về đúng vị trí khi rất gần
        current.x = target.x;
        current.y = target.y;
        setCursorPosition({ x: current.x, y: current.y });
        animationFrameRef.current = null;
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      targetPositionRef.current = { x: e.clientX, y: e.clientY };
      setIsCursorVisible(true);
      
      // Luôn đảm bảo animation đang chạy
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(animateCursor);
      }

      const newParticle = {
        id: particleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
      };

      setParticles((prev) => {
        const updated = [...prev, newParticle];
        return updated.slice(-25);
      });

      // Fade out particles gradually
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1200);
    };

    // Chỉ ẩn cursor khi chuột rời khỏi window thực sự
    const handleMouseLeave = (e: MouseEvent) => {
      // Chỉ ẩn nếu chuột thực sự rời khỏi toàn bộ document (không phải chỉ một element)
      const target = e.target as HTMLElement;
      if (target === document.documentElement || target === document.body) {
        // Kiểm tra xem chuột có thực sự rời khỏi window không
        if (e.clientY <= 0 || e.clientX <= 0 || 
            e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
          setIsCursorVisible(false);
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }
      }
    };

    const handleMouseEnter = () => {
      setIsCursorVisible(true);
    };

    // Sử dụng capture phase để đảm bảo bắt được mọi event
    document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { capture: true });
    document.addEventListener('mouseenter', handleMouseEnter, { capture: true });
    
    // Đảm bảo cursor hiển thị khi component mount
    setIsCursorVisible(true);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseleave', handleMouseLeave, { capture: true });
      document.removeEventListener('mouseenter', handleMouseEnter, { capture: true });
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className={`${styles.customCursor} ${isCursorVisible ? styles.visible : ''}`}
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          display: isCursorVisible ? 'block' : 'none',
        }}
      />
      
      {/* Particle Trail */}
      <div className={styles.particleContainer}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default CursorTrail;

