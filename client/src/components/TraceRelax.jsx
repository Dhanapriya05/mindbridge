import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react';

const DRAWINGS = [
  { id: 'flower', icon: '🌸', name: 'Flower', quote: 'Small steps can grow into beautiful things.', paths: [ [[.5,.7],[.5,.82]], [[.5,.82],[.44,.88],[.56,.88],[.5,.82]], [[.5,.68],[.5,.53],[.5,.4]], [[.5,.42],[.4,.34],[.31,.38],[.29,.48],[.36,.55],[.5,.52]], [[.5,.42],[.47,.29],[.53,.2],[.62,.22],[.68,.31],[.64,.4],[.5,.42]], [[.5,.42],[.62,.36],[.72,.4],[.76,.49],[.7,.57],[.59,.55],[.5,.42]], [[.5,.42],[.4,.39],[.32,.31],[.34,.22],[.43,.18],[.51,.25],[.5,.42]] ] },
  { id: 'cat', icon: '🐱', name: 'Cat', quote: 'You deserve kindness, including from yourself.', paths: [ [[.3,.45],[.29,.27],[.39,.34],[.5,.3],[.61,.34],[.71,.27],[.7,.52],[.64,.65],[.5,.7],[.36,.65],[.3,.45]], [[.4,.5],[.42,.5]], [[.59,.5],[.61,.5]], [[.46,.6],[.5,.62],[.54,.6]], [[.3,.56],[.2,.55],[.13,.51]], [[.7,.56],[.8,.55],[.87,.51]], [[.37,.7],[.34,.82],[.43,.77]], [[.63,.7],[.66,.82],[.57,.77]] ] },
  { id: 'cloud', icon: '☁️', name: 'Cloud', quote: 'Let your worries float away for a while.', paths: [ [[.2,.62],[.18,.54],[.22,.45],[.3,.42],[.35,.32],[.46,.28],[.55,.34],[.64,.31],[.74,.37],[.77,.47],[.84,.52],[.83,.62],[.75,.67],[.25,.67],[.2,.62]], [[.3,.78],[.4,.78]], [[.56,.78],[.66,.78]] ] },
  { id: 'apple', icon: '🍎', name: 'Apple', quote: 'You made something lovely today. Be proud of yourself.', paths: [ [[.5,.36],[.43,.28],[.34,.28],[.26,.36],[.23,.5],[.26,.65],[.36,.76],[.5,.8],[.64,.76],[.74,.65],[.77,.5],[.74,.36],[.66,.28],[.57,.28],[.5,.36]], [[.5,.3],[.51,.2],[.59,.14]], [[.52,.2],[.62,.17],[.69,.21]] ] },
  { id: 'planet', icon: '🪐', name: 'Planet', quote: 'You are doing better than you think.', paths: [ [[.5,.28],[.4,.3],[.33,.37],[.3,.48],[.32,.6],[.4,.7],[.5,.73],[.6,.7],[.68,.6],[.7,.48],[.67,.37],[.6,.3],[.5,.28]], [[.12,.59],[.25,.54],[.4,.53],[.57,.55],[.73,.59],[.88,.64]], [[.12,.59],[.22,.69],[.38,.76],[.58,.78],[.76,.72],[.88,.64]] ] }
];

export const TraceRelax = ({ musicPlaying, onStartMusic, muted, reduceMotion }) => {
  const canvasRef = useRef(null);
  const coveredRef = useRef(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [completed, setCompleted] = useState([]);
  const drawing = DRAWINGS[selectedIndex];
  const points = drawing.paths.flatMap((path) => path);

  useEffect(() => { coveredRef.current = new Set(); setProgress(0); setComplete(false); }, [selectedIndex]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    const draw = () => {
      const size = canvas.clientWidth;
      context.clearRect(0, 0, size, size);
      context.fillStyle = '#fafdff'; context.fillRect(0, 0, size, size);
      drawing.paths.forEach((path, pathIndex) => {
        context.beginPath(); path.forEach(([x, y], index) => index ? context.lineTo(x * size, y * size) : context.moveTo(x * size, y * size));
        context.strokeStyle = '#a9dced'; context.lineWidth = 3; context.setLineDash([2, 10]); context.lineCap = 'round'; context.stroke(); context.setLineDash([]);
        path.forEach(([x, y], pointIndex) => { if (!coveredRef.current.has(`${pathIndex}-${pointIndex}`)) return; context.beginPath(); context.arc(x * size, y * size, 6, 0, Math.PI * 2); context.fillStyle = '#6bc9de'; context.shadowColor = '#8ee5ef'; context.shadowBlur = 10; context.fill(); context.shadowBlur = 0; });
      });
      context.font = '24px sans-serif'; context.fillStyle = '#d7eef7'; context.fillText('✦', size * .1, size * .16); context.fillText('✧', size * .82, size * .86);
    };
    const resize = () => { const ratio = window.devicePixelRatio || 1; const size = Math.min(canvas.parentElement.clientWidth, 560); canvas.width = size * ratio; canvas.height = size * ratio; canvas.style.width = `${size}px`; canvas.style.height = `${size}px`; context.setTransform(ratio, 0, 0, ratio, 0, 0); draw(); };
    const handlePointer = (event) => {
      if (complete) return;
      const rect = canvas.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width; const y = (event.clientY - rect.top) / rect.height;
      drawing.paths.forEach((path, pathIndex) => path.forEach(([pointX, pointY], pointIndex) => { if (Math.hypot(pointX - x, pointY - y) < .075) coveredRef.current.add(`${pathIndex}-${pointIndex}`); }));
      const nextProgress = Math.min(100, Math.round((coveredRef.current.size / points.length) * 100)); setProgress(nextProgress);
      if (nextProgress >= 72) { setComplete(true); setCompleted((items) => items.includes(drawing.id) ? items : [...items, drawing.id]); } draw();
    };
    resize(); const observer = new ResizeObserver(resize); observer.observe(canvas.parentElement);
    const start = (event) => { canvas.setPointerCapture(event.pointerId); handlePointer(event); }; canvas.addEventListener('pointerdown', start); canvas.addEventListener('pointermove', handlePointer);
    return () => { observer.disconnect(); canvas.removeEventListener('pointerdown', start); canvas.removeEventListener('pointermove', handlePointer); };
  }, [drawing, points, complete]);

  const chooseAnother = (direction = 1) => setSelectedIndex((index) => (index + direction + DRAWINGS.length) % DRAWINGS.length);
  return <section className="glass-panel-glow rounded-[2rem] p-5 sm:p-7 overflow-hidden"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5"><div><p className="space-eyebrow mb-2">A quiet creative break</p><h2 className="text-2xl sm:text-3xl font-black text-sky-950">Trace &amp; Relax</h2><p className="text-sm text-slate-600 mt-1">Choose a little shape and follow the soft line.</p></div><div className="flex items-center gap-2" aria-label="Choose a drawing"><button onClick={() => chooseAnother(-1)} className="p-2.5 rounded-xl border border-sky-200 bg-white/80 text-sky-700" title="Previous drawing"><ChevronLeft size={18} /></button><span className="px-3 text-xs font-bold text-sky-800">{drawing.icon} {drawing.name}</span><button onClick={() => chooseAnother(1)} className="p-2.5 rounded-xl border border-sky-200 bg-white/80 text-sky-700" title="Next drawing"><ChevronRight size={18} /></button></div></div><div className="grid lg:grid-cols-[minmax(0,1fr)_240px] gap-6 items-center"><div className={`relative mx-auto w-full max-w-[560px] rounded-3xl p-2 bg-white/80 border border-sky-100 shadow-inner ${complete && !reduceMotion ? 'trace-complete' : ''}`}><canvas ref={canvasRef} className="mx-auto rounded-2xl touch-none cursor-crosshair max-w-full" aria-label={`Trace the ${drawing.name}`} />{complete && <div className="absolute inset-0 pointer-events-none flex items-center justify-center"><div className="trace-sparkles text-2xl">✦ ˚ ✧ ˚ ✦</div></div>}</div><div className="space-y-4"><div className="rounded-2xl bg-white/65 border border-sky-100 p-4"><div className="flex justify-between text-xs font-bold text-sky-800 mb-2"><span>Follow the glow</span><span>{progress}%</span></div><div className="h-2 rounded-full bg-sky-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-pink-300 transition-all" style={{ width: `${progress}%` }} /></div><p className="text-xs text-slate-500 mt-3">There is no wrong way to do this. Just keep going gently.</p></div>{!musicPlaying && !muted && <button onClick={onStartMusic} className="w-full rounded-2xl bg-sky-600 text-white px-4 py-3 text-sm font-bold shadow-lg shadow-sky-200">Play music while I trace</button>}{complete ? <div className="reward-card rounded-2xl bg-white/85 border border-pink-200 p-4"><div className="flex items-center gap-2 text-sky-900 font-black"><Sparkles size={18} className="text-pink-400" /> You did it!</div><p className="text-sm text-slate-600 mt-2">You gave yourself a peaceful moment.</p><p className="text-sm italic text-sky-800 mt-4 opacity-0 quote-reveal">“{drawing.quote}” <Star size={13} className="inline text-pink-400 fill-pink-200" /></p><button onClick={() => chooseAnother(1)} className="mt-4 w-full rounded-xl bg-pink-100 text-pink-800 px-4 py-2.5 text-xs font-bold">Another One ✨</button></div> : <div className="text-xs text-slate-500 flex items-center gap-2"><Check size={15} className="text-cyan-500" /> Your little moments are waiting here.</div>}</div></div><div className="mt-6 pt-5 border-t border-sky-100"><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-black text-sky-950">Your Little Moments</h3><span className="text-xs text-slate-500">{completed.length} of {DRAWINGS.length}</span></div><div className="flex flex-wrap gap-2">{DRAWINGS.map((item) => <div key={item.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${completed.includes(item.id) ? 'bg-white border-pink-200 text-sky-800 moment-arrive' : 'bg-sky-50/50 border-sky-100 text-slate-400'}`}><span>{item.icon}</span><span>{item.name}</span>{completed.includes(item.id) && <Check size={13} className="text-emerald-500" />}</div>)}</div></div></section>;
};