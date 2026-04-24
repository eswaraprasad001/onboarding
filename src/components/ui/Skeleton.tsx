'use client';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  className?: string;
}

const variantClasses = {
  text: 'rounded-md h-4',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
};

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${className}`}
      style={{
        width: width ?? (variant === 'circular' ? '40px' : '100%'),
        height:
          height ??
          (variant === 'circular' ? '40px' : variant === 'text' ? '1rem' : '100px'),
      }}
    />
  );
}
