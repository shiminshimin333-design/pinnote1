import React from 'react';
import {
  Sparkles,
  Edit3,
  Trash2,
  Heart,
  ExternalLink,
  PenTool,
  CheckSquare,
  Square,
  Share2,
} from 'lucide-react';
import { PinItem } from '../types/note';
import { PushPin, WashiTape } from './PinOrTack';

interface PinCardProps {
  pin: PinItem;
  onExplainAI: (pin: PinItem) => void;
  onEdit: (pin: PinItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDrawing?: (pin: PinItem) => void;
  onToggleCheckItem?: (pinId: string, itemId: string) => void;
  isCanvasMode?: boolean;
}

export const PinCard: React.FC<PinCardProps> = ({
  pin,
  onExplainAI,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenDrawing,
  onToggleCheckItem,
  isCanvasMode = false,
}) => {
  const rotationStyle = isCanvasMode ? undefined : { transform: `rotate(${pin.rotation || 0}deg)` };

  return (
    <div
      className={`group relative rounded-3xl transition-all duration-300 hover:z-30 ${
        isCanvasMode
          ? 'shadow-pin hover:shadow-2xl'
          : 'shadow-pin hover:shadow-xl hover:-translate-y-1 hover:rotate-0'
      }`}
      style={{
        ...rotationStyle,
        backgroundColor: pin.type === 'photo' ? '#FFFFFF' : pin.color || '#FFFDF9',
      }}
    >
      {/* Decorative Washi Tape & PushPin */}
      <WashiTape style={pin.washiTape} />
      <PushPin style={pin.pinType} />

      {/* Floating Action Bar (visible on card hover, Pinterest style) */}
      <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-md border border-stone-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExplainAI(pin);
          }}
          className="p-1.5 rounded-full hover:bg-rose-50 text-[#E11D48] transition-transform hover:scale-110"
          title="Explain with AI ✨"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {pin.type === 'sketch' && onOpenDrawing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDrawing(pin);
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 text-[#3C2F2B] transition-transform hover:scale-110"
            title="Edit Handwriting / Doodle"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pin.id);
          }}
          className={`p-1.5 rounded-full hover:bg-stone-100 transition-transform hover:scale-110 ${
            pin.favorite ? 'text-rose-500 fill-rose-500' : 'text-stone-500'
          }`}
          title="Favorite Pin"
        >
          <Heart className={`w-3.5 h-3.5 ${pin.favorite ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(pin);
          }}
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-transform hover:scale-110"
          title="Edit Note"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(pin.id);
          }}
          className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-transform hover:scale-110"
          title="Delete Pin"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Content based on type */}
      <div className="p-5 pt-7">
        {/* POLAROID PHOTO TYPE */}
        {pin.type === 'photo' && pin.imageUrl && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
              <img
                src={pin.imageUrl}
                alt={pin.title}
                className="w-full h-auto object-cover max-h-80 hover:scale-102 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            {pin.title && (
              <h3 className={`text-lg font-bold text-[#2D2727] ${pin.fontFamily}`}>
                {pin.title}
              </h3>
            )}
            {pin.content && (
              <p className={`text-sm text-[#4A3E39] leading-relaxed ${pin.fontFamily}`}>
                {pin.content}
              </p>
            )}
          </div>
        )}

        {/* SKETCH / HANDWRITING TYPE */}
        {pin.type === 'sketch' && (
          <div className="space-y-3">
            {pin.title && (
              <h3 className={`text-lg font-bold text-[#2D2727] ${pin.fontFamily}`}>
                {pin.title}
              </h3>
            )}
            {pin.drawingData && (
              <div
                onClick={() => onOpenDrawing && onOpenDrawing(pin)}
                className="rounded-2xl overflow-hidden bg-white/70 border border-stone-200/60 p-2 cursor-pointer hover:border-[#E11D48]/50 transition-all shadow-2xs group/canvas"
                title="Click to edit drawing"
              >
                <img
                  src={pin.drawingData}
                  alt="Handwritten sketch"
                  className="w-full h-auto object-contain max-h-72"
                />
                <div className="text-[10px] text-stone-500 text-center pt-1 font-mono flex items-center justify-center gap-1 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                  <PenTool className="w-2.5 h-2.5" />
                  <span>Click to edit drawing</span>
                </div>
              </div>
            )}
            {pin.content && (
              <p className={`text-sm text-[#4A3E39] leading-relaxed ${pin.fontFamily}`}>
                {pin.content}
              </p>
            )}
          </div>
        )}

        {/* WEBLINK TYPE */}
        {pin.type === 'weblink' && (
          <div className="space-y-3">
            {pin.imageUrl && (
              <div className="overflow-hidden rounded-2xl bg-stone-100 mb-2">
                <img
                  src={pin.imageUrl}
                  alt={pin.title}
                  className="w-full h-auto max-h-48 object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C5E47] uppercase tracking-wider">
              <span>{pin.webMeta?.domain || 'Web Link'}</span>
              <ExternalLink className="w-3 h-3" />
            </div>
            <h3 className={`text-base font-bold text-[#2D2727] ${pin.fontFamily}`}>
              <a
                href={pin.webMeta?.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {pin.title}
              </a>
            </h3>
            {pin.content && (
              <p className={`text-xs text-[#52443E] leading-relaxed line-clamp-4 ${pin.fontFamily}`}>
                {pin.content}
              </p>
            )}
          </div>
        )}

        {/* CHECKLIST TYPE */}
        {pin.type === 'checklist' && (
          <div className="space-y-3">
            {pin.title && (
              <h3 className={`text-lg font-bold text-[#2D2727] ${pin.fontFamily}`}>
                {pin.title}
              </h3>
            )}
            {pin.checklist && pin.checklist.length > 0 && (
              <div className="space-y-2 pt-1">
                {pin.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleCheckItem && onToggleCheckItem(pin.id, item.id)}
                    className="flex items-start gap-2.5 cursor-pointer group/check"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-[#E11D48] transition-transform group-hover/check:scale-110"
                    >
                      {item.done ? (
                        <CheckSquare className="w-4 h-4 fill-[#FFE4E6]" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                    <span
                      className={`text-sm leading-snug flex-1 select-none ${pin.fontFamily} ${
                        item.done ? 'line-through opacity-50 text-stone-500' : 'text-[#2D2727]'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STANDARD STICKY / QUOTE TYPE */}
        {(pin.type === 'sticky' || pin.type === 'quote') && (
          <div className="space-y-2.5">
            {pin.title && (
              <h3
                className={`font-bold text-[#2D2727] ${pin.fontFamily} ${
                  pin.fontSize === 'xl' ? 'text-xl' : 'text-lg'
                }`}
              >
                {pin.title}
              </h3>
            )}
            <p
              className={`leading-relaxed text-[#3C2F2B] whitespace-pre-wrap ${pin.fontFamily} ${
                pin.fontSize === 'sm'
                  ? 'text-xs'
                  : pin.fontSize === 'base'
                  ? 'text-sm'
                  : pin.fontSize === 'xl'
                  ? 'text-xl font-medium'
                  : 'text-base'
              }`}
            >
              {pin.content}
            </p>
          </div>
        )}

        {/* Bottom AI Explainer Action Badge */}
        <div className="pt-4 mt-3 border-t border-black/5 flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {pin.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 text-[#5C4D45] hover:bg-black/10 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Quick AI Explain button */}
          <button
            onClick={() => onExplainAI(pin)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 hover:bg-[#FFE4E6] text-[11px] font-semibold text-[#E11D48] border border-rose-200 shadow-2xs transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Ask AI to explain this"
          >
            <Sparkles className="w-3 h-3 text-[#E11D48]" />
            <span>Explain AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
