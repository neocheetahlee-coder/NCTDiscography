import { useCallback, useEffect, useRef } from 'react';

export default function useDraggable() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const currentX = useRef(0);
  const targetX = useRef(0);
  const velocity = useRef(0);
  const lastPointerX = useRef(0);
  const isDragging = useRef(false);
  const animationFrame = useRef(null);
  const bounds = useRef(0);

  const updateBounds = useCallback(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    bounds.current = container.clientWidth - track.scrollWidth - 80;
  }, []);

  const startDrag = useCallback((event) => {
    if (event.type === 'mousedown' && event.button !== 0) return;

    const pointerX = event.type.startsWith('touch')
      ? event.touches[0]?.pageX
      : event.pageX;
    if (pointerX === undefined) return;

    isDragging.current = true;
    lastPointerX.current = pointerX;
  }, []);

  const moveDrag = useCallback((event) => {
    if (!isDragging.current) return;

    if (event.type.startsWith('touch')) {
      event.preventDefault();
    }

    const pointerX = event.type.startsWith('touch')
      ? event.touches[0]?.pageX
      : event.pageX;
    if (pointerX === undefined) return;

    const delta = pointerX - lastPointerX.current;
    lastPointerX.current = pointerX;
    targetX.current += delta;
    velocity.current = delta * 0.75;
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    velocity.current *= 0.85;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return undefined;

    const updatePhysics = () => {
      const limit = bounds.current;
      if (targetX.current > 0) {
        targetX.current = 0;
      } else if (targetX.current < limit) {
        targetX.current = limit;
      }

      const spring = (targetX.current - currentX.current) * 0.12;
      velocity.current += spring;
      velocity.current *= 0.82;
      currentX.current += velocity.current;

      if (
        Math.abs(targetX.current - currentX.current) < 0.2
        && Math.abs(velocity.current) < 0.2
      ) {
        currentX.current = targetX.current;
        velocity.current = 0;
      }

      const skewValue = velocity.current * 0.18;
      const scaleValue = 1 - Math.min(Math.abs(velocity.current) * 0.006, 0.08);
      track.style.transform = `translate3d(${currentX.current}px, 0, 0)`;

      track.querySelectorAll('.clip-item').forEach((item) => {
        item.style.transform = `skewX(${skewValue}deg) scale(${scaleValue})`;
      });

      animationFrame.current = window.requestAnimationFrame(updatePhysics);
    };

    updateBounds();
    animationFrame.current = window.requestAnimationFrame(updatePhysics);

    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchcancel', stopDrag);
    window.addEventListener('resize', updateBounds);

    return () => {
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current);
      }
      window.removeEventListener('mousemove', moveDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', moveDrag);
      window.removeEventListener('touchend', stopDrag);
      window.removeEventListener('touchcancel', stopDrag);
      window.removeEventListener('resize', updateBounds);
      isDragging.current = false;
    };
  }, [moveDrag, startDrag, stopDrag, updateBounds]);

  return {
    containerRef,
    trackRef,
    updateBounds,
    startDrag,
  };
}
