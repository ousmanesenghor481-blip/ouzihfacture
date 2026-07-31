import React from 'react';
import { cn } from '@/lib/utils/cn';
import { InvoiceStatus } from '@/types';
import { getStatusConfig } from '@/lib/constants';

interface BadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm', className }) => {
  const config = getStatusConfig(status);
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
};
