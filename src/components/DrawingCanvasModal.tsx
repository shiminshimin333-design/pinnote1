import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Feather,
  Highlighter,
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

interface DrawingCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drawingDataUrl: string, title?: string) => void;
  initialDrawing?: string;
  initialTitle?: string;
}

type PenType = 'pen' | 'fountain' | 'highlighter' | 'pencil' | 'eraser';

const COLOR_PALETTE = [
  { name: 'Charcoal', hex: '#27272A' },
  { name: 'Espresso', hex: '#78350F' },
  { name: 'Terracotta', hex: '#C2410C' },
  { name: 'Sage Green', hex: '#15803D' },
  { name: 'Dusty Rose', hex: '#E11D48' },
  { name: 'Aegean Blue', hex: '#0284C7' },
  { name: 'Lavender', hex: '#9333EA' },
  { name: 'Mustard', hex: '#D97706' },
  { name: 'White Chalk', hex: '#FFFFFF' },
];

export const DrawingCanvasModal: React.FC<DrawingCanvasModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDrawing,
  initialTitle = 'My Handwritten Note 🖊️',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<PenType>('fountain');
  const [strokeColor, setStrokeColor] = useState('#27272A');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [title, setTitle] = useState(initialTitle);
  const [paperStyle, setPaperStyle] = useState<'cream' | 'ruled' | 'grid' | 'kraft'>('ruled');

  // History for undo/redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Smooth drawing point cache
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle || 'My Handwritten Note 🖊️');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Reset dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        saveHistory();
      };
      img.src = initialDrawing;
    } else {
      saveHistory();
    }
  }, [isOpen]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(currentImg);
    if (newHistory.length > 25) newHistory.shift();
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevStep = historyStep - 1;
    ctx.putImageData(history[prevStep], 0, 0);
    setHistoryStep(prevStep);
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextStep = historyStep + 1;
    ctx.putImageData(history[nextStep], 0, 0);
    setHistoryStep(nextStep);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  // Coordinates helper
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

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
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

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasPos(e);
    const lastPos = lastPointRef.current;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (selectedTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 3;
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';

      if (selectedTool === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * 4;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      } else if (selectedTool === 'fountain') {
        // Dynamic calligraphy angle simulation
        const dist = Math.hypot(currentPos.x - lastPos.x, currentPos.y - lastPos.y);
        const dynamicWidth = Math.max(1.5, strokeWidth * (1 + Math.sin(dist * 0.1) * 0.3));
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = dynamicWidth;

        // Quadratic curve smoothing
        const midX = (lastPos.x + currentPos.x) / 2;
        const midY = (lastPos.y + currentPos.y) / 2;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.quadraticCurveTo(lastPos.x, lastPos.y, midX, midY);
        ctx.stroke();
      } else if (selectedTool === 'pencil') {
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * 0.9;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      } else {
        // Standard ballpoint pen
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      }
    }

    lastPointRef.current = currentPos;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    saveHistory();
  };

  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas with the chosen paper background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Fill background color
    if (paperStyle === 'kraft') {
      exportCtx.fillStyle = '#E8D8C8';
    } else if (paperStyle === 'ruled' || paperStyle === 'grid' || paperStyle === 'cream') {
      exportCtx.fillStyle = '#FFFDF9';
    }
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Optional background grid/ruled lines baked into export
    if (paperStyle === 'ruled') {
      exportCtx.strokeStyle = 'rgba(215, 195, 180, 0.45)';
      exportCtx.lineWidth = 1.5;
      for (let y = 56; y < exportCanvas.height; y += 56) {
        exportCtx.beginPath();
        exportCtx.moveTo(0, y);
        exportCtx.lineTo(exportCanvas.width, y);
        exportCtx.stroke();
      }
    } else if (paperStyle === 'grid') {
      exportCtx.strokeStyle = 'rgba(210, 190, 180, 0.35)';
      exportCtx.lineWidth = 1;
      for (let x = 48; x < exportCanvas.width; x += 48) {
        exportCtx.beginPath();
        exportCtx.moveTo(x, 0);
        exportCtx.lineTo(x, exportCanvas.height);
        exportCtx.stroke();
      }
      for (let y = 48; y < exportCanvas.height; y += 48) {
        exportCtx.beginPath();
        exportCtx.moveTo(0, y);
        exportCtx.lineTo(exportCanvas.width, y);
        exportCtx.stroke();
      }
    }

    // Draw the strokes on top
    exportCtx.drawImage(canvas, 0, 0);

    const dataUrl = exportCanvas.toDataURL('image/png');
    onSave(dataUrl, title);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-4xl shadow-2xl border border-[#E7DFD5] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#ECE3D8] bg-[#FFFDF9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#F2ECE4] text-[#8C5E47]">
              <Feather className="w-5 h-5" />
            </span>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your handwritten note a title..."
                className="text-lg font-bold font-playfair bg-transparent border-none focus:outline-none focus:ring-0 text-[#3C2F2B] w-64 md:w-96"
              />
              <p className="text-xs text-[#8C7A70] font-sans">
                Handwrite, doodle, or diagram with authentic aesthetic pens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDrawing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              Pin to Board
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F2ECE4] text-[#78665E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawing Toolbar */}
        <div className="px-6 py-3 bg-[#FAF7F2] border-b border-[#ECE3D8] flex flex-wrap items-center justify-between gap-3 text-sm">
          {/* Pen Tools */}
          <div className="flex items-center gap-1 bg-[#FFFDF9] p-1 rounded-2xl border border-[#E7DFD5] shadow-xs">
            <button
              onClick={() => setSelectedTool('fountain')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                selectedTool === 'fountain'
                  ? 'bg-[#3C2F2B] text-white shadow-xs'
                  : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
              title="Fountain Pen"
            >
              <Feather className="w-4 h-4" />
              <span>Fountain</span>
            </button>

            <button
              onClick={() => setSelectedTool('pen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                selectedTool === 'pen'
                  ? 'bg-[#3C2F2B] text-white shadow-xs'
                  : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
              title="Ballpoint Ink"
            >
              <PenTool className="w-4 h-4" />
              <span>Ballpoint</span>
            </button>

            <button
              onClick={() => setSelectedTool('highlighter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                selectedTool === 'highlighter'
                  ? 'bg-[#3C2F2B] text-white shadow-xs'
                  : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
              title="Highlighter"
            >
              <Highlighter className="w-4 h-4" />
              <span>Highlighter</span>
            </button>

            <button
              onClick={() => setSelectedTool('pencil')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                selectedTool === 'pencil'
                  ? 'bg-[#3C2F2B] text-white shadow-xs'
                  : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
              title="Pencil"
            >
              <Pencil className="w-4 h-4" />
              <span>Pencil</span>
            </button>

            <button
              onClick={() => setSelectedTool('eraser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                selectedTool === 'eraser'
                  ? 'bg-[#E11D48] text-white shadow-xs'
                  : 'text-[#6F5F57] hover:bg-[#F2ECE4]'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
              <span>Eraser</span>
            </button>
          </div>

          {/* Stroke Width Picker */}
          <div className="flex items-center gap-2 bg-[#FFFDF9] px-3 py-1.5 rounded-2xl border border-[#E7DFD5] shadow-xs">
            <span className="text-xs text-[#8C7A70] font-mono">Size:</span>
            {[2, 4, 8, 14].map((w) => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  strokeWidth === w
                    ? 'bg-[#ECE3D8] text-[#3C2F2B] font-bold'
                    : 'hover:bg-[#F6EFE7] text-[#8C7A70]'
                }`}
              >
                <div
                  className="rounded-full bg-[#3C2F2B]"
                  style={{ width: `${Math.min(18, w * 1.5)}px`, height: `${Math.min(18, w * 1.5)}px` }}
                />
              </button>
            ))}
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5 bg-[#FFFDF9] p-1.5 rounded-2xl border border-[#E7DFD5] shadow-xs">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setStrokeColor(c.hex);
                  if (selectedTool === 'eraser') setSelectedTool('fountain');
                }}
                className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${
                  strokeColor === c.hex && selectedTool !== 'eraser'
                    ? 'scale-125 ring-2 ring-stone-700 shadow-xs'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Paper Style */}
          <div className="flex items-center gap-1 bg-[#FFFDF9] p-1 rounded-2xl border border-[#E7DFD5] shadow-xs">
            <button
              onClick={() => setPaperStyle('ruled')}
              className={`px-2 py-1 text-xs rounded-xl font-medium transition-all ${
                paperStyle === 'ruled' ? 'bg-[#ECE3D8] text-[#3C2F2B]' : 'text-[#8C7A70]'
              }`}
            >
              Ruled 📖
            </button>
            <button
              onClick={() => setPaperStyle('grid')}
              className={`px-2 py-1 text-xs rounded-xl font-medium transition-all ${
                paperStyle === 'grid' ? 'bg-[#ECE3D8] text-[#3C2F2B]' : 'text-[#8C7A70]'
              }`}
            >
              Grid 📐
            </button>
            <button
              onClick={() => setPaperStyle('cream')}
              className={`px-2 py-1 text-xs rounded-xl font-medium transition-all ${
                paperStyle === 'cream' ? 'bg-[#ECE3D8] text-[#3C2F2B]' : 'text-[#8C7A70]'
              }`}
            >
              Blank 📄
            </button>
            <button
              onClick={() => setPaperStyle('kraft')}
              className={`px-2 py-1 text-xs rounded-xl font-medium transition-all ${
                paperStyle === 'kraft' ? 'bg-[#ECE3D8] text-[#3C2F2B]' : 'text-[#8C7A70]'
              }`}
            >
              Kraft 📦
            </button>
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-[#6F5F57] hover:bg-[#F2ECE4] disabled:opacity-40 transition-all"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="p-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-[#6F5F57] hover:bg-[#F2ECE4] disabled:opacity-40 transition-all"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-[#E11D48] hover:bg-[#FEE2E2] transition-all"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Area with Paper texture */}
        <div
          className={`flex-1 relative overflow-hidden min-h-[440px] md:min-h-[500px] cursor-crosshair select-none ${
            paperStyle === 'ruled'
              ? 'bg-[#FFFDF9] bg-notebook-ruled'
              : paperStyle === 'grid'
              ? 'bg-[#FFFDF9] bg-notebook-grid'
              : paperStyle === 'kraft'
              ? 'bg-[#E8D8C8]'
              : 'bg-[#FFFDF9]'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block absolute inset-0 touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Footer hints */}
        <div className="px-6 py-2.5 bg-[#FFFDF9] border-t border-[#ECE3D8] flex items-center justify-between text-xs text-[#8C7A70]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
            Tip: Fountain pen has dynamic pressure smoothing; Highlighter is semi-transparent!
          </span>
          <span className="font-mono">Ready to pin to moodboard</span>
        </div>
      </div>
    </div>
  );
};
