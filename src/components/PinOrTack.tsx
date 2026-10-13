import React from 'react';
import { PinStyle, WashiTapeStyle } from '../types/note';

export const WashiTape: React.FC<{ style: WashiTapeStyle; className?: string }> = ({
  style,
  className = '',
}) => {
  if (style === 'none') return null;

  const baseClasses =
    'h-7 w-32 -top-3 left-1/2 -translate-x-1/2 absolute z-20 shadow-sm opacity-90 transition-transform hover:scale-105';

  switch (style) {
    case 'polka':
      return (
        <div
          className={`${baseClasses} bg-[#FED7AA] border-y border-[#FDBA74]/50 ${className}`}
          style={{
            backgroundImage: 'radial-gradient(#EA580C 15%, transparent 16%)',
            backgroundSize: '8px 8px',
          }}
        />
      );
    case 'stripes':
      return (
        <div
          className={`${baseClasses} bg-[#E9D5FF] border-y border-[#D8B4FE]/50 ${className}`}
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(147, 51, 234, 0.25) 6px, rgba(147, 51, 234, 0.25) 12px)',
          }}
        />
      );
    case 'pink':
      return (
        <div
          className={`${baseClasses} bg-[#FECDD3] border-y border-[#FDA4AF]/60 ${className}`}
          style={{
            backgroundImage: 'radial-gradient(#F43F5E 15%, transparent 16%)',
            backgroundSize: '10px 10px',
          }}
        />
      );
    case 'floral':
      return (
        <div
          className={`${baseClasses} bg-[#BBF7D0] border-y border-[#86EFAC]/50 ${className}`}
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(22, 101, 52, 0.15) 5px, rgba(22, 101, 52, 0.15) 10px)',
          }}
        />
      );
    case 'grid':
      return (
        <div
          className={`${baseClasses} bg-[#BFDBFE] border-y border-[#93C5FD]/60 ${className}`}
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(29, 78, 216, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(29, 78, 216, 0.15) 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }}
        />
      );
    case 'kraft':
    default:
      return (
        <div
          className={`${baseClasses} bg-[#D7C4B7] border-y border-[#BFA899] text-[#7A5C4D] text-[9px] font-mono flex items-center justify-center uppercase tracking-widest ${className}`}
        >
          // washi //
        </div>
      );
  }
};

export const PushPin: React.FC<{ style: PinStyle; className?: string }> = ({
  style,
  className = '',
}) => {
  if (style === 'none' || style === 'tape') return null;

  switch (style) {
    case 'red-pin':
      return (
        <div
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none ${className}`}
        >
          <div className="relative group">
            {/* Pin head */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 via-red-600 to-rose-900 shadow-md border border-red-300 ring-2 ring-red-400/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/70 -translate-x-0.5 -translate-y-0.5" />
            </div>
            {/* Pin needle shadow */}
            <div className="w-1 h-2 bg-gradient-to-b from-stone-400 to-stone-700 mx-auto -mt-0.5 shadow-sm" />
          </div>
        </div>
      );

    case 'gold-tack':
      return (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none ${className}`}
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-md border border-amber-200 ring-1 ring-amber-500/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/80" />
          </div>
        </div>
      );

    case 'flower-clip':
      return (
        <div
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-base filter drop-shadow-sm ${className}`}
        >
          🌸
        </div>
      );

    case 'star-clip':
      return (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-base filter drop-shadow-sm ${className}`}
        >
          ⭐
        </div>
      );

    default:
      return null;
  }
};
