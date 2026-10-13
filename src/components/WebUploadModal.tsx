import React, { useState } from 'react';
import {
  Globe,
  Upload,
  Sparkles,
  X,
  Check,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { FontOption, PinStyle, WashiTapeStyle } from '../types/note';

interface WebUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePin: (pinData: {
    title: string;
    content: string;
    imageUrl?: string;
    webMeta?: {
      url: string;
      domain: string;
      title?: string;
      description?: string;
    };
    fontFamily: FontOption;
    washiTape: WashiTapeStyle;
    pinType: PinStyle;
    tags: string[];
    type: 'photo' | 'weblink';
  }) => void;
}

const CURATED_AESTHETIC_PRESETS = [
  {
    label: 'Cozy Study ☕',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
    title: 'Warm Focus Morning',
    tag: 'Study',
  },
  {
    label: 'Vintage Books 📖',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80',
    title: 'Old Library Whispers',
    tag: 'Books',
  },
  {
    label: 'Botanical Plant 🌿',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80',
    title: 'Eucalyptus & Ferns',
    tag: 'Nature',
  },
  {
    label: 'Art & Sketch 🎨',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80',
    title: 'Oil Painting Studio',
    tag: 'Art',
  },
  {
    label: 'Croissant Café 🥐',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
    title: 'Fresh Pain au Chocolat',
    tag: 'Pastry',
  },
  {
    label: 'Minimalist Architecture 🏛️',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80',
    title: 'Clean Geometry & Shadow',
    tag: 'Design',
  },
  {
    label: 'Stationery & Pens 🖊️',
    url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80',
    title: 'Fine Nibs & Journaling',
    tag: 'Pens',
  },
  {
    label: 'Autumn Sunlight 🍂',
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=700&q=80',
    title: 'Golden Hour Reflections',
    tag: 'Autumn',
  },
];

export const WebUploadModal: React.FC<WebUploadModalProps> = ({
  isOpen,
  onClose,
  onSavePin,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'curated'>('url');
  const [webUrl, setWebUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [webDomain, setWebDomain] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [washiTape, setWashiTape] = useState<WashiTapeStyle>('kraft');
  const [pinType, setPinType] = useState<PinStyle>('red-pin');
  const [fontFamily, setFontFamily] = useState<FontOption>('font-playfair');

  if (!isOpen) return null;

  const handleFetchWebPreview = async () => {
    if (!webUrl.trim()) return;
    setIsLoadingPreview(true);
    try {
      const res = await fetch('/api/web/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webUrl.trim() }),
      });
      const data = await res.json();
      if (data.title && !title) setTitle(data.title);
      if (data.image) setPreviewImage(data.image);
      if (data.domain) setWebDomain(data.domain);
      if (data.description && !content) setContent(data.description);
    } catch (err) {
      console.error('Failed to fetch web preview:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectCurated = (item: (typeof CURATED_AESTHETIC_PRESETS)[0]) => {
    setPreviewImage(item.url);
    setTitle(item.title);
    setContent(`Saved from aesthetic collection ✨`);
    setTagsInput(item.tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage && !webUrl) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const isLink = Boolean(webUrl && !previewImage?.startsWith('data:image'));

    onSavePin({
      title: title || 'Aesthetic Web Pin',
      content,
      imageUrl: previewImage || undefined,
      webMeta: webUrl
        ? {
            url: webUrl,
            domain: webDomain || new URL(webUrl.startsWith('http') ? webUrl : `https://${webUrl}`).hostname,
            title,
            description: content,
          }
        : undefined,
      fontFamily,
      washiTape,
      pinType,
      tags: tags.length > 0 ? tags : ['WebPin'],
      type: isLink ? 'weblink' : 'photo',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#E7DFD5] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFFDF9] border-b border-[#ECE3D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3C2F2B] text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-playfair text-[#2D2727]">
                Upload from Web & Everywhere
              </h2>
              <p className="text-xs text-[#8C7A70]">
                Clip pictures, bookmark articles, or upload your own photos
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

        {/* Tab Switcher */}
        <div className="px-6 py-3 bg-[#F5EFE6] border-b border-[#ECE3D8] flex gap-2">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-[#3C2F2B] text-white shadow-xs'
                : 'bg-[#FFFDF9] text-[#6F5F57] hover:bg-[#F2ECE4] border border-[#E7DFD5]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Web Link / Image URL
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'file'
                ? 'bg-[#3C2F2B] text-white shadow-xs'
                : 'bg-[#FFFDF9] text-[#6F5F57] hover:bg-[#F2ECE4] border border-[#E7DFD5]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File from Device
          </button>

          <button
            onClick={() => setActiveTab('curated')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'curated'
                ? 'bg-[#3C2F2B] text-white shadow-xs'
                : 'bg-[#FFFDF9] text-[#6F5F57] hover:bg-[#F2ECE4] border border-[#E7DFD5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
            Aesthetic Curations
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block">
                Paste Web Image or Webpage URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://example.com/aesthetic-photo.jpg or https://blog.com/article"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-sm text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none focus:ring-2 focus:ring-[#3C2F2B]/20"
                />
                <button
                  type="button"
                  onClick={handleFetchWebPreview}
                  disabled={isLoadingPreview || !webUrl.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-[#3C2F2B] hover:bg-[#201815] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isLoadingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Fetch Preview</span>
                </button>
              </div>
            </div>
          )}

          {/* Local File Input */}
          {activeTab === 'file' && (
            <div className="border-2 border-dashed border-[#D4C3B3] hover:border-[#8C5E47] rounded-3xl p-6 text-center bg-[#FFFDF9] transition-colors relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-10 h-10 text-[#8C5E47] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#3C2F2B]">
                Click or drag & drop photos here
              </p>
              <p className="text-xs text-[#8C7A70] mt-1">PNG, JPG, WebP, GIF up to 10MB</p>
            </div>
          )}

          {/* Curated Aesthetic Grid */}
          {activeTab === 'curated' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block">
                Choose an Aesthetic Photography Pin
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                {CURATED_AESTHETIC_PRESETS.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => handleSelectCurated(item)}
                    className="group relative rounded-2xl overflow-hidden aspect-4/3 border-2 border-transparent hover:border-[#E11D48] transition-all text-left shadow-2xs hover:scale-103"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[11px] font-medium text-white truncate">
                        {item.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Preview Banner */}
          {previewImage && (
            <div className="relative rounded-2xl overflow-hidden max-h-56 bg-stone-100 border border-[#E7DFD5] flex items-center justify-center group">
              <img
                src={previewImage}
                alt="Upload preview"
                className="max-h-56 object-contain w-auto mx-auto"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Title & Caption */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                Title / Heading
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your pin a dreamy title..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-sm text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none focus:ring-2 focus:ring-[#3C2F2B]/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                Caption & Thoughts
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Add your note, recipe steps, mood quote, or context..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-sm text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none focus:ring-2 focus:ring-[#3C2F2B]/20"
              />
            </div>

            {/* Aesthetic Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                  Font
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontOption)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727]"
                >
                  <option value="font-playfair">Playfair Serif</option>
                  <option value="font-caveat">Caveat Handwriting</option>
                  <option value="font-indie">Indie Lettering</option>
                  <option value="font-courier">Typewriter</option>
                  <option value="font-jakarta">Modern Clean</option>
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
                  <option value="kraft">Kraft Vintage</option>
                  <option value="polka">Peach Polka Dot</option>
                  <option value="stripes">Lavender Stripes</option>
                  <option value="pink">Pink Dots</option>
                  <option value="floral">Sage Floral</option>
                  <option value="grid">Blue Grid</option>
                  <option value="none">No Tape</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                  Pushpin
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
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Inspiration, Web, Photography, Study"
                className="w-full px-4 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-[#E7DFD5] hover:bg-[#F2ECE4] text-[#6F5F57] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!previewImage && !webUrl}
              className="px-6 py-2.5 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              <span>Pin to Board</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
