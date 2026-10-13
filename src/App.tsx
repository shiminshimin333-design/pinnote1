import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  BackgroundTheme,
  Board,
  FontOption,
  PinItem,
  PinStyle,
  WashiTapeStyle,
} from './types/note';
import { INITIAL_BOARDS, INITIAL_PINS } from './utils/initialData';
import { BoardHeader } from './components/BoardHeader';
import { MasonryGrid } from './components/MasonryGrid';
import { FreeformCanvas } from './components/FreeformCanvas';
import { NoteEditorModal } from './components/NoteEditorModal';
import { DrawingCanvasModal } from './components/DrawingCanvasModal';
import { WebUploadModal } from './components/WebUploadModal';
import { AIExplainerModal } from './components/AIExplainerModal';
import { Sparkles, MessageSquareHeart, PenTool, Globe, Plus } from 'lucide-react';

const STORAGE_KEY_PINS = 'pinnotes_aesthetic_pins_v1';
const STORAGE_KEY_BOARDS = 'pinnotes_aesthetic_boards_v1';

export default function App() {
  // Boards state
  const [boards, setBoards] = useState<Board[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOARDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(boards[0]?.id || 'board-study');

  // Pins state
  const [pins, setPins] = useState<PinItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PINS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PINS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PINS, JSON.stringify(pins));
    } catch (e) {
      console.error(e);
    }
  }, [pins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOARDS, JSON.stringify(boards));
    } catch (e) {
      console.error(e);
    }
  }, [boards]);

  // Active theme & view mode
  const currentBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const [activeTheme, setActiveTheme] = useState<BackgroundTheme>(
    currentBoard?.themeBackground || 'linen'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'canvas'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modals state
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PinItem | null>(null);

  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [editingSketchNote, setEditingSketchNote] = useState<PinItem | null>(null);

  const [isWebUploadOpen, setIsWebUploadOpen] = useState(false);

  const [isAIExplainerOpen, setIsAIExplainerOpen] = useState(false);
  const [aiTargetNote, setAiTargetNote] = useState<PinItem | null>(null);

  const [isInspiring, setIsInspiring] = useState(false);

  // Trigger celebration confetti
  const fireConfetti = () => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#E11D48', '#FECDD3', '#FEF08A', '#BBF7D0', '#E9D5FF'],
    });
  };

  // Switch board
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setSelectedTag(null);
    setSearchQuery('');
    const target = boards.find((b) => b.id === boardId);
    if (target?.themeBackground) {
      setActiveTheme(target.themeBackground);
    }
  };

  // Create new board
  const handleCreateBoard = (name: string, icon: string, theme: BackgroundTheme) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name,
      icon,
      description: 'Custom moodboard collection',
      themeBackground: theme,
    };
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    setActiveTheme(theme);
    fireConfetti();
  };

  // Filter pins for current board
  const currentBoardPins = useMemo(() => {
    return pins.filter((pin) => pin.boardId === activeBoardId);
  }, [pins, activeBoardId]);

  // Available tags in current board
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    currentBoardPins.forEach((p) => {
      p.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [currentBoardPins]);

  // Filtered pins by search, tag, favorite
  const filteredPins = useMemo(() => {
    return currentBoardPins.filter((pin) => {
      if (onlyFavorites && !pin.favorite) return false;
      if (selectedTag && !pin.tags.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = pin.title?.toLowerCase().includes(q);
        const matchContent = pin.content?.toLowerCase().includes(q);
        const matchTag = pin.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchTag) return false;
      }
      return true;
    });
  }, [currentBoardPins, onlyFavorites, selectedTag, searchQuery]);

  // Handlers for Pins
  const handleSaveNote = (noteData: Partial<PinItem>) => {
    if (editingNote) {
      // Update existing
      setPins((prev) =>
        prev.map((p) => (p.id === editingNote.id ? { ...p, ...noteData } : p))
      );
    } else {
      // Create new
      const newPin: PinItem = {
        id: `pin-${Date.now()}-${Math.random()}`,
        boardId: activeBoardId,
        type: noteData.type || 'sticky',
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        color: noteData.color || '#FEF08A',
        fontFamily: noteData.fontFamily || 'font-caveat',
        fontSize: noteData.fontSize || 'lg',
        washiTape: noteData.washiTape || 'polka',
        pinType: noteData.pinType || 'red-pin',
        rotation: (Math.random() - 0.5) * 3, // slight natural tilt
        position: {
          x: 60 + Math.floor(Math.random() * 400),
          y: 80 + Math.floor(Math.random() * 300),
        },
        size: { width: 320, height: 320 },
        tags: noteData.tags || ['Note'],
        createdAt: Date.now(),
        checklist: noteData.checklist,
      };
      setPins((prev) => [newPin, ...prev]);
      fireConfetti();
    }
    setEditingNote(null);
  };

  const handleDeletePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setPins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  };

  const handleToggleCheckItem = (pinId: string, itemId: string) => {
    setPins((prev) =>
      prev.map((p) => {
        if (p.id !== pinId || !p.checklist) return p;
        return {
          ...p,
          checklist: p.checklist.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
      })
    );
  };

  const handleUpdatePosition = (
    id: string,
    newPos: { x: number; y: number },
    newZ?: number
  ) => {
    setPins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, position: newPos, zIndex: newZ || p.zIndex } : p
      )
    );
  };

  // Open Drawing Modal
  const handleOpenDrawing = (existingPin?: PinItem) => {
    if (existingPin) {
      setEditingSketchNote(existingPin);
    } else {
      setEditingSketchNote(null);
    }
    setIsDrawingOpen(true);
  };

  // Save freehand drawing from canvas
  const handleSaveDrawing = (drawingDataUrl: string, title?: string) => {
    if (editingSketchNote) {
      setPins((prev) =>
        prev.map((p) =>
          p.id === editingSketchNote.id
            ? { ...p, drawingData: drawingDataUrl, title: title || p.title }
            : p
        )
      );
    } else {
      const newPin: PinItem = {
        id: `pin-sketch-${Date.now()}`,
        boardId: activeBoardId,
        type: 'sketch',
        title: title || 'Handwritten Note 🖊️',
        content: 'Handwritten sketch with pens and calligraphy',
        color: '#FFFDF9',
        drawingData: drawingDataUrl,
        fontFamily: 'font-indie',
        fontSize: 'base',
        washiTape: 'kraft',
        pinType: 'red-pin',
        rotation: (Math.random() - 0.5) * 3,
        position: {
          x: 100 + Math.floor(Math.random() * 300),
          y: 100 + Math.floor(Math.random() * 200),
        },
        size: { width: 340, height: 380 },
        tags: ['Handdrawn', 'Doodle'],
        createdAt: Date.now(),
      };
      setPins((prev) => [newPin, ...prev]);
      fireConfetti();
    }
    setEditingSketchNote(null);
  };

  // Save Web upload pin
  const handleSaveWebPin = (pinData: {
    title: string;
    content: string;
    imageUrl?: string;
    webMeta?: any;
    fontFamily: FontOption;
    washiTape: WashiTapeStyle;
    pinType: PinStyle;
    tags: string[];
    type: 'photo' | 'weblink';
  }) => {
    const newPin: PinItem = {
      id: `pin-web-${Date.now()}`,
      boardId: activeBoardId,
      type: pinData.type,
      title: pinData.title,
      content: pinData.content,
      imageUrl: pinData.imageUrl,
      webMeta: pinData.webMeta,
      color: '#FFFFFF',
      fontFamily: pinData.fontFamily,
      fontSize: 'base',
      washiTape: pinData.washiTape,
      pinType: pinData.pinType,
      rotation: (Math.random() - 0.5) * 2.5,
      position: {
        x: 120 + Math.floor(Math.random() * 300),
        y: 120 + Math.floor(Math.random() * 200),
      },
      size: { width: 320, height: 420 },
      tags: pinData.tags,
      createdAt: Date.now(),
    };
    setPins((prev) => [newPin, ...prev]);
    fireConfetti();
  };

  // Open AI Explainer on a specific note
  const handleExplainAI = (pin: PinItem) => {
    setAiTargetNote(pin);
    setIsAIExplainerOpen(true);
  };

  // Pin an AI explanation directly as a new pastel note on board
  const handlePinExplanationAsNote = (text: string, title: string, color = '#FEF08A') => {
    const newPin: PinItem = {
      id: `pin-ai-${Date.now()}`,
      boardId: activeBoardId,
      type: 'sticky',
      title,
      content: text,
      color,
      fontFamily: 'font-caveat',
      fontSize: 'base',
      washiTape: 'pink',
      pinType: 'red-pin',
      rotation: (Math.random() - 0.5) * 2.5,
      position: {
        x: 150 + Math.floor(Math.random() * 300),
        y: 150 + Math.floor(Math.random() * 200),
      },
      size: { width: 340, height: 360 },
      tags: ['AIExplained', 'StudyNotes'],
      createdAt: Date.now(),
      aiExplanation: text,
    };
    setPins((prev) => [newPin, ...prev]);
    fireConfetti();
  };

  // AI Inspire Board
  const handleInspireWithAI = async () => {
    setIsInspiring(true);
    try {
      const res = await fetch('/api/ai/inspire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: currentBoard.name }),
      });
      const data = await res.json();
      if (Array.isArray(data.ideas) && data.ideas.length > 0) {
        const newPins: PinItem[] = data.ideas.map((item: any, idx: number) => ({
          id: `pin-inspire-${Date.now()}-${idx}`,
          boardId: activeBoardId,
          type: 'sticky',
          title: item.title || 'Inspiration',
          content: item.content || '',
          color: item.color || '#FEF08A',
          fontFamily: 'font-indie',
          fontSize: 'base',
          washiTape: 'polka',
          pinType: 'gold-tack',
          rotation: (Math.random() - 0.5) * 3,
          position: {
            x: 80 + idx * 80,
            y: 100 + idx * 60,
          },
          size: { width: 310, height: 300 },
          tags: item.tags || ['Inspiration'],
          createdAt: Date.now(),
        }));
        setPins((prev) => [...newPins, ...prev]);
        fireConfetti();
      }
    } catch (e) {
      console.error('Inspire failed', e);
    } finally {
      setIsInspiring(false);
    }
  };

  // Background style helper
  const getBackgroundClass = () => {
    switch (activeTheme) {
      case 'dot-grid':
        return 'bg-[#FAF7F2] bg-dot-grid';
      case 'ruled':
        return 'bg-[#FFFDF9] bg-notebook-ruled';
      case 'cork':
        return 'bg-corkboard';
      case 'blush':
        return 'bg-[#FFF0F2]';
      case 'espresso':
        return 'bg-[#29221F] text-[#F3EBE6]';
      case 'linen':
      default:
        return 'bg-[#FAF7F2]';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${getBackgroundClass()}`}>
      {/* Top Header & Board Controls */}
      <BoardHeader
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={handleSelectBoard}
        onCreateBoard={handleCreateBoard}
        activeTheme={activeTheme}
        onChangeTheme={setActiveTheme}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        availableTags={availableTags}
        onlyFavorites={onlyFavorites}
        onToggleOnlyFavorites={() => setOnlyFavorites(!onlyFavorites)}
        onOpenNewNote={() => {
          setEditingNote(null);
          setIsNoteEditorOpen(true);
        }}
        onOpenDrawing={() => handleOpenDrawing()}
        onOpenWebUpload={() => setIsWebUploadOpen(true)}
        onOpenAIExplainer={() => {
          setAiTargetNote(null);
          setIsAIExplainerOpen(true);
        }}
        onInspireWithAI={handleInspireWithAI}
        isInspiring={isInspiring}
      />

      {/* Main Board View: Masonry Grid or Freeform Canvas */}
      <main className="flex-1 pb-24">
        {viewMode === 'grid' ? (
          <MasonryGrid
            pins={filteredPins}
            onExplainAI={handleExplainAI}
            onEdit={(pin) => {
              setEditingNote(pin);
              setIsNoteEditorOpen(true);
            }}
            onDelete={handleDeletePin}
            onToggleFavorite={handleToggleFavorite}
            onOpenDrawing={handleOpenDrawing}
            onToggleCheckItem={handleToggleCheckItem}
            onCreateNewNote={() => {
              setEditingNote(null);
              setIsNoteEditorOpen(true);
            }}
          />
        ) : (
          <FreeformCanvas
            pins={filteredPins}
            onUpdatePosition={handleUpdatePosition}
            onExplainAI={handleExplainAI}
            onEdit={(pin) => {
              setEditingNote(pin);
              setIsNoteEditorOpen(true);
            }}
            onDelete={handleDeletePin}
            onToggleFavorite={handleToggleFavorite}
            onOpenDrawing={handleOpenDrawing}
            onToggleCheckItem={handleToggleCheckItem}
            onCreateNewNote={() => {
              setEditingNote(null);
              setIsNoteEditorOpen(true);
            }}
          />
        )}
      </main>

      {/* Floating Bottom Quick Action Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#FFFDF9]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#ECE3D8] shadow-xl flex items-center gap-2">
        <button
          onClick={() => {
            setEditingNote(null);
            setIsNoteEditorOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E11D48] text-white text-xs font-bold shadow-xs hover:bg-[#BE123C] transition-all hover:scale-105"
          title="New Pastel Sticky Note"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Sticky Note</span>
        </button>

        <button
          onClick={() => handleOpenDrawing()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F2ECE4] text-[#3C2F2B] text-xs font-semibold transition-all hover:scale-105"
          title="Freehand Pens & Doodles"
        >
          <PenTool className="w-3.5 h-3.5 text-[#8C5E47]" />
          <span>Draw & Pen</span>
        </button>

        <button
          onClick={() => setIsWebUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F2ECE4] text-[#3C2F2B] text-xs font-semibold transition-all hover:scale-105"
          title="Upload from Web or Device"
        >
          <Globe className="w-3.5 h-3.5 text-[#8C5E47]" />
          <span>Web Clip</span>
        </button>

        <div className="w-px h-4 bg-stone-300 mx-1" />

        <button
          onClick={() => {
            setAiTargetNote(null);
            setIsAIExplainerOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FFF1F2] to-[#FFE4E6] border border-[#FECDD3] text-[#E11D48] text-xs font-bold shadow-2xs hover:shadow-xs transition-all hover:scale-105"
          title="Ask AI to explain anything you don't understand"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E11D48] animate-pulse" />
          <span>Explain with AI</span>
        </button>
      </div>

      {/* Modals */}
      <NoteEditorModal
        isOpen={isNoteEditorOpen}
        onClose={() => {
          setIsNoteEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
      />

      <DrawingCanvasModal
        isOpen={isDrawingOpen}
        onClose={() => {
          setIsDrawingOpen(false);
          setEditingSketchNote(null);
        }}
        onSave={handleSaveDrawing}
        initialDrawing={editingSketchNote?.drawingData}
        initialTitle={editingSketchNote?.title}
      />

      <WebUploadModal
        isOpen={isWebUploadOpen}
        onClose={() => setIsWebUploadOpen(false)}
        onSavePin={handleSaveWebPin}
      />

      <AIExplainerModal
        isOpen={isAIExplainerOpen}
        onClose={() => {
          setIsAIExplainerOpen(false);
          setAiTargetNote(null);
        }}
        targetNote={aiTargetNote}
        onPinExplanationAsNote={handlePinExplanationAsNote}
      />
    </div>
  );
}
