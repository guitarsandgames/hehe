import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { Play, Pause, RotateCcw, Shuffle, Sparkles, Sliders } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  soundId: string;
  icon: string;
  color: string;
  activeColor: string;
  pattern: boolean[];
}

const INITIAL_TRACKS: Track[] = [
  {
    id: 'he',
    name: 'He (Snicker)',
    soundId: 'snicker',
    icon: '🤭',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    activeColor: 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30',
    pattern: [true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false],
  },
  {
    id: 'ha',
    name: 'Ha (Chuckle)',
    soundId: 'chuckle',
    icon: '🧔',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    activeColor: 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30',
    pattern: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
  },
  {
    id: 'ho',
    name: 'Ho (Bass Boof)',
    soundId: 'boof',
    icon: '🔊',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    activeColor: 'bg-blue-400 text-slate-950 shadow-md shadow-blue-500/30',
    pattern: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
  },
  {
    id: 'snort',
    name: 'Snort (Wheeze)',
    soundId: 'wheeze',
    icon: '💨',
    color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    activeColor: 'bg-pink-400 text-slate-950 shadow-md shadow-pink-500/30',
    pattern: [false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false],
  },
];

export const BeatSequencerTab: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const tracksRef = useRef<Track[]>(tracks);
  tracksRef.current = tracks;

  // Sequencer playback loop
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(0);
      return;
    }

    const stepDurationMs = (60 / bpm / 4) * 1000; // 16th notes
    let step = 0;

    const interval = setInterval(() => {
      setCurrentStep(step);

      // Play sounds on this step
      tracksRef.current.forEach((track) => {
        if (track.pattern[step]) {
          audioEngine.play(track.soundId, 1.0, 1.2);
        }
      });

      step = (step + 1) % 16;
    }, stepDurationMs);

    return () => clearInterval(interval);
  }, [isPlaying, bpm]);

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    setTracks((prev) => {
      const updated = [...prev];
      const newPattern = [...updated[trackIndex].pattern];
      newPattern[stepIndex] = !newPattern[stepIndex];
      updated[trackIndex] = { ...updated[trackIndex], pattern: newPattern };
      return updated;
    });

    // Preview click sound
    if (!tracks[trackIndex].pattern[stepIndex]) {
      audioEngine.play(tracks[trackIndex].soundId, 1.0, 1.3);
    }
  };

  const handleClear = () => {
    setTracks((prev) =>
      prev.map((t) => ({ ...t, pattern: Array(16).fill(false) }))
    );
  };

  const handleRandomize = () => {
    setTracks((prev) =>
      prev.map((t) => ({
        ...t,
        pattern: Array(16)
          .fill(false)
          .map(() => Math.random() > 0.72),
      }))
    );
    audioEngine.play('boing', 1.2);
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'villain') {
      setBpm(105);
      setTracks([
        { ...INITIAL_TRACKS[0], pattern: [false, true, false, true, false, true, false, true, false, false, false, false, false, false, false, false] },
        { ...INITIAL_TRACKS[1], pattern: [false, false, false, false, false, false, false, false, true, false, true, false, true, false, true, false] },
        { ...INITIAL_TRACKS[2], pattern: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
        { ...INITIAL_TRACKS[3], pattern: [false, false, false, true, false, false, false, false, false, false, false, true, false, false, true, false] },
      ]);
    } else if (presetName === 'trap') {
      setBpm(140);
      setTracks([
        { ...INITIAL_TRACKS[0], pattern: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true] },
        { ...INITIAL_TRACKS[1], pattern: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
        { ...INITIAL_TRACKS[2], pattern: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false] },
        { ...INITIAL_TRACKS[3], pattern: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, true] },
      ]);
    } else {
      setBpm(120);
      setTracks(INITIAL_TRACKS);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Sequencer Header Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Hehe Beat Sequencer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            16-step rhythmic laugh drum machine · Sequence comical chuckles into groove
          </p>
        </div>

        {/* Master Transport Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-400 text-white'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                Pause Groove
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                Play Groove
              </>
            )}
          </button>

          {/* BPM Control */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400">Tempo:</span>
            <input
              type="range"
              min="70"
              max="175"
              step="1"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value, 10))}
              className="w-20 accent-amber-400 bg-slate-800 rounded cursor-pointer h-1.5"
            />
            <span className="font-mono text-xs text-amber-400 tabular-nums w-8">
              {bpm}
            </span>
          </div>

          <button
            onClick={handleRandomize}
            className="p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Randomize Beat"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Clear Pattern"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 mr-2">Presets:</span>
        <button
          onClick={() => loadPreset('default')}
          className="px-3 py-1 text-xs bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Groovy Chuckle
        </button>
        <button
          onClick={() => loadPreset('villain')}
          className="px-3 py-1 text-xs bg-slate-900 border border-slate-800 hover:border-purple-400/50 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Sinister March
        </button>
        <button
          onClick={() => loadPreset('trap')}
          className="px-3 py-1 text-xs bg-slate-900 border border-slate-800 hover:border-pink-400/50 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Hyper Hehe Trap
        </button>
      </div>

      {/* 16-Step Sequencer Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto shadow-2xl">
        <div className="min-w-[620px] space-y-4">
          {/* Step numbers indicator */}
          <div className="grid grid-cols-[140px_repeat(16,1fr)] gap-1.5 items-center">
            <span className="text-[11px] font-mono uppercase text-slate-500">Track</span>
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`text-center font-mono text-[10px] py-1 rounded transition-colors ${
                  isPlaying && currentStep === i
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : i % 4 === 0
                    ? 'text-slate-300 font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Rows */}
          {tracks.map((track, trackIdx) => (
            <div
              key={track.id}
              className="grid grid-cols-[140px_repeat(16,1fr)] gap-1.5 items-center"
            >
              {/* Track Info Badge */}
              <button
                onClick={() => audioEngine.play(track.soundId, 1.0, 1.2)}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors cursor-pointer group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">
                  {track.icon}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {track.name}
                </span>
              </button>

              {/* 16 Step Buttons */}
              {track.pattern.map((isActive, stepIdx) => {
                const isCurrent = isPlaying && currentStep === stepIdx;
                const isMeasureStart = stepIdx % 4 === 0;

                return (
                  <button
                    key={stepIdx}
                    onClick={() => toggleStep(trackIdx, stepIdx)}
                    className={`h-11 rounded-lg border transition-all duration-75 cursor-pointer relative ${
                      isActive
                        ? track.activeColor
                        : isMeasureStart
                        ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                    } ${
                      isCurrent
                        ? 'ring-2 ring-white scale-105 z-10'
                        : ''
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 absolute inset-0 m-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
