import React, { useState, useRef } from 'react';
import { PinItem } from '../types/note';
import { PinCard } from './PinCard';
import { Move, Sparkles, Plus, RotateCcw } from 'lucide-react';

interface FreeformCanvasProps {
  pins: PinItem[];
  onUpdatePosition: (id: string, newPos: { x: number; y: number }, newZ?: number) => void;
  onExplainAI: (pin: PinItem) => void;
  onEdit: (pin: PinItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDrawing: (pin?: PinItem) => void;
  onOpenSlideViewer?: (pin: PinItem) => void;
  onToggleCheckItem: (pinId: string, itemId: string) => void;
  onCreateNewNote: () => void;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({
  pins,
  onUpdatePosition,
  onExplainAI,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenDrawing,
  onOpenSlideViewer,
  onToggleCheckItem,
  onCreateNewNote,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [maxZIndex, setMaxZIndex] = useState(50);

  const handleMouseDown = (e: React.MouseEvent, pin: PinItem) => {
    // Only drag when clicking the drag handle or card header, avoiding inner buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }

    e.preventDefault();
    setActiveDragId(pin.id);
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);

    const clientX = e.clientX;
    const clientY = e.clientY;

    dragOffsetRef.current = {
      x: clientX - (pin.position?.x ?? 50),
      y: clientY - (pin.position?.y ?? 50),
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = Math.max(10, Math.min(2400, moveEvent.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(2400, moveEvent.clientY - dragOffsetRef.current.y));
      onUpdatePosition(pin.id, { x: newX, y: newY }, newZ);
    };

    const handleMouseUp = () => {
      setActiveDragId(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[900px] h-[calc(100vh-140px)] overflow-auto p-8 select-none"
    >
      <div className="absolute top-4 left-6 z-40 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#E7DFD5] shadow-xs text-xs text-[#6F5F57] flex items-center gap-2">
        <Move className="w-3.5 h-3.5 text-[#E11D48]" />
        <span>Moodboard Mode: Drag any note to arrange your creative board!</span>
      </div>

      {pins.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
          <Sparkles className="w-10 h-10 text-[#E11D48] mb-2" />
          <p className="text-base font-playfair font-bold text-[#2D2727]">Canvas is Empty</p>
          <button
            onClick={onCreateNewNote}
            className="mt-4 px-5 py-2.5 rounded-full bg-[#E11D48] text-white text-xs font-semibold shadow-md"
          >
            Create First Note
          </button>
        </div>
      ) : (
        <div className="relative min-w-[1400px] min-h-[1400px]">
          {pins.map((pin) => {
            const posX = pin.position?.x ?? 50;
            const posY = pin.position?.y ?? 50;
            const zIndex = pin.zIndex ?? 10;
            const isDragging = activeDragId === pin.id;

            return (
              <div
                key={pin.id}
                onMouseDown={(e) => handleMouseDown(e, pin)}
                style={{
                  position: 'absolute',
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: `${pin.size?.width || 320}px`,
                  zIndex: isDragging ? 999 : zIndex,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                className={`transition-shadow ${
                  isDragging ? 'shadow-2xl scale-102 ring-2 ring-[#E11D48]/40' : ''
                }`}
              >
                <PinCard
                  pin={pin}
                  onExplainAI={onExplainAI}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFavorite={onToggleFavorite}
                  onOpenDrawing={onOpenDrawing}
                  onOpenSlideViewer={onOpenSlideViewer}
                  onToggleCheckItem={onToggleCheckItem}
                  isCanvasMode={true}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
