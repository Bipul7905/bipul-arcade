'use client';
import { useEffect, useRef, useState } from 'react';

const icons = ['🍓','🚀','🐸','🍕','🌈','🐱'];
type RunnerState = { y: number; vy: number; obstacleX: number; alive: boolean; ticks: number };

export default function Game({ slug, title }: { slug: string; title: string }) {
  const [playing, P] = useState(false);
  const [score, S] = useState(0);
  const [best, B] = useState(0);
  const [data, D] = useState<any>({});
  const [msg, M] = useState('Ready when you are!');
  const [runner, setRunner] = useState<RunnerState>({ y: 0, vy: 0, obstacleX: 330, alive: false, ticks: 0 });
  const runnerRef = useRef(runner);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  useEffect(() => { const saved = +(localStorage.getItem('ba-' + slug) || 0); B(saved); bestRef.current = saved; }, [slug]);
  useEffect(() => { runnerRef.current = runner; }, [runner]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const end = (n: number) => {
    S(n); P(false);
    if (n > bestRef.current) { B(n); bestRef.current = n; localStorage.setItem('ba-' + slug, '' + n); M('NEW PERSONAL BEST! 🎉'); }
    else M('Nice try — one more round?');
    if (slug === '99-fail') setRunner(r => ({ ...r, alive: false }));
  };

  const start = () => {
    S(0); scoreRef.current = 0; P(true); M('Game on!');
    let d: any = {};
    if (slug === 'memory-match') d.cards = [...icons, ...icons].sort(() => Math.random() - .5);
    if (slug === 'tic-tac-toe') d.board = Array(9).fill('');
    if (slug === 'number-rush') d.tiles = Array(16).fill(0).map((_, i) => i === 5 || i === 10 ? 2 : 0);
    if (slug === 'bubble-pop') d.bubbles = Array.from({ length: 30 }, () => Math.floor(Math.random() * 4));
    if (slug === 'snake-challenge') d.snake = 0;
    if (slug === 'perfect-stack') d.stack = 0;
    if (slug === '99-fail') { d.runner = 0; setRunner({ y: 0, vy: 0, obstacleX: 330, alive: true, ticks: 0 }); }
    if (slug === 'reaction-tap') d.phase = 'wait';
    if (slug === 'whack-a-mole') d.mole = -1;
    D(d);
  };

  const jump = () => {
    if (!playing || slug !== '99-fail') return;
    const r = runnerRef.current;
    if (r.alive && r.y <= 1) setRunner(old => ({ ...old, vy: -12 }));
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

  // 99% Fail: a real jump-and-dodge runner with gravity, moving obstacles and collision.
  useEffect(() => {
    if (!playing || slug !== '99-fail') return;
    const timer = window.setInterval(() => {
      setRunner(prev => {
        if (!prev.alive) return prev;
        const vy = prev.vy + 0.62;
        const y = Math.min(0, prev.y + vy);
        const groundedVy = y === 0 ? 0 : vy;
        let obstacleX = prev.obstacleX - 6;
        if (obstacleX < -35) obstacleX = 340 + Math.random() * 100;
        const hit = obstacleX < 76 && obstacleX > 28 && y > -34;
        const ticks = prev.ticks + 1;
        if (hit) { window.setTimeout(() => end(scoreRef.current), 0); return { ...prev, y, vy: groundedVy, obstacleX, alive: false, ticks }; }
        if (ticks % 3 === 0) S(s => { scoreRef.current = s + 1; return s + 1; });
        return { y, vy: groundedVy, obstacleX, alive: true, ticks };
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
    <div className="scorebar"><span>SCORE <b>{score}</b></span><span>BEST <b>{best}</b></span><button onClick={start}>↻ RESTART</button></div>
    <div className="board" onClick={slug === '99-fail' && playing ? jump : undefined}>
      {!playing ? <div className="ready"><div>🕹️</div><h2>{msg}</h2><p>{title} · Personal best {best}</p><button className="btn" onClick={start}>START GAME →</button></div> : <>
        {slug === '99-fail' ? <div style={{ width: '100%', maxWidth: 560, height: 220, margin: 'auto', position: 'relative', overflow: 'hidden', borderRadius: 18, background: 'linear-gradient(#b9e9ff 0%,#e9f8ff 72%,#91d36c 72%,#68b94c 100%)', border: '2px solid #ffffff55', touchAction: 'manipulation' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 47, height: 5, background: '#477c37' }} />
          <div style={{ position: 'absolute', left: 42, bottom: 48 - runner.y, fontSize: 43, lineHeight: 1, transition: 'none', filter: 'drop-shadow(0 3px 1px #0003)' }}>🦊</div>
          <div style={{ position: 'absolute', left: runner.obstacleX, bottom: 48, fontSize: 35, lineHeight: 1 }}>🌵</div>
          <div style={{ position: 'absolute', top: 12, left: 14, color: '#24506b', fontWeight: 800, fontSize: 13 }}>SPACE / ↑ / TAP TO JUMP</div>
          {!runner.alive && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#10203055', color: 'white', fontWeight: 900, fontSize: 22 }}>GAME OVER</div>}
        </div> : slug === 'memory-match' ? <div className="memory">{data.cards.map((c: string, i: number) => <button key={i} onClick={() => act(i)}>{data.matched?.includes(i) || data.open?.includes(i) ? c : '✦'}</button>)}</div>
        : slug === 'tic-tac-toe' ? <div className="ttt">{data.board.map((c: string, i: number) => <button key={i} onClick={() => act(i)}>{c}</button>)}</div>
        : slug === 'reaction-tap' ? <button className={'reaction ' + (data.phase === 'go' ? 'green' : '')} onClick={() => act()}>{data.phase === 'go' ? 'TAP NOW!' : 'WAIT FOR GREEN'}</button>
        : slug === 'whack-a-mole' ? <div className="moles">{Array.from({ length: 9 }, (_, i) => <button key={i} onClick={() => act(i)}>{data.mole === i ? '🐹' : '🕳️'}</button>)}</div>
        : slug === 'number-rush' ? <div className="numbers">{data.tiles.map((n: number, i: number) => <button key={i} onClick={() => act(i)}>{n || '+'}</button>)}</div>
        : slug === 'bubble-pop' ? <div className="bubbles">{data.bubbles.map((n: number, i: number) => <button key={i} style={{ background: ['#ff5da8','#52e6f5','#ffe66d','#a58cff'][n] }} onClick={() => act(i)} />)}</div>
        : <div className="tapgame"><div className="bigemoji">{slug === 'snake-challenge' ? '🐍' : slug === 'perfect-stack' ? '🧱' : '🎨'}</div><h2>{slug === 'snake-challenge' ? 'Collect the dots!' : slug === 'perfect-stack' ? 'Stack it higher!' : 'Tap to switch!'}</h2><button className="btn" onClick={() => act()}>TAP / SPACE</button><p>Tap count: {score}</p></div>}
      </>}
    </div>
    {slug === '99-fail' && playing && <button className="btn" style={{ marginTop: 14, width: '100%', maxWidth: 560 }} onClick={jump}>JUMP  ↑</button>}
    {!playing && <div className="result"><b>{msg}</b><button onClick={start}>PLAY AGAIN ↻</button></div>}
  </div>;
}
