import React, { useState } from 'react';
import { User, Sparkles, X, Check, Heart, Palette } from 'lucide-react';
import { UserProfile } from '../types/note';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

const AVATAR_OPTIONS = ['🌸', '☕', '🎨', '🌿', '🥐', '🧸', '🕯️', '🎧', '📚', '✨', '🪐', '🦋'];

const BADGE_OPTIONS = [
  'Aesthetic Creator 🌸',
  'Study Aesthetician ☕',
  'Visual Thinker 🧠',
  'Vintage Scribe 📜',
  'Deep Mind & Doodler 🎨',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio);
  const [badge, setBadge] = useState(currentUser.aestheticBadge || BADGE_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || 'Aesthetic Creator',
      handle: handle.startsWith('@') ? handle.trim() : `@${handle.trim() || 'curator'}`,
      avatar,
      bio: bio.trim(),
      aestheticBadge: badge,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-md shadow-2xl border border-[#E7DFD5] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFFDF9] border-b border-[#ECE3D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E11D48] to-[#FB7185] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-playfair text-[#2D2727]">
                Personalize Public Creator Profile
              </h3>
              <p className="text-xs text-[#8C7A70]">Personalize how your notes look to the public</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F2ECE4] text-[#78665E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Avatar Picker */}
          <div>
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`text-2xl p-2 rounded-2xl border transition-all ${
                    avatar === av
                      ? 'bg-[#FFFDF9] border-[#E11D48] scale-110 shadow-xs'
                      : 'bg-[#FFFDF9] border-[#E7DFD5] hover:bg-[#F6EFE7]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Handle */}
          <div>
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
              Public Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. shimin 🌸"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-sm text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
              Username Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@shimin_study"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-sm text-[#2D2727] font-mono focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            />
          </div>

          {/* Bio / Quote */}
          <div>
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
              Public Bio / Aesthetic Vibe
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="curating aesthetic notes, matcha lattes, and deep thoughts ✨"
              className="w-full px-4 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20"
            />
          </div>

          {/* Aesthetic Badge */}
          <div>
            <label className="text-xs font-semibold text-[#6F5F57] uppercase tracking-wider block mb-1">
              Creator Badge
            </label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD5] text-xs text-[#2D2727]"
            >
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#E7DFD5] hover:bg-[#F2ECE4] text-[#6F5F57] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Personalization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
