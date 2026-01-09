import React, { useEffect, useRef, useState } from 'react';
import styles from './CursorTrail.module.css';

const CursorTrail: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    let animationFrame: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animationFrame);
      
      animationFrame = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;

        const newParticle = {
          id: particleIdRef.current++,
          x,
          y,
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
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
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
  );
};

export default CursorTrail;

