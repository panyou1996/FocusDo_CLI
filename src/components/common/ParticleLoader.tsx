
'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ParticleLoaderProps {
  className?: string;
  particleCount?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const COLOR_PALETTE = ['#FFFFFF', '#FFD1D1', '#C4F1F9', '#D9D2E9', '#FFECB3'];

export function ParticleLoader({
  className,
  particleCount = 700,
}: ParticleLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const particles = useRef<Particle[]>([]);
  const targets = useRef<{x: number; y: number}[]>([]);
  const mouse = useRef<{x: number; y: number; radius: number}>({ x: -100, y: -100, radius: 75 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // --- Define Target Shape (Abstract Face) ---
    targets.current = [];
    const headRadius = Math.min(width, height) * 0.3;
    const centerX = width / 2;
    const centerY = height / 2;

    // Head circle
    for (let i = 0; i < 150; i++) {
        const angle = (i / 150) * Math.PI * 2;
        targets.current.push({
            x: centerX + Math.cos(angle) * headRadius,
            y: centerY + Math.sin(angle) * headRadius,
        });
    }

    // --- Initialize Particles ---
    particles.current = [];
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random() * 10,
        color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, i) => {
        let target = targets.current[i % targets.current.length];
        
        let tx = target.x;
        let ty = target.y;

        const dx = tx - p.x;
        const dy = ty - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const attractionForce = 0.025; 
        const maxVelocity = 2.5;

        if (dist > 1) {
            p.vx += (dx / dist) * attractionForce;
            p.vy += (dy / dist) * attractionForce;
        }

        const mdx = p.x - mouse.current.x;
        const mdy = p.y - mouse.current.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.current.radius) {
            const repulsionForce = (1 - mdist / mouse.current.radius) * 2;
            p.vx += (mdx / mdist) * repulsionForce;
            p.vy += (mdy / mdist) * repulsionForce;
        }

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxVelocity) {
            p.vx = (p.vx / speed) * maxVelocity;
            p.vy = (p.vy / speed) * maxVelocity;
        }

        p.x += p.vx;
        p.y += p.vy;

        // --- Drawing ---
        // Halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '33'; // Add alpha for halo
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.75, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
        mouse.current.x = -100;
        mouse.current.y = -100;
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount]);

  return <canvas ref={canvasRef} className={cn('w-full h-full', className)} />;
}
