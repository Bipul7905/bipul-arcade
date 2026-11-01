'use client';
import { useEffect, useRef, useState } from 'react';

const icons = ['🍓','🚀','🐸','🍕','🌈','🐱'];
type RunnerState = { y: number; vy: number; obstacles: number[]; alive: boolean; ticks: number };

export default function Game({ slug, title }: { slug: string; title: string }) {
  const [playing, P] = useState(false);
  const [score, S] = useState(0);
  const [best, B] = useState(0);
  const [data, D] = useState<any>({});
  const [msg, M] = useState('Ready when you are!');
  const [runner, setRunner] = useState<RunnerState>({ y: 0, vy: 0, obstacles: [620, 930], alive: false, ticks: 0 });
  const runnerRef = useRef(runner);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  // Small synthesized arcade sound effects; no external audio files are required.
  const playSound = (kind: 'start' | 'jump' | 'score' | 'hit' | 'toggle') => {
    if (!soundOn) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioRef.current || new AudioContextClass();
      audioRef.current = ctx;
      if (ctx.state === 'suspended') void ctx.resume();

      const now = ctx.currentTime;
      const settings: Record<string, { frequency: number; endFrequency: number; duration: number; wave: OscillatorType; volume: number }> = {
        start: { frequency: 440, endFrequency: 880, duration: 0.16, wave: 'sine', volume: 0.12 },
        jump: { frequency: 520, endFrequency: 760, duration: 0.11, wave: 'triangle', volume: 0.09 },
        score: { frequency: 880, endFrequency: 1180, duration: 0.075, wave: 'sine', volume: 0.055 },
        hit: { frequency: 190, endFrequency: 55, duration: 0.28, wave: 'sawtooth', volume: 0.12 },
        toggle: { frequency: 660, endFrequency: 660, duration: 0.07, wave: 'sine', volume: 0.06 }
      };
      const sound = settings[kind];
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = sound.wave;
      oscillator.frequency.setValueAtTime(sound.frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, sound.endFrequency), now + sound.duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(sound.volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + sound.duration + 0.015);
    } catch {
      // Sound is optional; gameplay should continue if audio is unavailable.
    }
  };

  useEffect(() => { const saved = +(localStorage.getItem('ba-' + slug) || 0); B(saved); bestRef.current = saved; }, [slug]);
  useEffect(() => { runnerRef.current = runner; }, [runner]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const end = (n: number) => {
    playSound('hit');
    S(n); P(false);
    if (n > bestRef.current) { B(n); bestRef.current = n; localStorage.setItem('ba-' + slug, '' + n); M('NEW PERSONAL BEST! 🎉'); }
    else M('Nice try — one more round?');
    if (slug === '99-fail') setRunner(r => ({ ...r, alive: false }));
  };

  const start = () => {
    playSound('start');
    S(0); scoreRef.current = 0; P(true); M('Game on!');
    let d: any = {};
    if (slug === 'memory-match') d.cards = [...icons, ...icons].sort(() => Math.random() - .5);
    if (slug === 'tic-tac-toe') d.board = Array(9).fill('');
    if (slug === 'number-rush') d.tiles = Array(16).fill(0).map((_, i) => i === 5 || i === 10 ? 2 : 0);
    if (slug === 'bubble-pop') d.bubbles = Array.from({ length: 30 }, () => Math.floor(Math.random() * 4));
    if (slug === 'snake-challenge') d.snake = 0;
    if (slug === 'perfect-stack') d.stack = 0;
    if (slug === '99-fail') setRunner({ y: 0, vy: 0, obstacles: [620, 940], alive: true, ticks: 0 });
    if (slug === 'reaction-tap') d.phase = 'wait';
    if (slug === 'whack-a-mole') d.mole = -1;
    D(d);
  };

  const jump = () => {
    if (!playing || slug !== '99-fail') return;
    const r = runnerRef.current;
    if (r.alive && r.y >= -2) { playSound('jump'); setRunner(old => ({ ...old, vy: -14.2 })); }
  };

  const act = (v: number = 0) => {
    if (!playing) return;
    let d = { ...data };
    if (slug === 'memory-match') {
      d.open = d.open || []; if (d.open.includes(v) || d.matched?.includes(v)) return;
      d.open = [...d.open, v];
      if (d.open.length === 2) {
        if (d.cards[d.open[0]] === d.cards[d.open[1]]) { d.matched = [...(d.matched || []), ...d.open]; d.open = []; S(d.matched.length / 2); if (d.matched.length === 12) { D(d); end(6); return; } }
        else { D(d); setTimeout(() => D((x: any) => ({ ...x, open: [] })), 650); return; }
      }
      D(d); return;
    }
    if (slug === 'tic-tac-toe') {
      if (d.board[v]) return; d.board[v] = 'X';
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const win = (m: string[]) => lines.some(l => l.every(i => m[i] === m[l[0]]));
      if (win(d.board)) { D(d); end(score + 1); return; }
      const empty = d.board.map((x: string, i: number) => x ? null : i).filter((x: number | null) => x !== null) as number[];
      if (empty.length) d.board[empty[Math.floor(Math.random() * empty.length)]] = 'O';
      D(d); if (win(d.board) || !d.board.includes('')) end(score); return;
    }
    if (slug === 'reaction-tap') { if (d.phase === 'wait') { d.phase = 'go'; d.at = Date.now(); M('TAP NOW!'); D(d); } else if (d.phase === 'go') end(Math.max(0, 1000 - (Date.now() - d.at))); return; }
    if (slug === 'whack-a-mole') { if (v === d.mole) { const n = score + 1; S(n); d.mole = Math.floor(Math.random() * 9); D(d); if (n >= 20) end(n); } return; }
    if (slug === 'perfect-stack') { const n = (d.stack || 0) + 1; d.stack = n; D(d); S(n); if (n >= 20) end(n); return; }
    if (slug === 'number-rush') { const n = d.tiles[v] || 0; d.tiles[v] = n ? n * 2 : 2; const empty = d.tiles.findIndex((x: number) => !x); if (empty >= 0) d.tiles[empty] = 2; const total = d.tiles.reduce((a: number, b: number) => a + b, 0); D(d); S(total); return; }
    if (slug === 'bubble-pop') { const color = d.bubbles[v]; const n = d.bubbles.filter((x: number) => x === color).length; d.bubbles = d.bubbles.map((x: number) => x === color ? Math.floor(Math.random() * 4) : x); D(d); S(score + n); return; }
    if (slug === 'color-switch') { const n = score + 1; S(n); if (n >= 30) end(n); return; }
    if (slug === '99-fail') { jump(); return; }
    if (slug === 'snake-challenge') { const n = score + 1; S(n); if (n >= 30) end(n); return; }
  };

  // Polished endless runner: multiple obstacles, ramping speed, gravity and collision.
  useEffect(() => {
    if (!playing || slug !== '99-fail') return;
    const timer = window.setInterval(() => {
      setRunner(prev => {
        if (!prev.alive) return prev;
        const vy = prev.vy + 0.72;
        const y = Math.min(0, prev.y + vy);
        const groundedVy = y === 0 ? 0 : vy;
        const speed = Math.min(12, 6.2 + Math.floor(scoreRef.current / 12) * 0.55);
        let obstacles = prev.obstacles.map(x => x - speed);
        obstacles = obstacles.map(x => x < -70 ? Math.max(...obstacles) + 250 + Math.random() * 170 : x);
        const hit = obstacles.some(x => x < 112 && x > 52 && y > -58);
        const ticks = prev.ticks + 1;
        if (hit) {
          window.setTimeout(() => end(scoreRef.current), 0);
          return { ...prev, y, vy: groundedVy, obstacles, alive: false, ticks };
        }
        if (ticks % 3 === 0) S(s => {
          scoreRef.current = s + 1;
          if ((s + 1) % 10 === 0) playSound('score');
          return s + 1;
        });
        return { y, vy: groundedVy, obstacles, alive: true, ticks };
      });
    }, 30);
    return () => window.clearInterval(timer);
  }, [playing, slug]);

  useEffect(() => {
    if (!playing || slug === '99-fail') return;
    let timer: any;
    if (slug === 'whack-a-mole') timer = setInterval(() => D((d: any) => ({ ...d, mole: Math.floor(Math.random() * 9) })), 800);
    if (slug === 'snake-challenge') timer = setInterval(() => S(s => s + 1), 650);
    return () => clearInterval(timer);
  }, [playing, slug]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (slug === '99-fail' && (e.code === 'Space' || e.code === 'ArrowUp')) { e.preventDefault(); jump(); }
      else if ((e.code === 'Space' || e.code === 'Enter') && playing) { e.preventDefault(); act(); }
      if (slug === 'snake-challenge' && e.key.startsWith('Arrow')) act();
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });

  return <div className="gamebox">
    <div className="scorebar"><span>SCORE <b>{score}</b></span><span>BEST <b>{best}</b></span><button onClick={() => { setSoundOn(v => !v); playSound('toggle'); }} aria-label={soundOn ? 'Mute sound' : 'Enable sound'}>{soundOn ? '🔊 SOUND ON' : '🔇 SOUND OFF'}</button><button onClick={start}>↻ RESTART</button></div>
    <div className="board" onClick={slug === '99-fail' && playing ? jump : undefined}>
      {!playing ? <div className="ready"><div>🕹️</div><h2>{msg}</h2><p>{title} · Personal best {best}</p><button className="btn" onClick={start}>START GAME →</button></div> : <>
        {slug === '99-fail' ? <div className="runner-scene" style={{ width: '100%', maxWidth: 760, height: 330, margin: 'auto', position: 'relative', overflow: 'hidden', borderRadius: 22, isolation: 'isolate', background: 'linear-gradient(180deg,#66c9ff 0%,#b9e9ff 48%,#e7f8ff 70%,#9cdb78 70%,#438d48 100%)', border: '1px solid #ffffffaa', boxShadow: 'inset 0 -12px 30px #174b3455, 0 18px 40px #163a5933', touchAction: 'manipulation' }}>
          <style>{`
            @keyframes ba-cloud-drift { from { transform: translateX(0); } to { transform: translateX(-180px); } }
            @keyframes ba-ground-drift { from { background-position: 0 0, 0 0; } to { background-position: -220px 0, -90px 0; } }
            @keyframes ba-run-bob { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-5px) rotate(3deg); } }
            @keyframes ba-shadow-pulse { 0%,100% { transform: scaleX(1); opacity:.28; } 50% { transform: scaleX(.72); opacity:.16; } }
            .ba-cloud { position:absolute; color:#fff; font-size:42px; opacity:.88; filter:drop-shadow(0 5px 4px #3982a333); animation:ba-cloud-drift 13s linear infinite alternate; }
            .ba-fox { position:absolute; left:7%; bottom:57px; font-size:66px; line-height:1; filter:drop-shadow(0 9px 4px #183b3655); transform-origin:50% 100%; animation:ba-run-bob .24s ease-in-out infinite; }
            .ba-fox.ba-air { animation:none; transform:rotate(-12deg); }
            .ba-ground { position:absolute; left:0; right:0; bottom:0; height:72px; border-top:5px solid #377b3b; background:repeating-linear-gradient(110deg,transparent 0 28px,#ffffff22 29px 34px,transparent 35px 66px),linear-gradient(180deg,#79c957,#3f984c); box-shadow:inset 0 9px 13px #ffffff33; }
            .ba-obstacle { position:absolute; bottom:60px; font-size:54px; line-height:1; filter:drop-shadow(0 8px 4px #173d3155); }
            .ba-track { position:absolute; left:0; right:0; bottom:69px; height:3px; background:#eaffb8aa; }
            .ba-fox-shadow { position:absolute; left:7.5%; bottom:48px; width:52px; height:10px; border-radius:50%; background:#173e2b; animation:ba-shadow-pulse .24s ease-in-out infinite; }
            @media (max-width:600px) { .ba-fox { font-size:54px; bottom:57px; } .ba-obstacle { font-size:45px; } }
          `}</style>
          <div className="ba-cloud" style={{ top: 36, left: '18%' }}>☁</div>
          <div className="ba-cloud" style={{ top: 76, left: '65%', animationDelay: '-6s', fontSize: 34 }}>☁</div>
          <div style={{ position: 'absolute', right: '-2%', bottom: 100, width: '42%', height: 105, background: 'linear-gradient(145deg,#7fcf8b,#4eaa78)', clipPath: 'polygon(0 100%,42% 15%,66% 55%,83% 30%,100% 100%)', opacity: .65 }} />
          <div style={{ position: 'absolute', left: '-5%', bottom: 100, width: '45%', height: 80, background: 'linear-gradient(145deg,#a6df91,#69bd76)', clipPath: 'polygon(0 100%,25% 35%,50% 72%,76% 10%,100% 100%)', opacity: .72 }} />
          <div style={{ position: 'absolute', top: 15, left: 18, color: '#164c70', fontWeight: 900, fontSize: 12, letterSpacing: 1, textShadow: '0 1px #fff8' }}>SPACE / ↑ / TAP TO JUMP</div>
          <div style={{ position: 'absolute', top: 14, right: 18, color: '#164c70', fontWeight: 900, fontSize: 13 }}>⚡ SPEED {Math.min(12, 6 + Math.floor(score / 12))}</div>
          <div className="ba-ground" />
          <div className="ba-track" />
          <div className="ba-fox-shadow" />
          <div className={'ba-fox' + (runner.y < -3 ? ' ba-air' : '')} style={{ bottom: 57 - runner.y }}>🦊</div>
          {runner.obstacles.map((x, i) => <div className="ba-obstacle" key={i} style={{ left: `${(x / 760) * 100}%` }}>{i % 3 === 0 ? '🌵' : i % 3 === 1 ? '🪨' : '🌵'}</div>)}
          <div style={{ position: 'absolute', bottom: 12, right: 16, color: '#f4ffe8', fontWeight: 800, fontSize: 11, textShadow: '0 2px 3px #17452c' }}>FOX RUNNER • 3D ARCADE</div>
          {!runner.alive && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#10203077', color: 'white', fontWeight: 900, fontSize: 27, letterSpacing: 2, textShadow: '0 3px 8px #000', backdropFilter: 'blur(3px)' }}>GAME OVER</div>}
        </div> : slug === 'memory-match' ? <div className="memory">{data.cards.map((c: string, i: number) => <button key={i} onClick={() => act(i)}>{data.matched?.includes(i) || data.open?.includes(i) ? c : '✦'}</button>)}</div>
        : slug === 'tic-tac-toe' ? <div className="ttt">{data.board.map((c: string, i: number) => <button key={i} onClick={() => act(i)}>{c}</button>)}</div>
        : slug === 'reaction-tap' ? <button className={'reaction ' + (data.phase === 'go' ? 'green' : '')} onClick={() => act()}>{data.phase === 'go' ? 'TAP NOW!' : 'WAIT FOR GREEN'}</button>
        : slug === 'whack-a-mole' ? <div className="moles">{Array.from({ length: 9 }, (_, i) => <button key={i} onClick={() => act(i)}>{data.mole === i ? '🐹' : '🕳️'}</button>)}</div>
        : slug === 'number-rush' ? <div className="numbers">{data.tiles.map((n: number, i: number) => <button key={i} onClick={() => act(i)}>{n || '+'}</button>)}</div>
        : slug === 'bubble-pop' ? <div className="bubbles">{data.bubbles.map((n: number, i: number) => <button key={i} style={{ background: ['#ff5da8','#52e6f5','#ffe66d','#a58cff'][n] }} onClick={() => act(i)} />)}</div>
        : <div className="tapgame"><div className="bigemoji">{slug === 'snake-challenge' ? '🐍' : slug === 'perfect-stack' ? '🧱' : '🎨'}</div><h2>{slug === 'snake-challenge' ? 'Collect the dots!' : slug === 'perfect-stack' ? 'Stack it higher!' : 'Tap to switch!'}</h2><button className="btn" onClick={() => act()}>TAP / SPACE</button><p>Tap count: {score}</p></div>}
      </>}
    </div>
    {slug === '99-fail' && playing && <button className="btn" style={{ marginTop: 14, width: '100%', maxWidth: 760, minHeight: 48 }} onClick={jump}>JUMP ↑</button>}
    {!playing && <div className="result"><b>{msg}</b><button onClick={start}>PLAY AGAIN ↻</button></div>}
  </div>;
}
