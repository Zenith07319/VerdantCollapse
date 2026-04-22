import { WEAPONS, PASSIVES } from '../data/defs.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    // Canvas 2D API로 텍스처 생성 (그라디언트, 베지어, 하이라이트 지원)
    const tex = (key, w, h, fn) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      fn(c.getContext('2d'), w, h);
      this.textures.addCanvas(key, c);
    };

    // ── 플레이어 (32×32) ─────────────────────────────────────────────
    tex('player', 32, 32, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      // 외곽 녹색 오라
      const aura = ctx.createRadialGradient(cx, cy, 8, cx, cy, 16);
      aura.addColorStop(0, 'rgba(80,255,60,0)');
      aura.addColorStop(1, 'rgba(80,255,60,0.18)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI * 2); ctx.fill();
      // 몸체 (방사 그라디언트)
      const body = ctx.createRadialGradient(cx - 2, cy - 2, 2, cx, cy, 12);
      body.addColorStop(0,   '#7bef56');
      body.addColorStop(0.5, '#3a9a30');
      body.addColorStop(1,   '#1b501b');
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
      // 외곽선
      ctx.strokeStyle = '#0c280c'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke();
      // 갑옷 하이라이트
      ctx.fillStyle = 'rgba(180,255,120,0.28)';
      ctx.beginPath(); ctx.ellipse(cx - 2, cy - 3, 5, 6, -0.3, 0, Math.PI * 2); ctx.fill();
      // 방향 화살표 (위쪽 = 전방)
      ctx.fillStyle = '#ccff44';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx - 3.5, cy - 9);
      ctx.lineTo(cx + 3.5, cy - 9);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#88aa00'; ctx.lineWidth = 0.8; ctx.stroke();
      // 눈
      ctx.fillStyle = '#44ffaa';
      ctx.beginPath(); ctx.arc(cx - 3, cy - 2, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3, cy - 2, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.arc(cx - 3.5, cy - 2.5, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 2.5, cy - 2.5, 0.6, 0, Math.PI * 2); ctx.fill();
    });

    // ── void_crawler (24×24) ─────────────────────────────────────────
    tex('void_crawler', 24, 24, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      // 다리 8개
      ctx.strokeStyle = '#5511aa'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i + Math.PI / 8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
        ctx.lineTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11);
        ctx.stroke();
      }
      // 몸체
      const bg = ctx.createRadialGradient(cx - 1, cy - 1, 1, cx, cy, 7.5);
      bg.addColorStop(0,   '#bb66ff');
      bg.addColorStop(0.5, '#6622cc');
      bg.addColorStop(1,   '#1e0055');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0e0022'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.stroke();
      // 단안 (붉은 눈)
      const eye = ctx.createRadialGradient(cx, cy, 0, cx, cy, 3.5);
      eye.addColorStop(0,   '#ff9999');
      eye.addColorStop(0.4, '#ff0000');
      eye.addColorStop(1,   '#550000');
      ctx.fillStyle = eye;
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
      // 눈 반짝임
      ctx.fillStyle = 'rgba(255,220,220,0.6)';
      ctx.beginPath(); ctx.arc(cx - 0.8, cy - 1.2, 1, 0, Math.PI * 2); ctx.fill();
    });

    // ── spore_walker (28×28) ─────────────────────────────────────────
    tex('spore_walker', 28, 28, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      // 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(cx + 1, cy + 2, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
      // 버섯 갓
      const cap = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 13);
      cap.addColorStop(0,   '#9add33');
      cap.addColorStop(0.5, '#4d8811');
      cap.addColorStop(1,   '#1e3d05');
      ctx.fillStyle = cap;
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0c1e00'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke();
      // 갓 반점
      ctx.fillStyle = 'rgba(0,28,0,0.45)';
      [[cx - 3, cy - 4, 2.5], [cx + 4, cy - 2, 2], [cx - 1, cy + 4, 2], [cx + 3, cy + 3, 1.5]]
        .forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
      // 갓 외곽 하이라이트 링
      ctx.strokeStyle = 'rgba(170,255,70,0.4)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
      // 중앙 자루
      ctx.fillStyle = '#bedd88';
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#557700'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.stroke();
      // 눈
      ctx.fillStyle = '#eeff88';
      ctx.beginPath(); ctx.arc(cx - 2.5, cy - 1, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 2.5, cy - 1, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(cx - 2.5, cy - 1, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 2.5, cy - 1, 0.6, 0, Math.PI * 2); ctx.fill();
    });

    // ── toxic_shambler (36×36) ───────────────────────────────────────
    tex('toxic_shambler', 36, 36, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      // 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(cx + 2, cy + 4, 15, 11, 0, 0, Math.PI * 2); ctx.fill();
      // 불규칙 몸체 (베지어)
      const blob = ctx.createRadialGradient(cx - 2, cy - 2, 3, cx, cy, 16);
      blob.addColorStop(0,   '#4d8c22');
      blob.addColorStop(0.5, '#2a5511');
      blob.addColorStop(1,   '#0c2107');
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.moveTo(cx,      cy - 15);
      ctx.bezierCurveTo(cx + 11, cy - 14, cx + 16, cy - 4, cx + 15, cy + 1);
      ctx.bezierCurveTo(cx + 15, cy + 9,  cx + 9,  cy + 14, cx + 1, cy + 15);
      ctx.bezierCurveTo(cx - 7,  cy + 16, cx - 14, cy + 9,  cx - 15, cy + 1);
      ctx.bezierCurveTo(cx - 16, cy - 6,  cx - 10, cy - 13, cx,     cy - 15);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#071007'; ctx.lineWidth = 2; ctx.stroke();
      // 독 농포 4개
      [[cx - 5, cy - 6], [cx + 5, cy - 4], [cx - 3, cy + 6], [cx + 4, cy + 5]]
        .forEach(([px, py]) => {
          const pg = ctx.createRadialGradient(px, py, 0, px, py, 4);
          pg.addColorStop(0,   '#ddff00');
          pg.addColorStop(0.5, '#88cc00');
          pg.addColorStop(1,   '#335500');
          ctx.fillStyle = pg;
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#1a3300'; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.stroke();
        });
      // 눈
      ctx.fillStyle = '#ff5500';
      ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(cx - 3, cy - 3, 1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3, cy - 3, 1, 0, Math.PI * 2); ctx.fill();
    });

    // ── stalker_elite (36×36) ────────────────────────────────────────
    tex('stalker_elite', 36, 36, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      // 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(cx + 2, cy + 3, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
      // 4방향 날개 스파이크
      ctx.fillStyle = '#770000';
      ctx.beginPath(); ctx.moveTo(cx, cy - 16); ctx.lineTo(cx - 3, cy - 12); ctx.lineTo(cx + 3, cy - 12); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy + 16); ctx.lineTo(cx - 3, cy + 12); ctx.lineTo(cx + 3, cy + 12); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 16, cy); ctx.lineTo(cx - 12, cy - 3); ctx.lineTo(cx - 12, cy + 3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 16, cy); ctx.lineTo(cx + 12, cy - 3); ctx.lineTo(cx + 12, cy + 3); ctx.closePath(); ctx.fill();
      // 마름모 몸체
      const diamond = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy, 14);
      diamond.addColorStop(0,    '#ff3333');
      diamond.addColorStop(0.35, '#cc0000');
      diamond.addColorStop(0.7,  '#770000');
      diamond.addColorStop(1,    '#2d0000');
      ctx.fillStyle = diamond;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13); ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx, cy + 13); ctx.lineTo(cx - 13, cy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1a0000'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13); ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx, cy + 13); ctx.lineTo(cx - 13, cy);
      ctx.closePath(); ctx.stroke();
      // 내부 하이라이트 마름모
      ctx.strokeStyle = 'rgba(255,110,110,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 7); ctx.lineTo(cx + 7, cy);
      ctx.lineTo(cx, cy + 7); ctx.lineTo(cx - 7, cy);
      ctx.closePath(); ctx.stroke();
      // 눈
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 3.5, cy - 1, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3.5, cy - 1, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff0000';
      ctx.beginPath(); ctx.arc(cx - 3.5, cy - 1, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 3.5, cy - 1, 1.3, 0, Math.PI * 2); ctx.fill();
      // 중앙 에너지 코어
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
      core.addColorStop(0, 'rgba(255,160,100,0.85)');
      core.addColorStop(1, 'rgba(255,50,50,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    });

    // ── 투사체: 불꽃 (16×16) ────────────────────────────────────────
    tex('proj_fire', 16, 16, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      // 외곽 글로우
      const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 8);
      glow.addColorStop(0, 'rgba(255,180,0,0)');
      glow.addColorStop(1, 'rgba(255,80,0,0.3)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
      // 불꽃 코어
      const fire = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5.5);
      fire.addColorStop(0,    '#ffffff');
      fire.addColorStop(0.25, '#ffee66');
      fire.addColorStop(0.6,  '#ff6600');
      fire.addColorStop(1,    '#cc2200');
      ctx.fillStyle = fire; ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx.fill();
    });

    // ── 투사체: 수구 (18×18) ────────────────────────────────────────
    tex('proj_water', 18, 18, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      // 외곽 글로우
      const glow = ctx.createRadialGradient(cx, cy, 3, cx, cy, 9);
      glow.addColorStop(0, 'rgba(100,200,255,0)');
      glow.addColorStop(1, 'rgba(0,100,200,0.25)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
      // 수구 코어
      const water = ctx.createRadialGradient(cx - 1, cy - 1, 1, cx, cy, 7);
      water.addColorStop(0,   '#ccefff');
      water.addColorStop(0.3, '#44aaff');
      water.addColorStop(0.7, '#0066cc');
      water.addColorStop(1,   '#003377');
      ctx.fillStyle = water; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      // 렌즈 반짝임
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath(); ctx.ellipse(cx - 2, cy - 2, 2.5, 1.5, -0.5, 0, Math.PI * 2); ctx.fill();
    });

    // ── 투사체: 화살 (22×10) ────────────────────────────────────────
    tex('proj_arrow', 22, 10, (ctx, w, h) => {
      const cy = h / 2;
      // 화살대
      ctx.fillStyle = '#7a5c2e';
      ctx.fillRect(3, cy - 1, 15, 2);
      // 깃털
      ctx.fillStyle = '#44aa22';
      ctx.beginPath(); ctx.moveTo(3, cy); ctx.lineTo(8, cy - 3); ctx.lineTo(8, cy); ctx.fill();
      ctx.beginPath(); ctx.moveTo(3, cy); ctx.lineTo(8, cy + 3); ctx.lineTo(8, cy); ctx.fill();
      // 화살촉
      ctx.fillStyle = '#ccee88';
      ctx.beginPath(); ctx.moveTo(22, cy); ctx.lineTo(16, cy - 3); ctx.lineTo(16, cy + 3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#668800'; ctx.lineWidth = 0.8; ctx.stroke();
    });

    // ── XP 젬 (14×14) ───────────────────────────────────────────────
    tex('xp_gem', 14, 14, (ctx, w, h) => {
      const cx = w / 2, cy = h / 2;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0,   '#88ffee');
      grad.addColorStop(0.5, '#00ddbb');
      grad.addColorStop(1,   '#007766');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(w, cy); ctx.lineTo(cx, h); ctx.lineTo(0, cy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#004433'; ctx.lineWidth = 1; ctx.stroke();
      // 반짝임
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(cx, 1.5); ctx.lineTo(cx + 3.5, cy - 1); ctx.lineTo(cx, cy - 1); ctx.lineTo(cx - 3, cy * 0.6);
      ctx.closePath(); ctx.fill();
    });

    // ── 배경 타일 (64×64) ───────────────────────────────────────────
    tex('bg_tile', 64, 64, (ctx, w, h) => {
      ctx.fillStyle = '#070d07'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(20,50,20,0.5)'; ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
      ctx.strokeStyle = 'rgba(15,38,15,0.3)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
      const vgn = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, 38);
      vgn.addColorStop(0, 'rgba(20,50,15,0.08)');
      vgn.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vgn; ctx.fillRect(0, 0, w, h);
    });

    // ── FX 텍스처 (링/파티클 — Phaser Graphics 유지) ─────────────────
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.lineStyle(3, 0xff6600, 1); g.strokeCircle(16, 16, 14);
    g.lineStyle(1, 0xff2200, 0.5); g.strokeCircle(16, 16, 10);
    g.generateTexture('fx_explode', 32, 32); g.clear();

    g.lineStyle(2, 0x44aaff, 1); g.strokeCircle(16, 16, 14);
    g.lineStyle(1, 0x0066cc, 0.6); g.strokeCircle(16, 16, 9);
    g.generateTexture('fx_ripple', 32, 32); g.clear();

    g.lineStyle(3, 0x44ff44, 1); g.strokeCircle(16, 16, 14);
    g.lineStyle(2, 0x226622, 0.8); g.strokeCircle(16, 16, 10);
    g.generateTexture('fx_root', 32, 32); g.clear();

    g.fillStyle(0xffffff); g.fillCircle(4, 4, 4);
    g.generateTexture('fx_spark', 8, 8); g.clear();

    g.fillStyle(0xff8800); g.fillCircle(3, 3, 3);
    g.generateTexture('fx_ember', 6, 6); g.clear();

    g.fillStyle(0x66ccff); g.fillCircle(3, 3, 3);
    g.generateTexture('fx_drop', 6, 6); g.clear();

    g.fillStyle(0x88ff44); g.fillTriangle(4, 0, 7, 18, 1, 18);
    g.generateTexture('fx_rain_arrow', 8, 18); g.clear();

    g.fillStyle(0x88ddff); g.fillCircle(4, 4, 4);
    g.generateTexture('fx_chain_node', 8, 8); g.clear();

    // ── 무기/패시브 아이콘 ───────────────────────────────────────────
    for (const [id, def] of Object.entries(WEAPONS)) {
      g.fillStyle(def.color); g.fillCircle(16, 16, 14);
      g.fillStyle(0xffffff, 0.3); g.fillCircle(12, 12, 6);
      g.generateTexture(`icon_${id}`, 32, 32); g.clear();
    }
    for (const [id, def] of Object.entries(PASSIVES)) {
      g.fillStyle(def.color); g.fillRect(4, 4, 24, 24);
      g.fillStyle(0xffffff, 0.2); g.fillRect(6, 6, 10, 10);
      g.generateTexture(`icon_${id}`, 32, 32); g.clear();
    }

    g.destroy();
    this.scene.start('GameScene');
  }
}
