import React, { useEffect, useRef } from 'react';

export default function SpaceAtmosphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const starCount = 200;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      baseAlpha: Math.random() * 0.7 + 0.2,
      blinkSpeed: 0.008 + Math.random() * 0.025,
      phase: Math.random() * Math.PI*2,
      color: Math.random() > 0.8 ? '#E27B58' : Math.random() > 0.6 ? '#00FFCC' : '#ffffff'
    }));

    const dustCount = 50;
    const dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.25 - 0.1,
      radius: Math.random() * 2.2 + 0.6,
      alpha: Math.random() * 0.35 + 0.1,
      color: Math.random() > 0.5 ? '#E27B58' : '#FF4C29'
    }));

    let t = 0;
    const render = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.alpha = s.baseAlpha + Math.sin(t * s.blinkSpeed * 60 + s.phase) * 0.25;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;

        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.alpha * (0.8 + Math.sin(t * 1.5 + i) * 0.2);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-mars-400/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[96rem] h-[96rem] rounded-full bg-mars-500/[0.03] blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(11,12,16,0.8)_100%)] pointer-events-none" />
    </div>
  );
}
