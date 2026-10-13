import React from 'react';
import { PinItem } from '../types/note';
import { PinCard } from './PinCard';
import { Plus, Sparkles } from 'lucide-react';

interface MasonryGridProps {
  pins: PinItem[];
  onExplainAI: (pin: PinItem) => void;
  onEdit: (pin: PinItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenDrawing: (pin?: PinItem) => void;
  onOpenSlideViewer?: (pin: PinItem) => void;
  onToggleCheckItem: (pinId: string, itemId: string) => void;
  onCreateNewNote: () => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  pins,
  onExplainAI,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenDrawing,
  onOpenSlideViewer,
  onToggleCheckItem,
  onCreateNewNote,
}) => {
  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#F4ECE3] text-[#8C5E47] flex items-center justify-center mb-4 shadow-sm border border-[#E7DFD5]">
          <Sparkles className="w-8 h-8 text-[#E11D48]" />
        </div>
        <h3 className="text-xl font-bold font-playfair text-[#2D2727] mb-2">
          Your Moodboard is Waiting!
        </h3>
        <p className="text-sm text-[#8C7A70] mb-6">
          Create aesthetic sticky notes, handwrite doodles, upload photos from the web, or ask AI to break down complex ideas.
        </p>
        <button
          onClick={onCreateNewNote}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium shadow-md transition-all hover:scale-105 active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Sticky Note</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {pins.map((pin) => (
          <div key={pin.id} className="break-inside-avoid">
            <PinCard
              pin={pin}
              onExplainAI={onExplainAI}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onOpenDrawing={onOpenDrawing}
              onOpenSlideViewer={onOpenSlideViewer}
              onToggleCheckItem={onToggleCheckItem}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
