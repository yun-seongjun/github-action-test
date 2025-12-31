import { forwardRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ComponentUtils } from '@design-system/utils';

export const ImgAsset = {
  placeholder: {
    src: '/images/skeleton-img.png',
    alt: '기본 이미지',
  },
} as const;

interface ImgProps {
  className: string;
  src?: string | null;
  alt: string;
  position?: 'absolute' | 'relative' | 'fixed';
  overlay?: boolean;
  placeholder?: string;
}

const Img = forwardRef<HTMLDivElement, ImgProps>(
  (
    {
      className,
      src,
      alt,
      position = 'relative',
      overlay = false,
      placeholder = ImgAsset.placeholder.src,
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const controls = useAnimation();

    useEffect(() => {
      if (isLoaded) {
        controls.start('visible');
      }
    }, [isLoaded]);

    return (
      <div
        className={ComponentUtils.cn(position, className, 'overflow-hidden')}
        ref={ref}
      >
        {!isLoaded && (
          <img
            className="h-full w-full object-cover"
            src={placeholder}
            alt={alt}
          />
        )}
        <motion.img
          initial="hidden"
          animate={controls}
          transition={{ duration: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          className={ComponentUtils.cn(
            'h-full w-full object-cover',
            !isLoaded && 'hidden',
          )}
          src={src ?? placeholder}
          alt={alt}
          onLoad={() => {
            setIsLoaded(true);
          }}
        />
        {overlay && (
          <div
            className={ComponentUtils.cn(
              className,
              'bg-mono-900/[0.05] absolute top-0',
            )}
          />
        )}
      </div>
    );
  },
);

Img.displayName = 'Img';

export default Img;
