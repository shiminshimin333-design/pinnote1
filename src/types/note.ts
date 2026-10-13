export type NoteType = 'sticky' | 'sketch' | 'photo' | 'weblink' | 'checklist' | 'quote';

export type FontOption =
  | 'font-caveat'
  | 'font-indie'
  | 'font-patrick'
  | 'font-playfair'
  | 'font-courier'
  | 'font-jakarta'
  | 'font-reenie';

export type WashiTapeStyle = 'none' | 'polka' | 'stripes' | 'pink' | 'floral' | 'grid' | 'kraft';

export type PinStyle = 'red-pin' | 'gold-tack' | 'tape' | 'flower-clip' | 'star-clip' | 'none';

export type BackgroundTheme = 'linen' | 'dot-grid' | 'ruled' | 'cork' | 'blush' | 'espresso';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface WebMeta {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  image?: string | null;
}

export interface PinItem {
  id: string;
  boardId: string;
  type: NoteType;
  title: string;
  content: string;
  color: string;
  fontFamily: FontOption;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  washiTape: WashiTapeStyle;
  pinType: PinStyle;
  rotation: number;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  drawingData?: string; // base64 PNG data url
  imageUrl?: string;
  webMeta?: WebMeta;
  checklist?: ChecklistItem[];
  tags: string[];
  createdAt: number;
  favorite?: boolean;
  zIndex?: number;
  aiExplanation?: string;
}

export interface Board {
  id: string;
  name: string;
  icon: string;
  description: string;
  themeBackground: BackgroundTheme;
  coverImage?: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  size: number;
  tool: 'pen' | 'fountain' | 'highlighter' | 'pencil' | 'eraser';
}

export interface AIExplanationRequest {
  content: string;
  title?: string;
  mode: 'eli5' | 'deep-dive' | 'bullet-summary' | 'quiz' | 'custom';
  customQuestion?: string;
}
