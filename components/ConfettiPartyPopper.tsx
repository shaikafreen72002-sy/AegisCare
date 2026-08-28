'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiPartyPopperProps {
  active: boolean;
  onComplete?: () => void;
  durationMs?: number;
}

export const ConfettiPartyPopper: React.FC<ConfettiPartyPopperProps> = ({
  active,
  onComplete,
  durationMs = 4000
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#2F80ED', '#16A34A', '#F59E0B', '#DC2626', '#EC4899', '#8B5CF6', '#10B981', '#FBBF24'];
    const emojis = ['🎉', '🎊', '✨', '🌟', '🌱', '💖', '🎈', '🏆'];

    const particleCount = 120;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      emoji?: string;
      type: 'rect' | 'circle' | 'emoji';
    }[] = [];

    // Spawn burst from left and right corners
    for (let i = 0; i < particleCount; i++) {
      const isLeft = i % 2 === 0;
      const startX = isLeft ? window.innerWidth * 0.2 : window.innerWidth * 0.8;
      const startY = window.innerHeight * 0.6;
      const angle = isLeft ? (Math.random() * Math.PI * 0.4 - Math.PI * 0.5) : (-Math.random() * Math.PI * 0.4 - Math.PI * 0.5);
      const speed = Math.random() * 16 + 10;

      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed + (isLeft ? 3 : -3),
        vy: Math.sin(angle) * speed - 6,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        emoji: Math.random() > 0.6 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        type: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    let animationId: number;
    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // Gravity
        p.vx *= 0.98; // Air drag
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.emoji) {
          ctx.font = `${p.size * 1.8}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(p.emoji, 0, 0);
        } else if (p.type === 'rect') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (elapsed < durationMs) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [active, durationMs, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-60"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
