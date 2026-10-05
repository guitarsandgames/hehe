import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { fireConfetti } from '../utils/confetti';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const TopBar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
}) => {
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
    if (!nextMute) {
      audioEngine.playBlip(1.2);
    }
  };

  const triggerParty = () => {
    fireConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 60, true);
    audioEngine.play('horn', 1.0);
    audioEngine.play('evil', 1.3, 1.4);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => {
          setActiveTab('soundboard');
          audioEngine.play('snicker', 1.2);
        }}
        className="text-lg font-extrabold tracking-tight font-display text-white hover:text-amber-400 transition-colors cursor-pointer select-none"
      >
        HEHE ARCADE
      </button>

      {/* Zone 2: 4–6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('soundboard')}
          className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'soundboard' ? 'text-amber-400 font-bold underline underline-offset-8 decoration-2' : ''
          }`}
        >
          Soundboard
        </button>
        <button
          onClick={() => setActiveTab('evade')}
          className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'evade' ? 'text-amber-400 font-bold underline underline-offset-8 decoration-2' : ''
          }`}
        >
          Evade Game
        </button>
        <button
          onClick={() => setActiveTab('sequencer')}
          className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'sequencer' ? 'text-amber-400 font-bold underline underline-offset-8 decoration-2' : ''
          }`}
        >
          Beat Sequencer
        </button>
        <button
          onClick={() => setActiveTab('physics')}
          className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'physics' ? 'text-amber-400 font-bold underline underline-offset-8 decoration-2' : ''
          }`}
        >
          Physics Toy
        </button>
        <button
          onClick={() => setActiveTab('puns')}
          className={`hover:text-white transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'puns' ? 'text-amber-400 font-bold underline underline-offset-8 decoration-2' : ''
          }`}
        >
          Mischief Deck
        </button>
      </nav>

      {/* Zone 3: 1–2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMute}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={triggerParty}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          Party Blast
        </button>
      </div>
    </header>
  );
};
