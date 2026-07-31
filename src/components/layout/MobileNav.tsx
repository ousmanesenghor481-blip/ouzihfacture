'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils/cn';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg absolute top-3.5 left-4 z-20 transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          open ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar className="w-full shadow-none border-r-0" isMobile={true} />
        
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-4 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full z-50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
