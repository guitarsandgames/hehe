import React, { useState, useEffect } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { fireConfetti } from '../utils/confetti';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Volume2,
  Sparkles,
  Zap,
  RotateCcw,
  Sliders,
  Flame,
  Radio
} from 'lucide-react';

interface SoundPad {
  id: string;
  name: string;
  sub: string;
  key: string;
  color: string;
  border: string;
  icon: string;
}

const PADS: SoundPad[] = [
  { id: 'snicker', name: 'Snicker', sub: 'Subtle & sly', key: '1', color: 'from-amber-500/20 to-amber-600/10 hover:border-amber-400', border: 'border-amber-500/30', icon: '🤭' },
  { id: 'evil', name: 'Villain', sub: 'Mwahahaha', key: '2', color: 'from-purple-600/20 to-red-600/10 hover:border-purple-400', border: 'border-purple-500/30', icon: '😈' },
  { id: 'tehehe', name: 'Tehehe', sub: 'Playful giggles', key: '3', color: 'from-pink-500/20 to-rose-500/10 hover:border-pink-400', border: 'border-pink-500/30', icon: '✨' },
  { id: 'chipmunk', name: 'Chipmunk', sub: 'High octave sprint', key: '4', color: 'from-yellow-400/20 to-orange-500/10 hover:border-yellow-400', border: 'border-yellow-500/30', icon: '🐿️' },
  { id: 'chuckle', name: 'Dad Chuckle', sub: 'Hearty & warm', key: '5', color: 'from-emerald-500/20 to-teal-600/10 hover:border-emerald-400', border: 'border-emerald-500/30', icon: '🧔' },
  { id: 'boof', name: 'Bass Boof', sub: '808 sub rumble', key: '6', color: 'from-blue-600/20 to-indigo-600/10 hover:border-blue-400', border: 'border-blue-500/30', icon: '🔊' },
  { id: 'robot', name: 'Cyborg 01', sub: 'Stepped bit laugh', key: '7', color: 'from-cyan-500/20 to-blue-500/10 hover:border-cyan-400', border: 'border-cyan-500/30', icon: '🤖' },
  { id: 'wheeze', name: 'Wheeze Snort', sub: 'Pure breathlessness', key: '8', color: 'from-orange-500/20 to-red-500/10 hover:border-orange-400', border: 'border-orange-500/30', icon: '💨' },
  { id: 'boing', name: 'Spring Boing', sub: 'Elastic bounce', key: '9', color: 'from-lime-500/20 to-emerald-500/10 hover:border-lime-400', border: 'border-lime-500/30', icon: '🌀' },
  { id: 'squeak', name: 'Toy Squeak', sub: 'Rubber ducky', key: 'Q', color: 'from-amber-400/20 to-yellow-500/10 hover:border-amber-300', border: 'border-amber-400/30', icon: '🐥' },
  { id: 'rimshot', name: 'Ba-Dum Tss', sub: 'Classic punchline', key: 'W', color: 'from-rose-500/20 to-purple-600/10 hover:border-rose-400', border: 'border-rose-500/30', icon: '🥁' },
  { id: 'horn', name: 'Fanfare', sub: 'Victory horn', key: 'E', color: 'from-violet-500/20 to-fuchsia-600/10 hover:border-violet-400', border: 'border-violet-500/30', icon: '🎺' },
];

export const SoundboardTab: React.FC = () => {
  const [pitch, setPitch] = useState<number>(1.0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [activePad, setActivePad] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('hehehe that was so unexpected');
  const [voiceTone, setVoiceTone] = useState<'chipmunk' | 'troll' | 'robot' | 'fast'>('chipmunk');
  const [spamCount, setSpamCount] = useState<number>(0);

  const handlePlay = (id: string, e?: React.MouseEvent) => {
    setActivePad(id);
    audioEngine.play(id, pitch, speed);
    setSpamCount((prev) => prev + 1);

    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (Math.random() > 0.6) {
        fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 8, false);
      }
    }

    setTimeout(() => {
      setActivePad((curr) => (curr === id ? null : curr));
    }, 220);
  };

  const handleSpamFrenzy = () => {
    let count = 0;
    const interval = setInterval(() => {
      const randomPad = PADS[Math.floor(Math.random() * PADS.length)];
      const randomPitch = 0.6 + Math.random() * 1.2;
      audioEngine.play(randomPad.id, randomPitch, 1.4);
      count++;
      setSpamCount((prev) => prev + 1);
      if (count > 12) {
        clearInterval(interval);
        fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 45, true);
      }
    }, 90);
  };

  const handleSpeak = () => {
    let rate = 1.2;
    let voicePitch = 1.4;
    if (voiceTone === 'chipmunk') {
      rate = 1.7;
      voicePitch = 1.9;
    } else if (voiceTone === 'troll') {
      rate = 0.7;
      voicePitch = 0.4;
    } else if (voiceTone === 'robot') {
      rate = 1.1;
      voicePitch = 1.0;
    } else if (voiceTone === 'fast') {
      rate = 2.2;
      voicePitch = 1.2;
    }
    audioEngine.speakHehe(customText, rate, voicePitch);
    fireConfetti(window.innerWidth / 2, window.innerHeight * 0.7, 15, true);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();
      const pad = PADS.find((p) => p.key === key);
      if (pad) {
        e.preventDefault();
        handlePlay(pad.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pitch, speed]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Monitor & Visualizer Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Procedural Laugh Synthesizer
            </h2>
            <p className="text-xs text-slate-400">
              Pure harmonic formant oscillators · Press keyboard keys (1–9, Q, W, E) to trigger
            </p>
          </div>

          <div className="w-full md:w-80">
            <AudioVisualizer className="h-12 w-full" />
          </div>
        </div>

        {/* Live Pitch & Speed Controls */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pitch Modulation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Pitch Warp
              </span>
              <span className="font-mono text-amber-400 tabular-nums">
                {pitch.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.2"
              step="0.05"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Deep Ogre (0.4x)</span>
              <span>Natural (1.0x)</span>
              <span>Ultra Squeak (2.2x)</span>
            </div>
          </div>

          {/* Speed / Tempo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                Tempo Cadence
              </span>
              <span className="font-mono text-orange-400 tabular-nums">
                {speed.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-orange-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Slow Motion (0.5x)</span>
              <span>Default (1.0x)</span>
              <span>Hyper Laugh (2.0x)</span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPitch(1.0);
                setSpeed(1.0);
                audioEngine.playBlip(1.0);
              }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Knobs
            </button>

            <span className="text-xs text-slate-500">
              Triggered:{' '}
              <strong className="text-slate-300 font-mono tabular-nums">
                {spamCount}
              </strong>
            </span>
          </div>

          <button
            onClick={handleSpamFrenzy}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-lg shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            Spam Frenzy Blast
          </button>
        </div>
      </div>

      {/* 12 Sound Pads Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {PADS.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              onClick={(e) => handlePlay(pad.id, e)}
              className={`group relative p-4 rounded-xl text-left transition-all duration-150 border bg-gradient-to-br ${pad.color} ${pad.border} ${
                isActive
                  ? 'scale-[0.96] ring-2 ring-amber-400 shadow-lg shadow-amber-500/20'
                  : 'hover:shadow-md hover:-translate-y-0.5'
              } flex flex-col justify-between h-32 cursor-pointer overflow-hidden`}
            >
              {/* Top Row: Icon + Key Badge */}
              <div className="flex items-start justify-between">
                <span className="text-2xl transition-transform group-hover:scale-110">
                  {pad.icon}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-900/80 border border-slate-700/80 text-slate-300 rounded shadow-sm">
                  {pad.key}
                </span>
              </div>

              {/* Bottom Row: Name + Subtext */}
              <div>
                <h3 className="font-semibold text-sm text-white group-hover:text-amber-200 transition-colors">
                  {pad.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{pad.sub}</p>
              </div>

              {/* Highlight pulse */}
              {isActive && (
                <span className="absolute inset-0 bg-white/10 rounded-xl pointer-events-none animate-ping opacity-25" />
              )}
            </button>
          );
        })}
      </div>

      {/* Voice Talker Box */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Custom "Hehe" Vocalizer
            </h3>
            <p className="text-xs text-slate-400">
              Type any sentence and modulate it with speech synthesis algorithms
            </p>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {(
              [
                { id: 'chipmunk', label: 'Chipmunk' },
                { id: 'troll', label: 'Deep Troll' },
                { id: 'robot', label: 'Robotic' },
                { id: 'fast', label: 'Hyper 2x' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setVoiceTone(mode.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  voiceTone === mode.id
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type your mischievous sentence here..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            onClick={handleSpeak}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            Speak Sentence
          </button>
        </div>
      </div>
    </div>
  );
};
