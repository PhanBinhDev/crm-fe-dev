import { useEffect, useRef } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (isLocked) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY;

      // Apply styles to lock scroll
      const body = document.body;
      body.style.position = 'fixed';
      body.style.top = `-${scrollPositionRef.current}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';

      return () => {
        // Restore styles
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      };
    }
  }, [isLocked]);
};
