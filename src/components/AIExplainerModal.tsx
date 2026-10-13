import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  Brain,
  ListChecks,
  HelpCircle,
  Pin,
  X,
  Copy,
  Check,
  Send,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { PinItem } from '../types/note';

interface AIExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetNote?: PinItem | null;
  onPinExplanationAsNote: (text: string, title: string, color?: string) => void;
}

export const AIExplainerModal: React.FC<AIExplainerModalProps> = ({
  isOpen,
  onClose,
  targetNote,
  onPinExplanationAsNote,
}) => {
  const [mode, setMode] = useState<'eli5' | 'deep-dive' | 'bullet-summary' | 'quiz' | 'custom'>('eli5');
  const [customQuestion, setCustomQuestion] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pinnedSuccess, setPinnedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPinnedSuccess(false);
    setError(null);

    if (targetNote) {
      setTopicInput(targetNote.title || 'Selected Note');
      // If note already had an explanation, show it
      if (targetNote.aiExplanation) {
        setExplanation(targetNote.aiExplanation);
      } else {
        // Automatically fetch initial ELI5 explanation for the note
        handleExplain(targetNote.content || targetNote.title, targetNote.title, 'eli5');
      }
    } else {
      setTopicInput('');
      setExplanation('');
    }
  }, [isOpen, targetNote]);

  const handleExplain = async (
    contentToExplain: string,
    titleToUse: string,
    modeToUse: 'eli5' | 'deep-dive' | 'bullet-summary' | 'quiz' | 'custom',
    question?: string
  ) => {
    if (!contentToExplain && !question) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToExplain,
          title: titleToUse,
          mode: modeToUse,
          customQuestion: question,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to explain concept with AI');
      }

      const data = await res.json();
      setExplanation(data.explanation || 'No explanation returned.');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error communicating with AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: 'eli5' | 'deep-dive' | 'bullet-summary' | 'quiz' | 'custom') => {
    setMode(newMode);
    const content = targetNote?.content || topicInput;
    const title = targetNote?.title || topicInput;
    if (newMode !== 'custom') {
      handleExplain(content, title, newMode);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    const content = targetNote?.content || topicInput;
    const title = targetNote?.title || topicInput;
    handleExplain(content, title, 'custom', customQuestion);
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePinAsNote = () => {
    if (!explanation) return;
    const noteTitle = `AI Note: ${targetNote?.title || topicInput || 'Explained'}`;
    onPinExplanationAsNote(explanation, noteTitle, '#FEF08A');
    setPinnedSuccess(true);
    setTimeout(() => setPinnedSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-3xl shadow-2xl border border-[#E7DFD5] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFFDF9] border-b border-[#ECE3D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E11D48] to-[#FB7185] flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-playfair text-[#2D2727]">
                  PinAI Concept Explainer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFE4E6] text-[#E11D48] tracking-wide uppercase">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-[#8C7A70]">
                Break down anything you can't understand into crystal-clear intuition
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

        {/* Note / Subject Banner */}
        <div className="px-6 py-3 bg-[#F5EFE6] border-b border-[#ECE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="w-4 h-4 text-[#8C5E47] shrink-0" />
            <span className="text-xs font-semibold text-[#8C5E47] uppercase tracking-wider">
              Topic:
            </span>
            {targetNote ? (
              <span className="text-sm font-medium text-[#3C2F2B] truncate font-playfair">
                {targetNote.title || 'Untitled Note'}
              </span>
            ) : (
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="What concept do you want explained? (e.g. Entropy, Epigenetics, WebSockets)..."
                className="text-sm font-medium text-[#3C2F2B] bg-transparent border-none focus:outline-none w-full"
              />
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#FFFDF9] p-1 rounded-2xl border border-[#E7DFD5] shadow-2xs self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => handleModeChange('eli5')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                mode === 'eli5'
                  ? 'bg-[#E11D48] text-white shadow-2xs'
                  : 'text-[#6F5F57] hover:bg-[#F6EFE7]'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Explain Like I'm 5</span>
            </button>

            <button
              onClick={() => handleModeChange('deep-dive')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                mode === 'deep-dive'
                  ? 'bg-[#E11D48] text-white shadow-2xs'
                  : 'text-[#6F5F57] hover:bg-[#F6EFE7]'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Deep Dive</span>
            </button>

            <button
              onClick={() => handleModeChange('bullet-summary')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                mode === 'bullet-summary'
                  ? 'bg-[#E11D48] text-white shadow-2xs'
                  : 'text-[#6F5F57] hover:bg-[#F6EFE7]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Study Bullets</span>
            </button>

            <button
              onClick={() => handleModeChange('quiz')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                mode === 'quiz'
                  ? 'bg-[#E11D48] text-white shadow-2xs'
                  : 'text-[#6F5F57] hover:bg-[#F6EFE7]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Quiz Me</span>
            </button>
          </div>
        </div>

        {/* Content & Explanation Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {targetNote && targetNote.content && (
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#6F5F57] max-h-28 overflow-y-auto">
              <span className="font-semibold text-[#8C5E47] block mb-1">
                Excerpt from note:
              </span>
              <p className="line-clamp-3 italic">{targetNote.content}</p>
            </div>
          )}

          {/* Explanation Box */}
          <div className="relative min-h-[220px] rounded-3xl bg-[#FFFDF9] p-6 border border-[#E7DFD5] shadow-xs">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#8C7A70] space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#E11D48]" />
                <p className="text-sm font-playfair italic">
                  Crafting a cozy, intuitive breakdown with analogies...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-[#FEE2E2] text-[#991B1B] text-sm">
                <p className="font-bold">Oops! Could not complete explanation.</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            ) : explanation ? (
              <div className="prose prose-sm max-w-none text-[#2D2727] font-sans leading-relaxed whitespace-pre-wrap selection:bg-[#FED7AA]">
                {explanation}
              </div>
            ) : (
              <div className="text-center py-12 text-[#8C7A70]">
                <Lightbulb className="w-10 h-10 mx-auto text-[#D4C3B3] mb-2" />
                <p className="text-sm">
                  Click one of the modes above or ask a specific question below to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ask Specific Question Bar */}
        <div className="px-6 py-3 bg-[#FAF7F2] border-t border-[#ECE3D8]">
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask anything you still don't get (e.g. 'Can you give me a coffee shop analogy?')"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-sm text-[#2D2727] placeholder:text-[#9C8A80] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 shadow-2xs"
            />
            <button
              type="submit"
              disabled={isLoading || !customQuestion.trim()}
              className="px-4 py-2.5 rounded-2xl bg-[#3C2F2B] hover:bg-[#201815] text-white text-sm font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-3.5 bg-[#FFFDF9] border-t border-[#ECE3D8] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!explanation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7DFD5] hover:bg-[#F6EFE7] text-[#6F5F57] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePinAsNote}
              disabled={!explanation || isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-medium shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{pinnedSuccess ? 'Pinned to Board! 🎉' : 'Pin to Board as Note'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
