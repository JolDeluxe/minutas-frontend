import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ImageViewer = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = typeof initialIndex === 'number' ? initialIndex : parseInt(initialIndex, 10);
    return isNaN(idx) || idx < 0 || idx >= (images?.length || 0) ? 0 : idx;
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!images || images.length === 0) return null;
  const currentImg = images[currentIndex];
  if (!currentImg) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-600 transition-all z-[100001] shadow-2xl"
      >
        <X size={36} />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-8 md:p-12">
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
            className="absolute left-8 w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-md"
          >
            <ChevronLeft size={48} />
          </button>
        )}

        <div className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center pointer-events-auto">
          <img src={currentImg.preview || currentImg.url || currentImg.base64Thumb} className="max-w-[90vw] max-h-[75vh] w-auto h-auto object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 select-none" alt="Vista ampliada" />
        </div>

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
            className="absolute right-8 w-16 h-16 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all z-[100001] backdrop-blur-md"
          >
            <ChevronRight size={48} />
          </button>
        )}
      </div>

      <div className="absolute bottom-10 flex gap-3 z-[100001]">
        {images.map((_, i) => (
          <button key={i} onClick={() => setCurrentIndex(i)} className={cn("h-2.5 rounded-full transition-all duration-300", i === currentIndex ? "bg-white w-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "bg-white/20 w-2.5 hover:bg-white/40")} />
        ))}
      </div>
    </div>,
    document.body
  );
};
