import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ResonanceCanvas = ({ socketHook, moodColor = '#2dd4bf', activeCount = 1 }) => {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle high DPI
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * window.devicePixelRatio;
      canvas.height = parent.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle field initialization
    const particleCount = Math.min(80, Math.max(35, activeCount * 6));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (canvas.width / window.devicePixelRatio),
        y: Math.random() * (canvas.height / window.devicePixelRatio),
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.2,
        baseRadius: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.6 + (isDark ? 0.3 : 0.5),
        color: moodColor
      });
    }

    // Ripple pulses triggered by collective breathing
    const ripples = [];

    const addRipple = (x, y, color = '#38bdf8', maxRadius = 150) => {
      ripples.push({
        x: x || Math.random() * (canvas.width / window.devicePixelRatio),
        y: y || Math.random() * (canvas.height / window.devicePixelRatio),
        radius: 5,
        maxRadius,
        alpha: 0.8,
        color
      });
    };

    // Listen to live resonance broadcast pulses from peer students
    let unsubscribe;
    if (socketHook?.onEvent) {
      unsubscribe = socketHook.onEvent('resonance_broadcast', (data) => {
        addRipple(null, null, data.color || '#38bdf8', data.intensity ? 200 : 120);
      });
    }

    // Mouse Interaction
    let mouse = { x: null, y: null, radius: 100 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      addRipple(e.clientX - rect.left, e.clientY - rect.top, moodColor || '#2dd4bf', 180);
    };
    canvas.addEventListener('click', handleClick);

    // Render Loop
    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Draw and update Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.5;
        r.alpha -= 0.008;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha * (isDark ? 0.5 : 0.7);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = moodColor || '#2dd4bf';
            ctx.globalAlpha = (1 - dist / 110) * (isDark ? 0.18 : 0.3);
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Update and Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundary
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse repelling physics
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            p.x += (dx / dist) * force * 3;
            p.y += (dy / dist) * force * 3;
          }
        }

        // Draw glowing particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = isDark ? 12 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      if (unsubscribe) unsubscribe();
    };
  }, [moodColor, activeCount, socketHook, isDark]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-3xl overflow-hidden glass-panel border border-brand-500/20 shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
      <div className="absolute bottom-4 left-4 pointer-events-none text-[11px] text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
        ✨ Interactive Bio-Resonance Field • Click anywhere to send a pulse
      </div>
    </div>
  );
};
