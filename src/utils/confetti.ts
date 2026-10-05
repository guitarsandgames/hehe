/**
 * High-performance canvas confetti & emoji blaster
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  emoji?: string;
}

export function fireConfetti(
  x: number = window.innerWidth / 2,
  y: number = window.innerHeight / 2,
  count: number = 40,
  includeHehe: boolean = true
) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24', '#06B6D4'];
  const emojis = ['😂', '🤭', '😈', '🤣', '🤪', '✨', '🎉', 'Hehe!'];

  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    const isEmoji = includeHehe && Math.random() > 0.45;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 6 + 2),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: isEmoji ? Math.random() * 8 + 16 : Math.random() * 6 + 6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: Math.random() * 40 + 60,
      emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
    });
  }

  let animId: number;

  const animate = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let allDead = true;

    for (const p of particles) {
      p.life++;
      if (p.life < p.maxLife) {
        allDead = false;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // Gravity
        p.vx *= 0.98; // Drag
        p.rotation += p.vRot;

        const progress = p.life / p.maxLife;
        const opacity = Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = opacity;

        if (p.emoji) {
          ctx.font = `${p.size}px 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        }

        ctx.restore();
      }
    }

    if (allDead) {
      cancelAnimationFrame(animId);
      canvas.remove();
    } else {
      animId = requestAnimationFrame(animate);
    }
  };

  animId = requestAnimationFrame(animate);
}
