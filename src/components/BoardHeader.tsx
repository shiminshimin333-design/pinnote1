import React, { useState } from 'react';
import {
  Pin,
  PenTool,
  Globe,
  Sparkles,
  LayoutGrid,
  Move,
  Search,
  Plus,
  FolderHeart,
  Palette,
  Heart,
  Lightbulb,
} from 'lucide-react';
import { BackgroundTheme, Board } from '../types/note';

interface BoardHeaderProps {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string, icon: string, theme: BackgroundTheme) => void;
  activeTheme: BackgroundTheme;
  onChangeTheme: (theme: BackgroundTheme) => void;
  viewMode: 'grid' | 'canvas';
  onChangeViewMode: (mode: 'grid' | 'canvas') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  availableTags: string[];
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  onOpenNewNote: () => void;
  onOpenDrawing: () => void;
  onOpenWebUpload: () => void;
  onOpenAIExplainer: () => void;
  onInspireWithAI: () => void;
  isInspiring: boolean;
}

const THEME_OPTIONS: Array<{ id: BackgroundTheme; label: string; icon: string }> = [
  { id: 'linen', label: 'Warm Linen', icon: '📄' },
  { id: 'dot-grid', label: 'Dot Grid', icon: '📐' },
  { id: 'ruled', label: 'Ruled Paper', icon: '📖' },
  { id: 'cork', label: 'Corkboard', icon: '📌' },
  { id: 'blush', label: 'Soft Blush', icon: '🌸' },
  { id: 'espresso', label: 'Espresso Dark', icon: '☕' },
];

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  activeTheme,
  onChangeTheme,
  viewMode,
  onChangeViewMode,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  availableTags,
  onlyFavorites,
  onToggleOnlyFavorites,
  onOpenNewNote,
  onOpenDrawing,
  onOpenWebUpload,
  onOpenAIExplainer,
  onInspireWithAI,
  isInspiring,
}) => {
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardIcon, setNewBoardIcon] = useState('✨');
  const [newBoardTheme, setNewBoardTheme] = useState<BackgroundTheme>('linen');

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  const handleCreateBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    onCreateBoard(newBoardName.trim(), newBoardIcon, newBoardTheme);
    setNewBoardName('');
    setShowNewBoardModal(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#ECE3D8] shadow-2xs">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Board Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E11D48] to-[#F43F5E] flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Pin className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-black font-playfair tracking-tight text-[#2D2727] flex items-center gap-1.5">
                <span>PinNotes</span>
                <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48]">
                  aesthetic
                </span>
              </h1>
            </div>
          </div>

          {/* Board Selector Pills */}
          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#ECE3D8]">
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelectBoard(b.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  b.id === activeBoardId
                    ? 'bg-[#3C2F2B] text-white shadow-xs'
                    : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
                }`}
              >
                <span>{b.icon}</span>
                <span>{b.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowNewBoardModal(true)}
              className="p-1.5 rounded-full text-[#8C7A70] hover:text-[#2D2727] hover:bg-[#F2ECE4] transition-colors"
              title="Create new board"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notes, formulas, tags..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            />
          </div>
        </div>

        {/* View Mode & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Favorite filter toggle */}
          <button
            onClick={onToggleOnlyFavorites}
            className={`p-2 rounded-full border transition-all ${
              onlyFavorites
                ? 'bg-[#FFE4E6] border-[#FDA4AF] text-[#E11D48]'
                : 'bg-[#FAF7F2] border-[#E7DFD5] text-[#8C7A70] hover:text-[#E11D48]'
            }`}
            title={onlyFavorites ? 'Show All Notes' : 'Show Favorites Only'}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-[#E11D48]' : ''}`} />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-full border border-[#E7DFD5]">
            <button
              onClick={() => onChangeViewMode('grid')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-[#2D2727]'
                  : 'text-[#8C7A70] hover:text-[#2D2727]'
              }`}
              title="Masonry Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeViewMode('canvas')}
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'canvas'
                  ? 'bg-white shadow-xs text-[#2D2727]'
                  : 'text-[#8C7A70] hover:text-[#2D2727]'
              }`}
              title="Freeform Moodboard Canvas"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>

          {/* AI Explainer Companion Button */}
          <button
            onClick={onOpenAIExplainer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-[#FFF1F2] to-[#FFE4E6] border border-[#FECDD3] text-[#E11D48] text-xs font-semibold shadow-xs hover:shadow-md transition-all hover:scale-105 active:scale-95"
            title="Open AI Concept Explainer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E11D48] animate-pulse" />
            <span className="hidden lg:inline">AI Explainer</span>
          </button>

          {/* Web Upload Button */}
          <button
            onClick={onOpenWebUpload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#E7DFD5] text-[#3C2F2B] text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Upload from Web or Device"
          >
            <Globe className="w-3.5 h-3.5 text-[#8C5E47]" />
            <span className="hidden sm:inline">Web Upload</span>
          </button>

          {/* Handwrite & Draw Button */}
          <button
            onClick={onOpenDrawing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#E7DFD5] text-[#3C2F2B] text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Handwrite & Draw with Pens"
          >
            <PenTool className="w-3.5 h-3.5 text-[#8C5E47]" />
            <span className="hidden sm:inline">Handwrite</span>
          </button>

          {/* + New Sticky Note */}
          <button
            onClick={onOpenNewNote}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md shadow-rose-200 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Note</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Board details, Theme picker, AI Inspire, and Tag Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Board Switcher for Mobile & Description */}
        <div className="flex items-center gap-2">
          <span className="text-sm">{activeBoard.icon}</span>
          <span className="font-bold text-[#3C2F2B] font-playfair">{activeBoard.name}</span>
          <span className="text-[#8C7A70] hidden lg:inline font-sans">
            — {activeBoard.description}
          </span>
        </div>

        {/* Controls: Theme & AI Inspire */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Background Theme Selector */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E7DFD5]">
            <span className="text-[10px] text-[#8C7A70] px-1 font-mono uppercase">Paper:</span>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => onChangeTheme(t.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                  activeTheme === t.id
                    ? 'bg-white text-[#2D2727] shadow-2xs font-semibold'
                    : 'text-[#8C7A70] hover:text-[#2D2727]'
                }`}
                title={t.label}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* AI Inspire Board button */}
          <button
            onClick={onInspireWithAI}
            disabled={isInspiring}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] hover:border-[#E11D48] text-[#8C5E47] hover:text-[#E11D48] transition-all text-[11px] font-semibold disabled:opacity-40"
            title="Generate AI inspiration sticky notes for this board"
          >
            <Lightbulb className="w-3 h-3 text-[#E11D48]" />
            <span>{isInspiring ? 'Inspiring...' : 'Inspire Board ✨'}</span>
          </button>
        </div>

        {/* Tag Filters */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          <span className="text-[10px] font-mono text-[#8C7A70] uppercase shrink-0">Tags:</span>
          <button
            onClick={() => onSelectTag(null)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all shrink-0 ${
              selectedTag === null
                ? 'bg-[#3C2F2B] text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#6F5F57] hover:bg-[#F2ECE4]'
            }`}
          >
            All Notes
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-[#E11D48] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Create New Board Modal */}
      {showNewBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#E7DFD5]">
            <h3 className="text-lg font-bold font-playfair text-[#2D2727] mb-3">
              Create New Pinterest Board
            </h3>
            <form onSubmit={handleCreateBoardSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                  Board Name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g. Cognitive Psychology 🧠"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-sm focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                  Board Emoji Icon
                </label>
                <div className="flex gap-2">
                  {['☕', '🎨', '🌿', '🧠', '🥐', '✨', '📚', '💡', '🎵'].map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setNewBoardIcon(icon)}
                      className={`text-lg p-2 rounded-xl transition-all ${
                        newBoardIcon === icon ? 'bg-[#3C2F2B] text-white' : 'bg-white hover:bg-stone-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                  Background Paper
                </label>
                <select
                  value={newBoardTheme}
                  onChange={(e) => setNewBoardTheme(e.target.value as BackgroundTheme)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs"
                >
                  <option value="linen">Warm Linen</option>
                  <option value="dot-grid">Dot Grid</option>
                  <option value="ruled">Ruled Paper</option>
                  <option value="cork">Corkboard</option>
                  <option value="blush">Soft Blush</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewBoardModal(false)}
                  className="px-4 py-2 rounded-full border border-[#E7DFD5] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#E11D48] text-white text-xs font-bold shadow-md"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
