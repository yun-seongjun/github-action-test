import { useEffect, useRef } from 'react';

interface UseBlankDivProps {
  isWithWidth?: boolean;
  isWithHeight?: boolean;
}

const useBlankDiv = ({ isWithWidth, isWithHeight }: UseBlankDivProps) => {
  const paddingBlankDivRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const setBlankDiv = () => {
    const wrapperHeight = wrapperRef.current?.clientHeight;
    const wrapperWidth = wrapperRef.current?.clientWidth;
    if (!paddingBlankDivRef.current) return;
    if (isWithHeight && wrapperHeight) {
      paddingBlankDivRef.current.style.minHeight = wrapperHeight + 'px';
    }
    if (isWithWidth && wrapperWidth) {
      paddingBlankDivRef.current.style.minWidth = wrapperWidth + 'px';
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((enrty) => {
        setBlankDiv();
      });
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      if (wrapperRef.current) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return { paddingBlankDivRef, wrapperRef };
};

export default useBlankDiv;
