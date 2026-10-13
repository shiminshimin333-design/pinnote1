import React, { useState, useEffect } from 'react';
import {
  Type,
  Palette,
  CheckSquare,
  Sparkles,
  X,
  Check,
  Plus,
  Trash2,
  Bookmark,
  Pin,
  Loader2,
} from 'lucide-react';
import {
  ChecklistItem,
  FontOption,
  NoteType,
  PinItem,
  PinStyle,
  WashiTapeStyle,
} from '../types/note';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Partial<PinItem>) => void;
  initialNote?: PinItem | null;
}

const PASTEL_COLORS = [
  { name: 'Butter Yellow', hex: '#FEF08A' },
  { name: 'Rosewater', hex: '#FECDD3' },
  { name: 'Sage Mint', hex: '#BBF7D0' },
  { name: 'Sky Mist', hex: '#BFDBFE' },
  { name: 'Lavender', hex: '#E9D5FF' },
  { name: 'Warm Peach', hex: '#FED7AA' },
  { name: 'Cream Linen', hex: '#FFFDF9' },
  { name: 'Kraft Paper', hex: '#E8D8C8' },
];

const FONTS: Array<{ id: FontOption; label: string; sampleClass: string }> = [
  { id: 'font-caveat', label: 'Caveat (Handwriting)', sampleClass: 'font-caveat' },
  { id: 'font-indie', label: 'Indie Flower (Cute Hand)', sampleClass: 'font-indie' },
  { id: 'font-patrick', label: 'Patrick Hand (Neat Pen)', sampleClass: 'font-patrick' },
  { id: 'font-reenie', label: 'Reenie Beanie (Doodle Script)', sampleClass: 'font-reenie' },
  { id: 'font-playfair', label: 'Playfair (Editorial Serif)', sampleClass: 'font-playfair' },
  { id: 'font-courier', label: 'Courier (Typewriter)', sampleClass: 'font-courier' },
  { id: 'font-jakarta', label: 'Jakarta (Clean Sans)', sampleClass: 'font-jakarta' },
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FEF08A');
  const [fontFamily, setFontFamily] = useState<FontOption>('font-caveat');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [washiTape, setWashiTape] = useState<WashiTapeStyle>('polka');
  const [pinType, setPinType] = useState<PinStyle>('red-pin');
  const [noteType, setNoteType] = useState<NoteType>('sticky');
  const [tagsInput, setTagsInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [isEnhancingWithAI, setIsEnhancingWithAI] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setColor(initialNote.color || '#FEF08A');
      setFontFamily(initialNote.fontFamily || 'font-caveat');
      setFontSize(initialNote.fontSize || 'lg');
      setWashiTape(initialNote.washiTape || 'polka');
      setPinType(initialNote.pinType || 'red-pin');
      setNoteType(initialNote.type || 'sticky');
      setTagsInput(initialNote.tags ? initialNote.tags.join(', ') : '');
      setChecklist(initialNote.checklist || []);
    } else {
      // Defaults for brand-new note
      setTitle('');
      setContent('');
      setColor('#FEF08A');
      setFontFamily('font-caveat');
      setFontSize('lg');
      setWashiTape('polka');
      setPinType('red-pin');
      setNoteType('sticky');
      setTagsInput('Notes');
      setChecklist([]);
    }
  }, [isOpen, initialNote]);

  const handleAddCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${Math.random()}`, text: newCheckItem.trim(), done: false },
    ]);
    setNewCheckItem('');
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleRemoveCheckItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAIEnhance = async () => {
    if (!content.trim() && !title.trim()) return;
    setIsEnhancingWithAI(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content || title,
          title,
          mode: 'bullet-summary',
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        setContent((prev) => `${prev ? prev + '\n\n' : ''}✨ AI Study Notes:\n${data.explanation}`);
      }
    } catch (err) {
      console.error('Enhance error:', err);
    } finally {
      setIsEnhancingWithAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title || 'Sticky Note',
      content,
      color,
      fontFamily,
      fontSize,
      washiTape,
      pinType,
      type: checklist.length > 0 ? 'checklist' : noteType,
      tags: tags.length > 0 ? tags : ['Note'],
      checklist: checklist.length > 0 ? checklist : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#E7DFD5] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFFDF9] border-b border-[#ECE3D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border border-black/10"
              style={{ backgroundColor: color }}
            >
              <Pin className="w-5 h-5 text-[#8C5E47]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-playfair text-[#2D2727]">
                {initialNote ? 'Edit Sticky Note' : 'Create Aesthetic Sticky Note'}
              </h2>
              <p className="text-xs text-[#8C7A70]">
                Choose handwriting fonts, pastel papers, washi tapes, and checklists
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F2ECE4] text-[#78665E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Note preview box with live style */}
          <div
            className="p-5 rounded-3xl shadow-sm border border-black/10 transition-colors relative"
            style={{ backgroundColor: color }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title or Subject..."
              className={`w-full text-xl font-bold bg-transparent border-none focus:outline-none placeholder:text-black/30 mb-2 ${fontFamily}`}
            />

            {/* Note Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Type your notes, quotes, or thoughts here..."
              className={`w-full bg-transparent border-none focus:outline-none resize-none placeholder:text-black/30 leading-relaxed ${fontFamily} ${
                fontSize === 'sm'
                  ? 'text-sm'
                  : fontSize === 'base'
                  ? 'text-base'
                  : fontSize === 'xl'
                  ? 'text-2xl'
                  : 'text-lg'
              }`}
            />

            {/* Live checklist items inside preview if any */}
            {checklist.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-black/10">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleCheckItem(item.id)}
                      className="rounded text-[#E11D48] focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`text-sm flex-1 ${fontFamily} ${
                        item.done ? 'line-through opacity-50' : ''
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick AI Enhance button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleAIEnhance}
              disabled={isEnhancingWithAI || (!content && !title)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#E7DFD5] hover:border-[#E11D48] text-xs font-semibold text-[#8C5E47] hover:text-[#E11D48] shadow-2xs transition-all disabled:opacity-40"
            >
              {isEnhancingWithAI ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E11D48]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
              )}
              <span>Auto-summarize & add study bullets with AI</span>
            </button>
          </div>

          {/* Color Palette Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block">
              Paper Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PASTEL_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-8 h-8 rounded-full border border-black/15 transition-transform ${
                    color === c.hex ? 'scale-125 ring-2 ring-stone-800 shadow-xs' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Font Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block">
              Handwriting & Typeface Fonts
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={`px-3 py-2 rounded-2xl border text-left transition-all ${
                    fontFamily === f.id
                      ? 'bg-[#3C2F2B] text-white border-[#3C2F2B] shadow-xs'
                      : 'bg-[#FFFDF9] border-[#E7DFD5] text-[#3C2F2B] hover:bg-[#F6EFE7]'
                  }`}
                >
                  <span className={`block text-sm truncate ${f.sampleClass}`}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Tape & Pin Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                Text Size
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727]"
              >
                <option value="sm">Small</option>
                <option value="base">Normal</option>
                <option value="lg">Large (Handwriting)</option>
                <option value="xl">Extra Large (Header)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                Washi Tape
              </label>
              <select
                value={washiTape}
                onChange={(e) => setWashiTape(e.target.value as WashiTapeStyle)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727]"
              >
                <option value="polka">Peach Polka Dot</option>
                <option value="stripes">Lavender Stripes</option>
                <option value="pink">Pink Dots</option>
                <option value="floral">Sage Floral</option>
                <option value="grid">Blue Grid</option>
                <option value="kraft">Kraft Vintage</option>
                <option value="none">No Tape</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                Pushpin Style
              </label>
              <select
                value={pinType}
                onChange={(e) => setPinType(e.target.value as PinStyle)}
                className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727]"
              >
                <option value="red-pin">Classic Red Pin 📌</option>
                <option value="gold-tack">Gold Brass Tack</option>
                <option value="flower-clip">Flower Clip 🌸</option>
                <option value="star-clip">Star Clip ⭐</option>
                <option value="tape">Taped on</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* Add Checklist Items section */}
          <div className="space-y-2 pt-2 border-t border-[#ECE3D8]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#8C5E47]" />
                Interactive Checklist / Tasks (Optional)
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCheckItem(e);
                  }
                }}
                placeholder="Add a checklist item (press Enter)..."
                className="flex-1 px-4 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCheckItem}
                className="px-3 py-2 rounded-2xl bg-[#3C2F2B] hover:bg-[#201815] text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Study, Formula, Brainstorm, Physics"
              className="w-full px-4 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-2 border-t border-[#ECE3D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#E7DFD5] hover:bg-[#F2ECE4] text-[#6F5F57] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{initialNote ? 'Save Changes' : 'Pin Sticky Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
