import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { fireConfetti } from '../utils/confetti';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Bomb,
  Compass,
  Plus
} from 'lucide-react';

interface PhysicsBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  emoji: string;
  color: string;
  pitch: number;
}

const EMOJIS = ['🤭', '😈', '😂', '🤪', '🥳', '😎', '👻', '🤠', '🤡', '🤖'];
const COLORS = [
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#FBBF24',
];

export const PhysicsToyTab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gravityMode, setGravityMode] = useState<'normal' | 'zero' | 'inverted' | 'attract'>('normal');
  const [bounciness, setBounciness] = useState<number>(0.85);
  const [ballCount, setBallCount] = useState<number>(14);

  const ballsRef = useRef<PhysicsBall[]>([]);
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: 0, y: 0, isDown: false });

  // Initialize starting balls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newBalls: PhysicsBall[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      newBalls.push({
        id: i,
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 200) + 50,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 8 + 20,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pitch: 0.8 + Math.random() * 0.8,
      });
    }
    ballsRef.current = newBalls;
    setBallCount(newBalls.length);
  }, []);

  // Main 60fps Physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updatePhysics = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let gY = 0.35;
      let gX = 0;

      if (gravityMode === 'zero') {
        gY = 0;
      } else if (gravityMode === 'inverted') {
        gY = -0.35;
      }

      const balls = ballsRef.current;

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        // Gravity or Attractor
        if (gravityMode === 'attract') {
          const dx = mouseRef.current.x - b.x;
          const dy = mouseRef.current.y - b.y;
          const dist = Math.max(20, Math.sqrt(dx * dx + dy * dy));
          b.vx += (dx / dist) * 0.6;
          b.vy += (dy / dist) * 0.6;
        } else {
          b.vy += gY;
          b.vx += gX;
        }

        // Air damping
        b.vx *= 0.992;
        b.vy *= 0.992;

        b.x += b.vx;
        b.y += b.vy;

        // Wall collisions
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = -b.vx * bounciness;
          if (Math.abs(b.vx) > 2) audioEngine.playPop(b.pitch);
        } else if (b.x + b.radius > canvas.width) {
          b.x = canvas.width - b.radius;
          b.vx = -b.vx * bounciness;
          if (Math.abs(b.vx) > 2) audioEngine.playPop(b.pitch);
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = -b.vy * bounciness;
          if (Math.abs(b.vy) > 2) audioEngine.playPop(b.pitch);
        } else if (b.y + b.radius > canvas.height) {
          b.y = canvas.height - b.radius;
          b.vy = -b.vy * bounciness;
          if (Math.abs(b.vy) > 2) audioEngine.playPop(b.pitch);
        }

        // Ball-to-ball collisions
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          const cdx = b2.x - b.x;
          const cdy = b2.y - b.y;
          const dist = Math.sqrt(cdx * cdx + cdy * cdy);
          const minDist = b.radius + b2.radius;

          if (dist < minDist && dist > 0) {
            // Overlap correction
            const overlap = minDist - dist;
            const nx = cdx / dist;
            const ny = cdy / dist;

            b.x -= nx * overlap * 0.5;
            b.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            // Elastic bounce
            const kx = b.vx - b2.vx;
            const ky = b.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;

            b.vx -= p * nx * bounciness;
            b.vy -= p * ny * bounciness;
            b2.vx += p * nx * bounciness;
            b2.vy += p * ny * bounciness;

            if (Math.abs(p) > 2) {
              audioEngine.playPop(b.pitch);
            }
          }
        }

        // Render Ball
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color + '22';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = b.color;
        ctx.stroke();

        // Render Emoji in center
        ctx.font = `${Math.floor(b.radius * 1.1)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.emoji, b.x, b.y + 1);
        ctx.restore();
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => cancelAnimationFrame(animId);
  }, [gravityMode, bounciness]);

  // Click to spawn ball or launch
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const newBall: PhysicsBall = {
      id: Date.now(),
      x,
      y,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 4,
      radius: Math.random() * 8 + 20,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pitch: 0.8 + Math.random() * 0.8,
    };

    ballsRef.current.push(newBall);
    setBallCount(ballsRef.current.length);
    audioEngine.play('boing', 1.3);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    mouseRef.current.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  };

  const handleExplosion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ballsRef.current.forEach((b) => {
      const dx = b.x - centerX;
      const dy = b.y - centerY;
      const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy));
      b.vx = (dx / dist) * 22;
      b.vy = (dy / dist) * 22;
    });

    audioEngine.play('boof', 1.2);
    fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 40, true);
  };

  const handleSpawnBatch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < 10; i++) {
      ballsRef.current.push({
        id: Date.now() + i,
        x: Math.random() * (canvas.width - 100) + 50,
        y: 40 + Math.random() * 40,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 6,
        radius: Math.random() * 8 + 18,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pitch: 0.8 + Math.random() * 0.8,
      });
    }
    setBallCount(ballsRef.current.length);
    audioEngine.play('squeak', 1.4);
  };

  const handleClear = () => {
    ballsRef.current = [];
    setBallCount(0);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Sandbox Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Hehe Physics Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click inside canvas to drop bouncy Hehe emojis · Each bounce plays a harmonized pop
          </p>
        </div>

        {/* Gravity Modes */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {(
            [
              { id: 'normal', label: 'Earth (Down)' },
              { id: 'zero', label: 'Zero-G (Float)' },
              { id: 'inverted', label: 'Inverted (Up)' },
              { id: 'attract', label: 'Vortex (Mouse)' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setGravityMode(m.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                gravityMode === m.id
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Playfield */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="w-full h-[450px] cursor-pointer block select-none"
        />

        {/* Floating Controls HUD at bottom */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Balls:</span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">
              {ballCount}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleSpawnBatch}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Drop 10 More
            </button>

            <button
              onClick={handleExplosion}
              className="px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Bomb className="w-3.5 h-3.5" />
              TNT Blast
            </button>

            <button
              onClick={handleClear}
              className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
              title="Clear Canvas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
