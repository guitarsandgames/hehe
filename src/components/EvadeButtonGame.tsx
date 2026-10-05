import React, { useState, useRef, useEffect, useCallback } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { fireConfetti } from '../utils/confetti';
import {
  Trophy,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

interface StageConfig {
  stage: number;
  title: string;
  taunt: string;
  hint: string;
}

const STAGES: StageConfig[] = [
  { stage: 1, title: 'Warming Up', taunt: 'I am totally stationary. Promise.', hint: 'Click before it gets scared!' },
  { stage: 2, title: 'Flight Reflexes', taunt: 'Too slow, molasses fingers!', hint: 'Corner it against the wall.' },
  { stage: 3, title: 'Shadow Clones', taunt: 'Which one is the real HEHE?', hint: 'Only one clone is genuine.' },
  { stage: 4, title: 'Quantum Teleport', taunt: 'Blink and you miss me!', hint: 'Anticipate the teleport pattern.' },
  { stage: 5, title: 'Microscopic Hehe', taunt: 'You might need a microscope.', hint: 'Sniper precision required.' },
  { stage: 6, title: 'Invisibility Cloak', taunt: 'You can only see me from afar!', hint: 'Memorize my position then strike fast.' },
  { stage: 7, title: 'Trick Decoy Dialog', taunt: 'Are you 100% sure you want this?', hint: 'Don’t trust the fake buttons.' },
  { stage: 8, title: 'Orbit Trap', taunt: 'We dance in circles forever!', hint: 'Cut across its orbital radius.' },
  { stage: 9, title: 'Mach Speed Bounce', taunt: 'Zoom! Catch me if you can!', hint: 'Predict the bounce trajectory.' },
  { stage: 10, title: 'Final Boss: Giga-Hehe', taunt: 'MWAHAHA! I have 3 lives!', hint: 'Click 3 times to claim victory!' },
];

export const EvadeButtonGame: React.FC = () => {
  const [stage, setStage] = useState<number>(1);
  const [attempts, setAttempts] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [bossHealth, setBossHealth] = useState<number>(3);
  const [btnPos, setBtnPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [clones, setClones] = useState<{ id: number; x: number; y: number; isReal: boolean }[]>([]);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [dialogue, setDialogue] = useState<string>('Try clicking me! Hehehe...');
  const [isInvisible, setIsInvisible] = useState<boolean>(false);
  const [fakeModalOpen, setFakeModalOpen] = useState<boolean>(false);

  const arenaRef = useRef<HTMLDivElement | null>(null);

  // Random position generator within percentage bounds (10% to 85%)
  const getRandomPos = () => ({
    x: Math.floor(Math.random() * 75) + 12,
    y: Math.floor(Math.random() * 70) + 15,
  });

  // Setup stage specific mechanics
  const initStage = useCallback((stgNum: number) => {
    setBtnPos(getRandomPos());
    setIsInvisible(false);
    setFakeModalOpen(false);

    if (stgNum === 3) {
      // 4 clones
      const realIndex = Math.floor(Math.random() * 4);
      const newClones = [0, 1, 2, 3].map((i) => ({
        id: i,
        x: Math.floor(Math.random() * 70) + 15,
        y: Math.floor(Math.random() * 65) + 15,
        isReal: i === realIndex,
      }));
      setClones(newClones);
    } else if (stgNum === 7) {
      setFakeModalOpen(true);
    } else if (stgNum === 10) {
      setBossHealth(3);
    }

    const currentStageInfo = STAGES[stgNum - 1];
    if (currentStageInfo) {
      setDialogue(currentStageInfo.taunt);
    }
  }, []);

  useEffect(() => {
    initStage(stage);
  }, [stage, initStage]);

  // Mouse move handler for evasion
  const handleArenaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVictory) return;
    if (!arenaRef.current) return;

    const rect = arenaRef.current.getBoundingClientRect();
    const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
    const cursorY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = cursorX - btnPos.x;
    const dy = cursorY - btnPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Stage 6: Invisibility when cursor is close
    if (stage === 6) {
      setIsInvisible(dist < 18);
    }

    // Stage 2, 4, 8 evasion threshold
    const evasionDistance = stage === 2 ? 14 : stage === 4 ? 12 : stage === 8 ? 16 : 9;

    if (dist < evasionDistance && stage !== 1 && stage !== 7) {
      setAttempts((prev) => prev + 1);

      if (stage === 4) {
        // Quantum teleport
        setBtnPos(getRandomPos());
        audioEngine.play('squeak', 1.4);
      } else if (stage === 8) {
        // Orbit away
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        setBtnPos({
          x: Math.max(10, Math.min(85, cursorX + Math.cos(angle) * 22)),
          y: Math.max(10, Math.min(85, cursorY + Math.sin(angle) * 22)),
        });
      } else {
        // Push away vector
        const pushX = dx === 0 ? 1 : -dx / dist;
        const pushY = dy === 0 ? 1 : -dy / dist;
        setBtnPos((prev) => ({
          x: Math.max(8, Math.min(88, prev.x + pushX * 18)),
          y: Math.max(10, Math.min(85, prev.y + pushY * 18)),
        }));
        audioEngine.play('boing', 1.2);
      }

      const taunts = ['Hehe missed!', 'Almost got me!', 'Too slow!', 'Whoosh!', 'Nice reflexes... NOT!'];
      setDialogue(taunts[Math.floor(Math.random() * taunts.length)]);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 25, true);

    if (stage === 10) {
      if (bossHealth > 1) {
        setBossHealth((h) => h - 1);
        setHits((h) => h + 1);
        audioEngine.play('evil', 1.2, 1.2);
        setDialogue(`Ouch! Only ${bossHealth - 1} HP left! You won't defeat me!`);
        setBtnPos(getRandomPos());
        return;
      }
    }

    // Success on current stage!
    setHits((h) => h + 1);
    audioEngine.play('horn', 1.1);

    if (stage < 10) {
      setStage((s) => s + 1);
    } else {
      setIsVictory(true);
      setDialogue('NOOOO! You actually caught the Master Hehe!');
      fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 70, true);
    }
  };

  const handleCloneClick = (isReal: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReal) {
      handleButtonClick(e);
    } else {
      setAttempts((a) => a + 1);
      audioEngine.play('wheeze', 1.2);
      setDialogue('HA! That was a decoy clone! Hehehe!');
      // Shuffle clones
      setClones((prev) =>
        prev.map((c) => ({
          ...c,
          x: Math.floor(Math.random() * 70) + 15,
          y: Math.floor(Math.random() * 65) + 15,
        }))
      );
    }
  };

  const handleReset = () => {
    setStage(1);
    setAttempts(0);
    setHits(0);
    setIsVictory(false);
    initStage(1);
  };

  const currentStageConfig = STAGES[stage - 1] || STAGES[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header & Stats Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Arcade Challenge</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-semibold">Stage {stage} of 10</span>
          </div>
          <h2 className="text-xl font-bold font-display text-white mt-1">
            {currentStageConfig.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentStageConfig.hint}
          </p>
        </div>

        {/* Meters */}
        <div className="flex items-center gap-4 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 block uppercase">Dodges</span>
            <span className="font-mono text-base font-bold text-rose-400 tabular-nums">
              {attempts}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 block uppercase">Catches</span>
            <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
              {hits}
            </span>
          </div>
          {stage === 10 && (
            <>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 block uppercase">Boss HP</span>
                <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                  {bossHealth}/3
                </span>
              </div>
            </>
          )}
          <div className="h-6 w-px bg-slate-800" />
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Taunt Speech Bubble */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
        <span className="text-xl">😈</span>
        <span className="font-medium italic">"{dialogue}"</span>
      </div>

      {/* Main Interactive Playfield Arena */}
      <div
        ref={arenaRef}
        onMouseMove={handleArenaMouseMove}
        className="relative w-full h-[450px] bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800/80 overflow-hidden select-none cursor-crosshair shadow-inner"
        style={{
          backgroundImage:
            'radial-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Victory Screen */}
        {isVictory ? (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
            <h3 className="text-2xl font-bold font-display text-white">
              You Mastered The Hehe!
            </h3>
            <p className="text-sm text-slate-400 max-w-md mt-1">
              You outsmarted every evasive trick, clone illusion, and boss shield in {attempts} dodges!
            </p>
            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            {/* Clones mode for Stage 3 */}
            {stage === 3 ? (
              clones.map((clone) => (
                <button
                  key={clone.id}
                  onClick={(e) => handleCloneClick(clone.isReal, e)}
                  style={{
                    left: `${clone.x}%`,
                    top: `${clone.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg border border-amber-300 transition-transform active:scale-90 cursor-pointer whitespace-nowrap"
                >
                  Hehe?
                </button>
              ))
            ) : stage === 7 && fakeModalOpen ? (
              /* Stage 7: Fake Dialog trick */
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
                  <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
                  <h4 className="text-base font-semibold text-white">Security Prompt</h4>
                  <p className="text-xs text-slate-400">
                    Are you definitely sure you want to capture the elusive Hehe?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setAttempts((a) => a + 1);
                        audioEngine.play('wheeze', 1.0);
                        setDialogue('Haha! That button cancelled nothing!');
                      }}
                      className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                    >
                      No, Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        setFakeModalOpen(false);
                        handleButtonClick(e);
                      }}
                      className="px-4 py-2 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg cursor-pointer"
                    >
                      Yes, HEHE!
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard or Boss Button */
              <button
                onClick={handleButtonClick}
                style={{
                  left: `${btnPos.x}%`,
                  top: `${btnPos.y}%`,
                  opacity: isInvisible ? 0.05 : 1,
                  transform: `translate(-50%, -50%) ${
                    stage === 5 ? 'scale(0.55)' : stage === 10 ? 'scale(1.25)' : 'scale(1)'
                  }`,
                }}
                className={`absolute transition-all duration-150 rounded-xl font-bold flex items-center gap-1.5 shadow-xl cursor-pointer ${
                  stage === 10
                    ? 'px-6 py-3 bg-gradient-to-r from-red-600 to-purple-600 text-white border-2 border-red-400 animate-pulse'
                    : 'px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 border border-amber-300'
                } active:scale-95`}
              >
                {stage === 10 ? (
                  <>
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>GIGA HEHE</span>
                  </>
                ) : (
                  <>
                    <Target className="w-3.5 h-3.5" />
                    <span>Hehe!</span>
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Stage Progress Road */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
        {STAGES.map((s) => {
          const isDone = s.stage < stage || isVictory;
          const isCurrent = s.stage === stage && !isVictory;
          return (
            <div
              key={s.stage}
              className={`flex-1 min-w-[70px] text-center p-2 rounded-lg border text-xs transition-colors ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isCurrent
                  ? 'bg-amber-500/20 border-amber-400 text-white font-bold ring-1 ring-amber-400/50'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="font-mono text-[11px]">S{s.stage}</div>
              <div className="truncate text-[10px]">{s.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
