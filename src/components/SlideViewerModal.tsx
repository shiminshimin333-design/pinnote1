import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Edit3,
  Heart,
  Share2,
  BookOpen,
} from 'lucide-react';
import { PinItem } from '../types/note';
import { PushPin, WashiTape } from './PinOrTack';

interface SlideViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: PinItem | null;
  onEditInStudio: (pin: PinItem) => void;
  onExplainAI: (pin: PinItem) => void;
}

export const SlideViewerModal: React.FC<SlideViewerModalProps> = ({
  isOpen,
  onClose,
  pin,
  onEditInStudio,
  onExplainAI,
}) => {
  const [slideIdx, setSlideIdx] = useState(0);

  if (!isOpen || !pin) return null;

  const slides = pin.slides && pin.slides.length > 0 ? pin.slides : [
    {
      id: 's-1',
      title: pin.title,
      content: pin.content,
      fontFamily: pin.fontFamily,
      fontSize: pin.fontSize,
      color: pin.color,
      paperStyle: 'ruled' as const,
      washiTape: pin.washiTape,
      pinType: pin.pinType,
      drawingData: pin.drawingData,
      imageUrl: pin.imageUrl,
      checklist: pin.checklist,
    },
  ];

  const currentSlide = slides[slideIdx] || slides[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-4xl shadow-2xl border border-[#E7DFD5] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-3.5 bg-[#FFFDF9] border-b border-[#ECE3D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{pin.author?.avatar || '🌸'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-playfair text-[#2D2727]">
                  {pin.title || 'Aesthetic Slide Deck'}
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48]">
                  Public Note
                </span>
              </div>
              <p className="text-xs text-[#8C7A70]">
                Created by {pin.author?.name || 'Aesthetic Curator'} • {slides.length} Slides
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onExplainAI(pin)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFE4E6] text-[#E11D48] text-xs font-semibold hover:bg-[#FECDD3] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain with AI</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEditInStudio(pin);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#E7DFD5] text-[#3C2F2B] text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Slides</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F2ECE4] text-[#78665E]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Display Arena */}
        <div className="flex-1 bg-[#F5EFE6] p-6 sm:p-10 flex items-center justify-center overflow-y-auto relative">
          {/* Previous Slide button */}
          <button
            onClick={() => setSlideIdx((prev) => Math.max(0, prev - 1))}
            disabled={slideIdx === 0}
            className="absolute left-4 z-40 p-3 rounded-full bg-white/90 shadow-md border border-stone-200 text-[#3C2F2B] hover:bg-white disabled:opacity-30 transition-transform hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Slide button */}
          <button
            onClick={() => setSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={slideIdx === slides.length - 1}
            className="absolute right-4 z-40 p-3 rounded-full bg-white/90 shadow-md border border-stone-200 text-[#3C2F2B] hover:bg-white disabled:opacity-30 transition-transform hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Current Slide Sheet */}
          <div
            className={`relative w-full max-w-xl min-h-[480px] rounded-3xl p-8 sm:p-10 shadow-polaroid border border-black/10 transition-all ${
              currentSlide.paperStyle === 'ruled'
                ? 'bg-notebook-ruled'
                : currentSlide.paperStyle === 'grid'
                ? 'bg-notebook-grid'
                : ''
            }`}
            style={{ backgroundColor: currentSlide.color || '#FFFDF9' }}
          >
            <WashiTape style={currentSlide.washiTape || 'polka'} />
            <PushPin style={currentSlide.pinType || 'red-pin'} />

            {/* Slide title */}
            {currentSlide.title && (
              <h2 className={`text-2xl font-bold mb-3 text-[#2D2727] ${currentSlide.fontFamily}`}>
                {currentSlide.title}
              </h2>
            )}

            {/* Uploaded image */}
            {currentSlide.imageUrl && (
              <div className="rounded-2xl overflow-hidden max-h-56 mb-4 shadow-xs border border-black/10">
                <img
                  src={currentSlide.imageUrl}
                  alt="Slide illustration"
                  className="w-full h-auto object-cover max-h-56"
                />
              </div>
            )}

            {/* Handwritten sketch drawing if any */}
            {currentSlide.drawingData && (
              <div className="rounded-2xl overflow-hidden bg-white/50 border border-black/10 mb-4 p-2 shadow-2xs">
                <img
                  src={currentSlide.drawingData}
                  alt="Handwritten sketch"
                  className="w-full h-auto object-contain max-h-64 mx-auto"
                />
              </div>
            )}

            {/* Content text */}
            {currentSlide.content && (
              <p
                className={`leading-relaxed text-[#2D2727] whitespace-pre-wrap ${currentSlide.fontFamily} ${
                  currentSlide.fontSize === 'sm'
                    ? 'text-sm'
                    : currentSlide.fontSize === 'xl'
                    ? 'text-xl'
                    : 'text-base'
                }`}
              >
                {currentSlide.content}
              </p>
            )}

            {/* Pinned Sticky Notes on this slide */}
            {currentSlide.stickies && currentSlide.stickies.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-black/10">
                {currentSlide.stickies.map((stk) => (
                  <div
                    key={stk.id}
                    className="p-3 rounded-2xl shadow-xs border border-black/10"
                    style={{
                      backgroundColor: stk.color,
                      transform: `rotate(${stk.rotation || 0}deg)`,
                    }}
                  >
                    <p className={`text-xs ${stk.fontFamily} text-[#2D2727] whitespace-pre-wrap`}>
                      {stk.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Stickers stamped on slide */}
            {currentSlide.stickers && currentSlide.stickers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-2">
                {currentSlide.stickers.map((stk) => (
                  <span key={stk.id} className="text-xl filter drop-shadow-xs select-none">
                    {stk.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Dots */}
        <div className="px-6 py-3 bg-[#FFFDF9] border-t border-[#ECE3D8] flex items-center justify-between text-xs">
          <span className="font-mono text-[#8C7A70]">
            Slide {slideIdx + 1} of {slides.length}
          </span>

          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  slideIdx === idx ? 'w-6 bg-[#E11D48]' : 'bg-[#E7DFD5] hover:bg-[#8C7A70]'
                }`}
              />
            ))}
          </div>

          <span className="text-[#8C7A70]">Swipe or click arrows to flip</span>
        </div>
      </div>
    </div>
  );
};
