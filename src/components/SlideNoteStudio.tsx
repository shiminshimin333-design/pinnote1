import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Feather,
  Highlighter,
  Pencil,
  Eraser,
  Type,
  StickyNote,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Undo2,
  Redo2,
  Upload,
  Globe,
  Share2,
  Eye,
  Sliders,
  CheckSquare,
  Square,
  Loader2,
  Send,
  HelpCircle,
  Lightbulb,
  Brain,
  ListChecks,
} from 'lucide-react';
import {
  FontOption,
  NoteSlide,
  PinItem,
  PinStyle,
  SlideSticky,
  SlideSticker,
  UserProfile,
  WashiTapeStyle,
} from '../types/note';
import { PushPin, WashiTape } from './PinOrTack';

interface SlideNoteStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Partial<PinItem>) => void;
  initialNote?: PinItem | null;
  currentUser: UserProfile;
  onEditProfile: () => void;
}

const FONTS: Array<{ id: FontOption; label: string; sampleClass: string }> = [
  { id: 'font-caveat', label: 'Caveat (Handwriting)', sampleClass: 'font-caveat' },
  { id: 'font-indie', label: 'Indie Flower (Cute Hand)', sampleClass: 'font-indie' },
  { id: 'font-patrick', label: 'Patrick Hand (Neat Pen)', sampleClass: 'font-patrick' },
  { id: 'font-playfair', label: 'Playfair (Editorial Serif)', sampleClass: 'font-playfair' },
  { id: 'font-courier', label: 'Courier (Typewriter)', sampleClass: 'font-courier' },
  { id: 'font-jakarta', label: 'Jakarta (Clean Sans)', sampleClass: 'font-jakarta' },
];

const PASTEL_PAPERS = [
  { name: 'Warm Linen', hex: '#FFFDF9', style: 'linen' as const },
  { name: 'Butter Yellow', hex: '#FEF08A', style: 'cream' as const },
  { name: 'Rosewater', hex: '#FECDD3', style: 'blush' as const },
  { name: 'Sage Mint', hex: '#BBF7D0', style: 'linen' as const },
  { name: 'Sky Mist', hex: '#BFDBFE', style: 'grid' as const },
  { name: 'Lavender', hex: '#E9D5FF', style: 'ruled' as const },
  { name: 'Kraft Vintage', hex: '#E8D8C8', style: 'kraft' as const },
];

const STICKY_COLORS = ['#FEF08A', '#FECDD3', '#BBF7D0', '#BFDBFE', '#E9D5FF', '#FED7AA', '#FFFDF9'];

const INK_COLORS = [
  { name: 'Charcoal', hex: '#27272A' },
  { name: 'Espresso', hex: '#78350F' },
  { name: 'Terracotta', hex: '#C2410C' },
  { name: 'Sage', hex: '#15803D' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Aegean', hex: '#0284C7' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Gold', hex: '#D97706' },
  { name: 'White', hex: '#FFFFFF' },
];

const CUTE_STICKERS = ['🌸', '☕', '⭐', '💖', '🌿', '🥐', '🎀', '✨', '📌', '📖', '🍵', '🕯️'];

const createDefaultSlide = (): NoteSlide => ({
  id: `slide-${Date.now()}-1`,
  title: 'My Aesthetic Note 🌸',
  content: 'Type your notes, study insights, or recipes here with aesthetic handwriting fonts...',
  fontFamily: 'font-caveat',
  fontSize: 'lg',
  color: '#FFFDF9',
  paperStyle: 'ruled',
  washiTape: 'polka',
  pinType: 'red-pin',
  checklist: [],
  stickies: [
    {
      id: `sticky-${Date.now()}`,
      text: 'Quick formula / thought ✨',
      color: '#FEF08A',
      fontFamily: 'font-indie',
      position: { x: 380, y: 30 },
      rotation: 2.5,
      washiTape: 'pink',
    },
  ],
  stickers: [{ id: `stk-1`, emoji: '🌸', position: { x: 340, y: 15 }, size: 24 }],
});

export const SlideNoteStudio: React.FC<SlideNoteStudioProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  currentUser,
  onEditProfile,
}) => {
  // Slides state with safe non-empty initial array
  const [slides, setSlides] = useState<NoteSlide[]>(() => [createDefaultSlide()]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Deck level metadata
  const [deckTitle, setDeckTitle] = useState('My Aesthetic Note');
  const [tagsInput, setTagsInput] = useState('Study, Aesthetic');
  const [isPublic, setIsPublic] = useState(true);

  // Studio active tool
  const [activeTab, setActiveTab] = useState<'text' | 'draw' | 'sticky' | 'upload' | 'ai'>('text');

  // Drawing canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawTool, setDrawTool] = useState<'pen' | 'fountain' | 'highlighter' | 'pencil' | 'eraser'>('fountain');
  const [strokeColor, setStrokeColor] = useState('#27272A');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // AI Assistant side drawer state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Upload modal / image input
  const [uploadUrlInput, setUploadUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  // Initialize or reset slides when opened
  useEffect(() => {
    if (!isOpen) return;

    if (initialNote && initialNote.slides && initialNote.slides.length > 0) {
      setSlides(JSON.parse(JSON.stringify(initialNote.slides)));
      setDeckTitle(initialNote.title || 'My Aesthetic Note');
      setTagsInput(initialNote.tags ? initialNote.tags.join(', ') : 'Study');
      setIsPublic(initialNote.isPublic ?? true);
      setCurrentSlideIndex(0);
    } else if (initialNote) {
      // Convert single note into slide 1
      const s1: NoteSlide = {
        id: `slide-${Date.now()}-1`,
        title: initialNote.title || 'My Note',
        content: initialNote.content || '',
        fontFamily: initialNote.fontFamily || 'font-caveat',
        fontSize: initialNote.fontSize || 'lg',
        color: initialNote.color || '#FFFDF9',
        paperStyle: 'ruled',
        washiTape: initialNote.washiTape || 'polka',
        pinType: initialNote.pinType || 'red-pin',
        drawingData: initialNote.drawingData,
        imageUrl: initialNote.imageUrl,
        checklist: initialNote.checklist || [],
        stickies: [],
        stickers: [],
      };
      setSlides([s1]);
      setDeckTitle(initialNote.title || 'My Aesthetic Note');
      setTagsInput(initialNote.tags ? initialNote.tags.join(', ') : 'Study');
      setIsPublic(initialNote.isPublic ?? true);
      setCurrentSlideIndex(0);
    } else {
      // Brand new note starting with default slide
      const initialSlide = createDefaultSlide();
      setSlides([initialSlide]);
      setDeckTitle('My Aesthetic Note 🌸');
      setTagsInput('Aesthetic, Notes');
      setIsPublic(true);
      setCurrentSlideIndex(0);
    }
  }, [isOpen, initialNote]);

  // Always compute safe current slide with fallbacks
  const safeSlide = createDefaultSlide();
  const currentSlide = slides[currentSlideIndex] || slides[0] || safeSlide;

  // Helper to update current slide
  const updateCurrentSlide = (updates: Partial<NoteSlide>) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === currentSlideIndex ? { ...s, ...updates } : s))
    );
  };

  // Add new slide
  const handleAddNewSlide = () => {
    const newSlide: NoteSlide = {
      id: `slide-${Date.now()}-${slides.length + 1}`,
      title: `Slide ${slides.length + 1}`,
      content: '',
      fontFamily: currentSlide?.fontFamily || 'font-caveat',
      fontSize: currentSlide?.fontSize || 'lg',
      color: PASTEL_PAPERS[(slides.length + 1) % PASTEL_PAPERS.length].hex,
      paperStyle: 'ruled',
      washiTape: 'stripes',
      pinType: 'gold-tack',
      stickies: [],
      stickers: [],
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  };

  // Delete current slide
  const handleDeleteSlide = (indexToDelete: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, idx) => idx !== indexToDelete);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, indexToDelete - 1));
  };

  // Canvas Drawing Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (currentSlide?.drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = currentSlide.drawingData;
    }
  }, [currentSlideIndex, activeTab]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTab !== 'draw') return;
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    lastPointRef.current = pos;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const onDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPointRef.current || activeTab !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasPos(e);
    const lastPos = lastPointRef.current;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 4;
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      if (drawTool === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * 4;
      } else if (drawTool === 'fountain') {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * 1.3;
      } else {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
      }
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    lastPointRef.current = currentPos;
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      updateCurrentSlide({ drawingData: dataUrl });
    }
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCurrentSlide({ drawingData: undefined });
  };

  // Sticky notes on slide
  const handleAddSlideSticky = (color = '#FEF08A') => {
    const newSticky: SlideSticky = {
      id: `sticky-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: 'New thought / formula ✨',
      color,
      fontFamily: 'font-indie',
      position: { x: 300 + Math.floor(Math.random() * 100), y: 60 + Math.floor(Math.random() * 150) },
      rotation: (Math.random() - 0.5) * 6,
      washiTape: 'pink',
    };
    updateCurrentSlide({
      stickies: [...(currentSlide.stickies || []), newSticky],
    });
  };

  const handleUpdateStickyText = (stickyId: string, newText: string) => {
    updateCurrentSlide({
      stickies: (currentSlide.stickies || []).map((s) =>
        s.id === stickyId ? { ...s, text: newText } : s
      ),
    });
  };

  const handleRemoveSticky = (stickyId: string) => {
    updateCurrentSlide({
      stickies: (currentSlide.stickies || []).filter((s) => s.id !== stickyId),
    });
  };

  // Stickers on slide
  const handleAddSticker = (emoji: string) => {
    const newStk: SlideSticker = {
      id: `stk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      emoji,
      position: { x: 50 + Math.floor(Math.random() * 350), y: 30 + Math.floor(Math.random() * 250) },
      size: 26,
    };
    updateCurrentSlide({
      stickers: [...(currentSlide.stickers || []), newStk],
    });
  };

  // AI Assistant within Slide
  const handleAskAI = async (mode: 'eli5' | 'deep-dive' | 'bullet-summary' | 'quiz' | 'custom') => {
    const slideContent = `${currentSlide?.title || ''}\n${currentSlide?.content || ''}`;
    if (!slideContent.trim() && !aiPrompt.trim()) return;

    setAiLoading(true);
    setAiOutput('');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: slideContent,
          title: currentSlide?.title || deckTitle,
          mode,
          customQuestion: mode === 'custom' ? aiPrompt : undefined,
        }),
      });
      const data = await res.json();
      setAiOutput(data.explanation || 'No explanation returned.');
    } catch (err: any) {
      setAiOutput(`Error: ${err?.message || 'Could not reach AI'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Insert AI explanation as a sticky note directly on this slide
  const handlePinAIToSlideSticky = () => {
    if (!aiOutput) return;
    const truncated = aiOutput.length > 280 ? aiOutput.slice(0, 280) + '...' : aiOutput;
    const newSticky: SlideSticky = {
      id: `sticky-ai-${Date.now()}`,
      text: `💡 AI Insight:\n${truncated}`,
      color: '#FEF08A',
      fontFamily: 'font-caveat',
      position: { x: 340, y: 120 },
      rotation: -2,
      washiTape: 'polka',
    };
    updateCurrentSlide({
      stickies: [...(currentSlide.stickies || []), newSticky],
      aiNotes: aiOutput,
    });
  };

  // Upload local file or image URL
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateCurrentSlide({ imageUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleFetchWebImageUrl = async () => {
    if (!uploadUrlInput.trim()) return;
    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/web/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadUrlInput.trim() }),
      });
      const data = await res.json();
      if (data.image) {
        updateCurrentSlide({ imageUrl: data.image });
        setUploadUrlInput('');
      } else if (data.url) {
        updateCurrentSlide({ imageUrl: data.url });
        setUploadUrlInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Final Publish / Save
  const handleFinalSave = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const s1 = slides[0] || currentSlide;

    onSave({
      id: initialNote?.id,
      title: deckTitle.trim() || s1.title || 'Aesthetic Slide Note 🌸',
      content: s1.content || '',
      color: s1.color || '#FFFDF9',
      fontFamily: s1.fontFamily || 'font-caveat',
      fontSize: s1.fontSize || 'lg',
      washiTape: s1.washiTape || 'polka',
      pinType: s1.pinType || 'red-pin',
      drawingData: s1.drawingData,
      imageUrl: s1.imageUrl,
      type: 'slide-deck',
      slides,
      tags: tags.length > 0 ? tags : ['SlideDeck'],
      isPublic,
      author: currentUser,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-6xl shadow-2xl border border-[#E7DFD5] overflow-hidden flex flex-col h-[94vh]">
        {/* Top Header: Creator Personalization, Slide Deck Title, Publish */}
        <header className="px-6 py-3.5 bg-[#FFFDF9] border-b border-[#ECE3D8] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Creator Profile Badge (Personalized for Public) */}
            <button
              onClick={onEditProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#E7DFD5] text-xs transition-transform hover:scale-102"
              title="Personalize your public creator profile"
            >
              <span className="text-base">{currentUser?.avatar || '🌸'}</span>
              <span className="font-bold text-[#3C2F2B]">{currentUser?.name || 'shimin'}</span>
              <span className="text-[10px] text-[#8C7A70] font-mono">{currentUser?.handle || '@curator'}</span>
            </button>

            {/* Deck Title input */}
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="Name this aesthetic note / slide spread..."
              className="text-base sm:text-lg font-bold font-playfair bg-transparent border-none focus:outline-none text-[#2D2727] w-48 sm:w-80"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Public / Private toggle */}
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isPublic
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                  : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#4B5563]'
              }`}
              title="Toggle public visibility on moodboard"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPublic ? 'Public Deck' : 'Private'}</span>
            </button>

            {/* Save & Publish */}
            <button
              onClick={handleFinalSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md shadow-rose-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Pin & Publish Note</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F2ECE4] text-[#78665E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Sub-Header: Studio Tool Tabs (Type, Draw with hand, Sticky notes, Upload, AI) */}
        <div className="px-6 py-2.5 bg-[#F5EFE6] border-b border-[#ECE3D8] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Main Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#FFFDF9] p-1 rounded-2xl border border-[#E7DFD5] shadow-2xs">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'text' ? 'bg-[#3C2F2B] text-white shadow-2xs' : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Keypad & Text</span>
            </button>

            <button
              onClick={() => setActiveTab('draw')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'draw' ? 'bg-[#3C2F2B] text-white shadow-2xs' : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Draw & Handwrite</span>
            </button>

            <button
              onClick={() => setActiveTab('sticky')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'sticky' ? 'bg-[#3C2F2B] text-white shadow-2xs' : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Sticky Notes</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'upload' ? 'bg-[#3C2F2B] text-white shadow-2xs' : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Web</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'ai' ? 'bg-[#E11D48] text-white shadow-2xs' : 'text-[#E11D48] hover:bg-[#FFE4E6]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Explainer</span>
            </button>
          </div>

          {/* Slide Navigation Pagination */}
          <div className="flex items-center gap-2 bg-[#FFFDF9] px-3 py-1 rounded-2xl border border-[#E7DFD5] shadow-2xs">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs font-bold text-[#3C2F2B] px-1">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>

            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleAddNewSlide}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#E7DFD5] text-[#3C2F2B] font-semibold text-[11px] ml-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Slide</span>
            </button>

            {slides.length > 1 && (
              <button
                onClick={() => handleDeleteSlide(currentSlideIndex)}
                className="p-1 rounded-lg text-red-500 hover:bg-red-50 ml-1"
                title="Delete this slide"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Work Area: Side Tool Drawer + Aesthetic Slide Canvas Sheet */}
        <div className="flex-1 flex overflow-hidden">
          {/* Active Tool Options Sidebar */}
          <div className="w-72 bg-[#FFFDF9] border-r border-[#ECE3D8] p-4 overflow-y-auto space-y-4 shrink-0 text-xs">
            {/* TEXT & FONT CONTROLS */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h4 className="font-bold text-[#3C2F2B] uppercase tracking-wider font-mono text-[11px]">
                  Typography & Paper
                </h4>

                {/* Font Selector */}
                <div>
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block mb-1.5">
                    Handwriting Font
                  </label>
                  <div className="space-y-1">
                    {FONTS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateCurrentSlide({ fontFamily: f.id })}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                          (currentSlide?.fontFamily || 'font-caveat') === f.id
                            ? 'bg-[#3C2F2B] text-white'
                            : 'hover:bg-[#FAF7F2] text-[#3C2F2B]'
                        }`}
                      >
                        <span className={`block text-sm ${f.sampleClass}`}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paper Color */}
                <div>
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block mb-1.5">
                    Slide Paper Color
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PASTEL_PAPERS.map((p) => (
                      <button
                        key={p.hex}
                        onClick={() => updateCurrentSlide({ color: p.hex, paperStyle: p.style })}
                        className={`h-8 rounded-xl border border-black/10 transition-transform ${
                          (currentSlide?.color || '#FFFDF9') === p.hex ? 'ring-2 ring-stone-700 scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Washi Tape */}
                <div>
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block mb-1">
                    Washi Tape
                  </label>
                  <select
                    value={currentSlide?.washiTape || 'polka'}
                    onChange={(e) => updateCurrentSlide({ washiTape: e.target.value as WashiTapeStyle })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-[#2D2727]"
                  >
                    <option value="polka">Peach Polka Dot</option>
                    <option value="stripes">Lavender Stripes</option>
                    <option value="pink">Pink Dots</option>
                    <option value="floral">Sage Floral</option>
                    <option value="grid">Blue Grid</option>
                    <option value="kraft">Kraft Paper</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* PushPin */}
                <div>
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block mb-1">
                    Pushpin Style
                  </label>
                  <select
                    value={currentSlide?.pinType || 'red-pin'}
                    onChange={(e) => updateCurrentSlide({ pinType: e.target.value as PinStyle })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-[#2D2727]"
                  >
                    <option value="red-pin">Classic Red Pin 📌</option>
                    <option value="gold-tack">Gold Brass Tack</option>
                    <option value="flower-clip">Flower Clip 🌸</option>
                    <option value="star-clip">Star Clip ⭐</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            )}

            {/* DRAWING TOOL CONTROLS */}
            {activeTab === 'draw' && (
              <div className="space-y-4">
                <h4 className="font-bold text-[#3C2F2B] uppercase tracking-wider font-mono text-[11px]">
                  Handwriting Pen Tools
                </h4>

                {/* Pen type */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setDrawTool('fountain')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl font-medium ${
                      drawTool === 'fountain' ? 'bg-[#3C2F2B] text-white' : 'bg-[#FAF7F2] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span>Fountain</span>
                  </button>
                  <button
                    onClick={() => setDrawTool('pen')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl font-medium ${
                      drawTool === 'pen' ? 'bg-[#3C2F2B] text-white' : 'bg-[#FAF7F2] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Ballpoint</span>
                  </button>
                  <button
                    onClick={() => setDrawTool('highlighter')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl font-medium ${
                      drawTool === 'highlighter' ? 'bg-[#3C2F2B] text-white' : 'bg-[#FAF7F2] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span>Highlighter</span>
                  </button>
                  <button
                    onClick={() => setDrawTool('eraser')}
                    className={`flex items-center gap-1.5 p-2 rounded-xl font-medium ${
                      drawTool === 'eraser' ? 'bg-[#E11D48] text-white' : 'bg-[#FAF7F2] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Eraser</span>
                  </button>
                </div>

                {/* Stroke width */}
                <div>
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block mb-1">
                    Stroke Size: {strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-[#E11D48]"
                  />
                </div>

                {/* Ink Colors */}
                <div>
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block mb-1.5">
                    Ink Colors
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {INK_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setStrokeColor(c.hex);
                          if (drawTool === 'eraser') setDrawTool('fountain');
                        }}
                        className={`w-7 h-7 rounded-full border border-black/15 transition-transform ${
                          strokeColor === c.hex ? 'scale-125 ring-2 ring-stone-800' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Clear drawing */}
                <button
                  onClick={clearDrawing}
                  className="w-full py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                >
                  Clear Slide Strokes
                </button>
              </div>
            )}

            {/* STICKY NOTES & STICKERS */}
            {activeTab === 'sticky' && (
              <div className="space-y-4">
                <h4 className="font-bold text-[#3C2F2B] uppercase tracking-wider font-mono text-[11px]">
                  Add Sticky Notes
                </h4>
                <p className="text-[#8C7A70]">Pin pastel sticky reminders directly onto this slide sheet.</p>

                <div className="grid grid-cols-4 gap-2">
                  {STICKY_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleAddSlideSticky(c)}
                      className="h-10 rounded-xl border border-black/10 hover:scale-105 shadow-2xs transition-all flex items-center justify-center font-bold text-stone-600"
                      style={{ backgroundColor: c }}
                      title="Add sticky of this color"
                    >
                      +
                    </button>
                  ))}
                </div>

                {/* Cute Aesthetic Stickers stamp */}
                <div className="pt-3 border-t border-[#ECE3D8]">
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block mb-1.5">
                    Stamp Aesthetic Stickers
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CUTE_STICKERS.map((stk) => (
                      <button
                        key={stk}
                        onClick={() => handleAddSticker(stk)}
                        className="text-xl p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#E7DFD5] hover:scale-110 transition-transform"
                        title="Stamp sticker"
                      >
                        {stk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* UPLOAD & WEB MEDIA */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <h4 className="font-bold text-[#3C2F2B] uppercase tracking-wider font-mono text-[11px]">
                  Media & Photos
                </h4>

                {/* Local file */}
                <div className="border border-dashed border-[#D4C3B3] rounded-2xl p-4 text-center bg-[#FAF7F2]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLocalImageUpload}
                    className="w-full text-[11px] file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-[10px] file:bg-[#3C2F2B] file:text-white cursor-pointer"
                  />
                  <p className="text-[10px] text-[#8C7A70] mt-1.5">PNG, JPG, WebP from your device</p>
                </div>

                {/* Web image url */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#8C7A70] uppercase font-semibold block">
                    Paste Image / Web URL
                  </label>
                  <input
                    type="text"
                    value={uploadUrlInput}
                    onChange={(e) => setUploadUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs"
                  />
                  <button
                    onClick={handleFetchWebImageUrl}
                    disabled={isFetchingUrl || !uploadUrlInput.trim()}
                    className="w-full py-2 rounded-xl bg-[#3C2F2B] text-white font-semibold disabled:opacity-40"
                  >
                    {isFetchingUrl ? 'Fetching...' : 'Attach Image to Slide'}
                  </button>
                </div>

                {currentSlide?.imageUrl && (
                  <button
                    onClick={() => updateCurrentSlide({ imageUrl: undefined })}
                    className="w-full py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[11px]"
                  >
                    Remove Slide Image
                  </button>
                )}
              </div>
            )}

            {/* EMBEDDED AI COMPANION */}
            {activeTab === 'ai' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[#E11D48] font-bold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>PinAI Slide Companion</span>
                </div>
                <p className="text-[#8C7A70] leading-snug">
                  Explain whatever is confusing or hard to understand on this slide!
                </p>

                {/* Quick Action buttons */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleAskAI('eli5')}
                    disabled={aiLoading}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] font-medium flex items-center gap-1.5 border border-rose-200"
                  >
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>Explain Like I'm 5 (Analogy)</span>
                  </button>

                  <button
                    onClick={() => handleAskAI('deep-dive')}
                    disabled={aiLoading}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3C2F2B] font-medium flex items-center gap-1.5 border border-[#E7DFD5]"
                  >
                    <Brain className="w-3.5 h-3.5 shrink-0" />
                    <span>Deep Dive Mental Model</span>
                  </button>

                  <button
                    onClick={() => handleAskAI('bullet-summary')}
                    disabled={aiLoading}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3C2F2B] font-medium flex items-center gap-1.5 border border-[#E7DFD5]"
                  >
                    <ListChecks className="w-3.5 h-3.5 shrink-0" />
                    <span>Aesthetic Study Bullets</span>
                  </button>

                  <button
                    onClick={() => handleAskAI('quiz')}
                    disabled={aiLoading}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#3C2F2B] font-medium flex items-center gap-1.5 border border-[#E7DFD5]"
                  >
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Quiz Me on This Slide</span>
                  </button>
                </div>

                {/* Custom Question */}
                <div className="pt-2 border-t border-[#ECE3D8]">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask specific question..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs mb-1.5"
                  />
                  <button
                    onClick={() => handleAskAI('custom')}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="w-full py-1.5 rounded-xl bg-[#3C2F2B] text-white font-medium disabled:opacity-40"
                  >
                    Ask PinAI
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Slide Sheet Canvas Display */}
          <div className="flex-1 bg-[#F5EFE6] p-4 sm:p-8 overflow-y-auto flex items-center justify-center">
            {/* The Physical Slide Paper Sheet */}
            <div
              className={`relative w-full max-w-2xl min-h-[560px] rounded-3xl p-8 sm:p-10 shadow-polaroid border border-black/10 transition-all ${
                currentSlide?.paperStyle === 'ruled'
                  ? 'bg-notebook-ruled'
                  : currentSlide?.paperStyle === 'grid'
                  ? 'bg-notebook-grid'
                  : ''
              }`}
              style={{ backgroundColor: currentSlide?.color || '#FFFDF9' }}
            >
              {/* Pushpin & Washi Tape */}
              <WashiTape style={currentSlide?.washiTape || 'polka'} />
              <PushPin style={currentSlide?.pinType || 'red-pin'} />

              {/* Slide Number Watermark */}
              <div className="absolute top-4 right-6 text-xs font-mono font-bold text-black/25">
                SLIDE {currentSlideIndex + 1}/{slides.length}
              </div>

              {/* Slide Title */}
              <input
                type="text"
                value={currentSlide?.title || ''}
                onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                placeholder="Slide Heading or Concept..."
                className={`w-full text-2xl font-bold bg-transparent border-none focus:outline-none mb-3 text-[#2D2727] ${currentSlide?.fontFamily || 'font-caveat'}`}
              />

              {/* Uploaded Image if any */}
              {currentSlide?.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden max-h-56 mb-4 shadow-xs border border-black/10 group">
                  <img
                    src={currentSlide.imageUrl}
                    alt="Slide photo"
                    className="w-full h-auto object-cover max-h-56"
                  />
                </div>
              )}

              {/* Main Content Area (Keypad Typing) */}
              <textarea
                value={currentSlide?.content || ''}
                onChange={(e) => updateCurrentSlide({ content: e.target.value })}
                rows={6}
                placeholder="Type your notes, formulas, thoughts, or explanations with your chosen handwriting font..."
                className={`w-full bg-transparent border-none focus:outline-none resize-none leading-relaxed text-[#2D2727] ${
                  currentSlide?.fontFamily || 'font-caveat'
                } ${
                  currentSlide?.fontSize === 'sm'
                    ? 'text-sm'
                    : currentSlide?.fontSize === 'xl'
                    ? 'text-xl'
                    : 'text-base'
                }`}
              />

              {/* Interactive Slide Sticky Notes pinned on this slide */}
              {currentSlide?.stickies && currentSlide.stickies.length > 0 && (
                <div className="space-y-3 mt-4 pt-3 border-t border-black/10">
                  <div className="text-[10px] font-mono uppercase text-black/40">Pinned Sticky Notes:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSlide.stickies.map((stk) => (
                      <div
                        key={stk.id}
                        className="p-3.5 rounded-2xl shadow-sm border border-black/10 relative group/stk"
                        style={{
                          backgroundColor: stk.color,
                          transform: `rotate(${stk.rotation || 0}deg)`,
                        }}
                      >
                        <button
                          onClick={() => handleRemoveSticky(stk.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full text-stone-400 hover:text-red-500 opacity-0 group-hover/stk:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <textarea
                          value={stk.text}
                          onChange={(e) => handleUpdateStickyText(stk.id, e.target.value)}
                          rows={2}
                          className={`w-full bg-transparent border-none focus:outline-none resize-none text-xs leading-relaxed ${stk.fontFamily} text-[#2D2727]`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cute stickers stamped on slide */}
              {currentSlide?.stickers && currentSlide.stickers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-2">
                  {currentSlide.stickers.map((stk) => (
                    <span key={stk.id} className="text-xl filter drop-shadow-xs select-none">
                      {stk.emoji}
                    </span>
                  ))}
                </div>
              )}

              {/* Freehand Handwriting Canvas Overlay Layer */}
              <canvas
                ref={canvasRef}
                onMouseDown={startDraw}
                onMouseMove={onDrawMove}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={onDrawMove}
                onTouchEnd={endDraw}
                className={`absolute inset-0 w-full h-full rounded-3xl touch-none ${
                  activeTab === 'draw' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
                }`}
              />
            </div>
          </div>

          {/* AI Output preview drawer if opened or generated */}
          {activeTab === 'ai' && (
            <div className="w-80 bg-[#FFFDF9] border-l border-[#ECE3D8] p-5 overflow-y-auto flex flex-col justify-between shrink-0 text-xs">
              <div>
                <h4 className="font-bold text-[#2D2727] font-playfair text-sm mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E11D48]" />
                  PinAI Explanation
                </h4>

                {aiLoading ? (
                  <div className="py-16 text-center space-y-2 text-[#8C7A70]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E11D48]" />
                    <p className="font-playfair italic">Synthesizing intuitive explanation...</p>
                  </div>
                ) : aiOutput ? (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E7DFD5] text-[#2D2727] leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto font-sans">
                    {aiOutput}
                  </div>
                ) : (
                  <p className="text-[#8C7A70] italic py-8 text-center">
                    Click one of the explanation modes to break down confusing parts of this slide!
                  </p>
                )}
              </div>

              {aiOutput && (
                <button
                  onClick={handlePinAIToSlideSticky}
                  className="mt-4 w-full py-2.5 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold shadow-md flex items-center justify-center gap-1.5 transition-transform hover:scale-102"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>Pin Insight as Slide Sticky</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
