
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
  targetX?: number;
  targetY?: number;
}

export function ParticleLoader({
  className,
  particleCount = 500,
}: ParticleLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const particles = useRef<Particle[]>([]);
  const targets = useRef<{x: number; y: number}[]>([]);
  const mouse = useRef<{x: number; y: number; radius: number}>({ x: -100, y: -100, radius: 75 });
  const iteration = useRef(0);

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

    // Dynamically get the primary color from CSS variables
    const primaryColor = getComputedStyle(canvas).getPropertyValue('--primary').trim();
    const particleColor = `hsl(${primaryColor})`;

    // --- Define Target Shape (Abstract Face) ---
    targets.current = [];
    const headRadius = Math.min(width, height) * 0.2;
    const centerX = width / 2;
    const centerY = height / 2 - headRadius * 0.1;

    // Head circle
    for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        targets.current.push({
            x: centerX + Math.cos(angle) * headRadius,
            y: centerY + Math.sin(angle) * headRadius,
        });
    }

    // Neck/shoulders
    const shoulderWidth = headRadius * 1.8;
    const shoulderY = centerY + headRadius;
    for (let i = 0; i < 50; i++) {
        const x = centerX - shoulderWidth / 2 + (i / 49) * shoulderWidth;
        const y = shoulderY + Math.sin((i / 49) * Math.PI) * 20;
        targets.current.push({ x, y });
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
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      iteration.current++;

      particles.current.forEach((p, i) => {
        // --- Attraction/Repulsion ---
        let target = targets.current[i % targets.current.length];
        
        let tx = target.x;
        let ty = target.y;

        const dx = tx - p.x;
        const dy = ty - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const attractionForce = 0.02; 
        const maxVelocity = 2;

        if (dist > 1) {
            p.vx += (dx / dist) * attractionForce;
            p.vy += (dy / dist) * attractionForce;
        }

        // Mouse repulsion
        const mdx = p.x - mouse.current.x;
        const mdy = p.y - mouse.current.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.current.radius) {
            const repulsionForce = (1 - mdist / mouse.current.radius) * 2;
            p.vx += (mdx / mdist) * repulsionForce;
            p.vy += (mdy / mdist) * repulsionForce;
        }


        // Limit velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxVelocity) {
            p.vx = (p.vx / speed) * maxVelocity;
            p.vy = (p.vy / speed) * maxVelocity;
        }

        p.x += p.vx;
        p.y += p.vy;

        // --- Drawing ---
        const opacity = Math.max(0, Math.min(1, Math.sin( (iteration.current + i * 10) * 0.05) * 0.5 + 0.5));
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = particleColor;
        ctx.globalAlpha = opacity;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
        
        // Reset canvas context properties
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
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
