import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { fireConfetti } from '../utils/confetti';
import {
  Sparkles,
  Zap,
  Flame,
  Atom,
  RotateCcw,
  Infinity as InfinityIcon,
  Orbit,
  Radio,
  Rocket
} from 'lucide-react';

interface Generator {
  id: string;
  name: string;
  icon: string;
  baseCostExp: number; // Cost in 10^x
  gainExp: number; // Gain per second in 10^x
  count: number;
  description: string;
}

const INITIAL_GENERATORS: Generator[] = [
  {
    id: 'subatomic',
    name: 'Subatomic Snickers',
    icon: '🔬',
    baseCostExp: 1,
    gainExp: 1,
    count: 0,
    description: 'Quantum chuckles vibrating in the Planck scale',
  },
  {
    id: 'dyson',
    name: 'Giggle Dyson Swarm',
    icon: '☀️',
    baseCostExp: 4,
    gainExp: 3,
    count: 0,
    description: 'Harvesting stellar solar flares of pure laughter',
  },
  {
    id: 'blackhole',
    name: 'Supermassive Chuckle Hole',
    icon: '🌀',
    baseCostExp: 12,
    gainExp: 10,
    count: 0,
    description: 'Event horizon where no one can resist smiling',
  },
  {
    id: 'multiverse',
    name: 'Multiverse Mischief Loom',
    icon: '🌌',
    baseCostExp: 50,
    gainExp: 45,
    count: 0,
    description: 'Entangling infinite parallel universes in a single HEHE',
  },
  {
    id: 'singularity',
    name: 'HEHE^100,000 Singularity Core',
    icon: '💥',
    baseCostExp: 1000,
    gainExp: 2500,
    count: 0,
    description: 'The mathematical absolute boundary of cosmic humor',
  },
];

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

export const CosmicSingularityTab: React.FC<{
  cosmicMode: boolean;
  setCosmicMode: (v: boolean) => void;
}> = ({ cosmicMode, setCosmicMode }) => {
  // Current exponent: 10^exponent
  const [exponent, setExponent] = useState<number>(0);
  const [coefficient, setCoefficient] = useState<number>(1.0);
  const [generators, setGenerators] = useState<Generator[]>(INITIAL_GENERATORS);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [clickCount, setClickCount] = useState<number>(0);
  const [hasReachedSingularity, setHasReachedSingularity] = useState<boolean>(false);

  const coreRef = useRef<HTMLDivElement | null>(null);

  // Auto-generation tick
  useEffect(() => {
    const timer = setInterval(() => {
      let addExp = 0;
      generators.forEach((g) => {
        if (g.count > 0) {
          addExp += g.gainExp * g.count;
        }
      });

      if (addExp > 0) {
        setExponent((prev) => {
          const next = prev + addExp * 0.1;
          if (next >= 100000 && !hasReachedSingularity) {
            setHasReachedSingularity(true);
            fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 80, true);
            audioEngine.playCosmicSingularity(1.0);
          }
          return Math.min(100000, next);
        });
      }
    }, 100);

    return () => clearInterval(timer);
  }, [generators, hasReachedSingularity]);

  // Handle core click
  const handleCoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Click increment scales with power
    const clickBoostExp = Math.max(1, Math.floor(exponent * 0.05) + 1);
    setExponent((prev) => {
      const next = prev + clickBoostExp;
      if (next >= 100000 && !hasReachedSingularity) {
        setHasReachedSingularity(true);
        fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 80, true);
        audioEngine.playCosmicSingularity(1.0);
      }
      return Math.min(100000, next);
    });

    setClickCount((c) => c + 1);
    audioEngine.play('cosmic', 0.9 + Math.random() * 0.3);

    // Floating multiplier effect
    const newFloat: FloatingText = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY,
      text: `+(HEHE)¹⁰^${clickBoostExp}`,
    };
    setFloatingTexts((prev) => [...prev.slice(-6), newFloat]);

    if (Math.random() > 0.4) {
      fireConfetti(e.clientX, e.clientY, 12, false);
    }
  };

  // Buy generator
  const buyGenerator = (genId: string) => {
    const gen = generators.find((g) => g.id === genId);
    if (!gen) return;

    const currentCost = gen.baseCostExp * Math.pow(1.35, gen.count);

    if (exponent >= currentCost) {
      setExponent((prev) => prev - currentCost);
      setGenerators((prev) =>
        prev.map((g) => (g.id === genId ? { ...g, count: g.count + 1 } : g))
      );
      audioEngine.play('horn', 1.2 + gen.count * 0.05);
      fireConfetti(window.innerWidth / 2, window.innerHeight * 0.6, 16, false);
    } else {
      audioEngine.play('wheeze', 1.2);
    }
  };

  // Cosmic Big Bang / Singularity Collapse
  const handleCosmicTranscendence = () => {
    setExponent(100000);
    setHasReachedSingularity(true);
    setCosmicMode(true);
    audioEngine.setCosmicOverdrive(true);
    audioEngine.playCosmicSingularity(0.85);
    fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 120, true);
  };

  const handleReset = () => {
    setExponent(0);
    setCoefficient(1.0);
    setGenerators(INITIAL_GENERATORS);
    setHasReachedSingularity(false);
  };

  const progressPct = Math.min(100, (exponent / 100000) * 100);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Cosmic Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950 border border-purple-800/40 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        {/* Background glow orb */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
              <Atom className="w-4 h-4 animate-spin" />
              <span>Quantum Singularity Chamber</span>
              <span aria-hidden="true">·</span>
              <span>(HEHE)¹⁰⁰⁰⁰⁰ Overdrive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-3">
              Cosmic HEHE Singularity
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Tap the Singularity Core to accelerate laughing energy across dimensions, construct Dyson Swarms, and unlock <strong>(HEHE)¹⁰⁰⁰⁰⁰</strong>!
            </p>
          </div>

          {/* Global Cosmic Overdrive Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                const next = !cosmicMode;
                setCosmicMode(next);
                audioEngine.setCosmicOverdrive(next);
                if (next) {
                  audioEngine.playCosmicSingularity(1.1);
                  fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 50, true);
                } else {
                  audioEngine.playBlip(1.0);
                }
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                cosmicMode
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-lg shadow-purple-500/30 animate-pulse'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-purple-300 border-purple-900/60'
              }`}
            >
              <Orbit className="w-4 h-4" />
              {cosmicMode ? 'Cosmic Overdrive: ACTIVE' : 'Engage 100,000x Overdrive'}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Reset Singularity"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Quantum Energy Metric */}
        <div className="mt-8 pt-6 border-t border-purple-900/40 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="text-xs text-purple-300 font-medium mb-1">
              CURRENT LAUGHTER POWER:
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-300 tracking-tight">
              {exponent >= 100000 ? (
                <span>(HEHE)¹⁰⁰⁰⁰⁰ [INFINITE SINGULARITY]</span>
              ) : exponent >= 1 ? (
                <span>
                  10
                  <sup className="text-xl sm:text-2xl text-amber-400">
                    {Math.floor(exponent).toLocaleString()}
                  </sup>{' '}
                  <span className="text-sm text-slate-400 font-sans font-normal">HEHEs</span>
                </span>
              ) : (
                <span>
                  {(1 + exponent * 9).toFixed(1)}{' '}
                  <span className="text-sm text-slate-400 font-sans font-normal">HEHEs</span>
                </span>
              )}
            </div>

            {/* Progress bar towards 100,000 */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Progress to Singularity</span>
                <span>{progressPct.toFixed(2)}% (10^{Math.floor(exponent)} / 10^100,000)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full border border-purple-900/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(1, progressPct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Transcendence Button */}
          <div className="flex flex-col items-center md:items-end justify-center">
            {exponent < 100000 ? (
              <button
                onClick={handleCosmicTranscendence}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                Hyper-Warp to 100,000x Now
              </button>
            ) : (
              <div className="text-center md:text-right">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
                  <InfinityIcon className="w-3.5 h-3.5" />
                  GOD OF HEHE UNLOCKED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Singularity Interactive Core */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Pulsing Core */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative min-h-[380px]">
          <div className="text-xs text-slate-400 mb-6 text-center font-medium">
            TAP THE CORE TO ACCELERATE EXPONENTS
          </div>

          <div
            ref={coreRef}
            onClick={handleCoreClick}
            className="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-full cursor-pointer flex items-center justify-center select-none transition-transform active:scale-90"
          >
            {/* Pulsing aura rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 opacity-40 blur-xl group-hover:opacity-75 animate-pulse transition-opacity" />
            <div className="absolute -inset-4 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: '14s' }} />
            <div className="absolute -inset-8 rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '22s', animationDirection: 'reverse' }} />

            {/* Core Body */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-900 via-slate-950 to-amber-900 border-2 border-purple-400/80 flex flex-col items-center justify-center shadow-2xl overflow-hidden group-hover:border-amber-300">
              <span className="text-5xl sm:text-6xl transition-transform group-hover:scale-125 duration-150">
                😈
              </span>
              <span className="font-display font-black text-sm text-amber-300 mt-1 tracking-wider">
                HEHE¹⁰⁰⁰⁰⁰
              </span>
            </div>

            {/* Floating text particles on click */}
            {floatingTexts.map((f) => (
              <span
                key={f.id}
                style={{ left: f.x, top: f.y }}
                className="absolute pointer-events-none text-xs font-bold font-mono text-amber-300 animate-bounce transition-all opacity-90 whitespace-nowrap"
              >
                {f.text}
              </span>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            Total Core Clicks:{' '}
            <strong className="text-white font-mono">{clickCount}</strong>
          </div>
        </div>

        {/* Right: Quantum Generators & Upgrades */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-amber-400" />
              Cosmic Laugh Generators
            </h3>
            <span className="text-xs text-slate-400">
              Exponent Boosters
            </span>
          </div>

          {generators.map((gen) => {
            const currentCost = gen.baseCostExp * Math.pow(1.35, gen.count);
            const canAfford = exponent >= currentCost;

            return (
              <div
                key={gen.id}
                className={`p-4 rounded-2xl border transition-all ${
                  canAfford
                    ? 'bg-slate-900/90 border-purple-500/30 hover:border-purple-400/60 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    {gen.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-white">{gen.name}</h4>
                      {gen.count > 0 && (
                        <span className="text-xs font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                          x{gen.count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{gen.description}</p>
                    <div className="text-[11px] font-mono text-purple-300 mt-1">
                      Outputs: +10^{gen.gainExp} per sec
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => buyGenerator(gen.id)}
                  disabled={!canAfford}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    canAfford
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Construct (Cost: 10^{Math.floor(currentCost)})
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
