import React, { useState, useEffect } from 'react';

const imageCache = new Set<string>();

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800',
  className = '',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState<boolean>(imageCache.has(src));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    if (imageCache.has(src)) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoaded(true);
      };
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
      {/* Skeleton loading animation while image is fetching */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-blue-500 animate-spin" />
        </div>
      )}

      <img
        {...props}
        src={hasError ? fallbackSrc : currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          imageCache.add(currentSrc);
          setIsLoaded(true);
        }}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setCurrentSrc(fallbackSrc);
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
