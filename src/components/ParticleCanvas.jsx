import { useEffect, useRef } from 'react';
import { initParticles } from '../utils/particles';

/**
 * theme: 'light' → red dots on white bg
 *        'dark'  → white dots on red bg
 */
export default function ParticleCanvas({ theme = 'light', style = {} }) {
  const id = `particle-canvas-${theme}`;
  const cleanupRef = useRef(null);

  useEffect(() => {
    // small delay so the canvas is in the DOM
    const t = setTimeout(() => {
      cleanupRef.current = initParticles(id, theme);
    }, 50);
    return () => {
      clearTimeout(t);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [id, theme]);

  return (
    <canvas
      id={id}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
}
