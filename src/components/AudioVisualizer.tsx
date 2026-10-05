import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface Props {
  className?: string;
  activeColor?: string;
}

export const AudioVisualizer: React.FC<Props> = ({
  className = 'h-14 w-full',
  activeColor = '#F59E0B'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const analyser = audioEngine.getAnalyser();
    const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      }

      // Check if there is audio activity
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const isPlaying = sum > 10;

      const barCount = 36;
      const barWidth = (width / barCount) - 3;
      const step = Math.floor(dataArray.length / barCount) || 1;

      for (let i = 0; i < barCount; i++) {
        const val = isPlaying ? (dataArray[i * step] || 0) : Math.sin(Date.now() * 0.003 + i * 0.25) * 8 + 10;
        const normalized = val / 255;
        const barHeight = Math.max(3, normalized * (height - 6));
        const x = i * (barWidth + 3);
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          grad.addColorStop(0, '#F59E0B');
          grad.addColorStop(1, '#EF4444');
        } else {
          grad.addColorStop(0, 'rgba(100, 116, 139, 0.3)');
          grad.addColorStop(1, 'rgba(71, 85, 105, 0.2)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Rounded caps
        const r = Math.min(barWidth / 2, barHeight / 2);
        ctx.roundRect(x, y, barWidth, barHeight, r);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeColor]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={56}
      className={`rounded-lg bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm ${className}`}
    />
  );
};
