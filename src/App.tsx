/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { SoundboardTab } from './components/SoundboardTab';
import { EvadeButtonGame } from './components/EvadeButtonGame';
import { BeatSequencerTab } from './components/BeatSequencerTab';
import { PhysicsToyTab } from './components/PhysicsToyTab';
import { MischiefPunBoxTab } from './components/MischiefPunBoxTab';
import { audioEngine } from './utils/audioEngine';
import { fireConfetti } from './utils/confetti';
import { Music, MousePointerClick, Activity, Smile, Grid } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('soundboard');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [easterEggActive, setEasterEggActive] = useState<boolean>(false);

  // Konami Code listener (↑ ↑ ↓ ↓ ← → ← → B A)
  useEffect(() => {
    const konamiSequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === konamiSequence[konamiIndex].toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          konamiIndex = 0;
          setEasterEggActive(true);
          fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 100, true);
          audioEngine.play('horn', 1.0);
          audioEngine.play('evil', 1.4, 1.6);
          setTimeout(() => setEasterEggActive(false), 5000);
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${easterEggActive ? 'ring-4 ring-amber-400' : ''}`}>
      {/* Top Bar with 3-Zone contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-b border-slate-800 px-2 py-2 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('soundboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'soundboard' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Soundboard
        </button>
        <button
          onClick={() => setActiveTab('evade')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'evade' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          Evade Game
        </button>
        <button
          onClick={() => setActiveTab('sequencer')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'sequencer' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          Sequencer
        </button>
        <button
          onClick={() => setActiveTab('physics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'physics' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Physics
        </button>
        <button
          onClick={() => setActiveTab('puns')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'puns' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          Jokes
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {easterEggActive && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-slate-950 font-black text-center text-sm tracking-wide animate-pulse">
            🎉 SECRET HYPER-HEHE MODE ACTIVATED! (KONAMI CHEAT UNLOCKED) 🎉
          </div>
        )}

        {activeTab === 'soundboard' && <SoundboardTab />}
        {activeTab === 'evade' && <EvadeButtonGame />}
        {activeTab === 'sequencer' && <BeatSequencerTab />}
        {activeTab === 'physics' && <PhysicsToyTab />}
        {activeTab === 'puns' && <MischiefPunBoxTab />}
      </main>

      {/* Footer conforming strictly to zero-pill, zero-slop guidelines */}
      <footer className="border-t border-slate-850 bg-slate-950 px-6 py-8 text-center text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-semibold text-slate-300">Hehe Arcade</span>
          <span aria-hidden="true">·</span>
          <span>Web Audio Harmonic Synthesizer</span>
          <span aria-hidden="true">·</span>
          <span>100% Client-Side Physics & Sound</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-400 font-mono">Tip: Press 1-9 on soundboard</span>
        </div>
      </footer>
    </div>
  );
}
