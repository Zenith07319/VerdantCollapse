export default class HUDScene extends Phaser.Scene {
  constructor() { super({ key: 'HUDScene' }); }

  create() {
    this.game$ = this.scene.get('GameScene');
    const W = this.scale.width, H = this.scale.height;

    // ── HP 바 (좌상단) ──────────────────────────────────��──────────
    this.add.rectangle(14, 14, 204, 18, 0x111111).setOrigin(0).setScrollFactor(0).setDepth(100);
    this.hpFill = this.add.rectangle(16, 16, 200, 14, 0x33dd4d).setOrigin(0).setScrollFactor(0).setDepth(101);
    this.hpText = this.add.text(118, 16, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102);

    // ── XP 바 (하단 전체) ──────────────────────────────────────────
    this.add.rectangle(0, H - 14, W, 12, 0x111111).setOrigin(0).setScrollFactor(0).setDepth(100);
    this.xpFill = this.add.rectangle(0, H - 14, 0, 12, 0x11f2d6).setOrigin(0).setScrollFactor(0).setDepth(101);

    // ── 레벨 텍스트 ────────────────────────────────────────────────
    this.lvText = this.add.text(W - 8, H - 16, 'Lv.1', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ccff44',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(102);

    // ── 타이머 (상단 중앙) ─────────────────────────────────────────
    this.timerText = this.add.text(W / 2, 10, '20:00', {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102);

    // ── 웨이브 (타이머 아래) ─────────────────────────────────────────
    this.waveText = this.add.text(W / 2, 38, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffaa44',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102);

    // ── 킬 / 골드 (우상단) ────────────────────────────────────────
    this.killText = this.add.text(W - 10, 10, '☠ 0', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffcccc',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(102);

    this.goldText = this.add.text(W - 10, 28, '◆ 0', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffd700',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(102);

    // ── 무기 슬롯 (우하단) ────────────────────────────────────────
    this.weaponSlotTexts = [];
    for (let i = 0; i < 6; i++) {
      this.weaponSlotTexts.push(
        this.add.text(W - 10, H - 30 - i * 22, '', {
          fontSize: '12px', fontFamily: 'monospace', color: '#aaffaa',
        }).setOrigin(1, 1).setScrollFactor(0).setDepth(102)
      );
    }

    // ── 보스 HP 바 (하단 중앙, 기본 숨김) ────────────────────────
    const bY = H - 44;
    this.bossNameText = this.add.text(W / 2, bY - 2, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ff7777',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(102).setVisible(false);
    this.bossBg   = this.add.rectangle(W / 2, bY, 404, 18, 0x111111)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setVisible(false);
    this.bossFill = this.add.rectangle(W / 2 - 200, bY + 2, 400, 14, 0xff3333)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(101).setVisible(false);

    // ── 일시정지 오버레이 (기본 숨김) ─────────────────────────────
    this.pauseOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000)
      .setAlpha(0.65).setScrollFactor(0).setDepth(200).setVisible(false);
    this.pauseTitle = this.add.text(W / 2, H / 2 - 22, 'PAUSED', {
      fontSize: '52px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);
    this.pauseHint = this.add.text(W / 2, H / 2 + 36, 'Press [P] or [ESC] to resume', {
      fontSize: '15px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);
  }

  update() {
    const g = this.game$;
    if (!g || !g.ps) return;
    const ps = g.ps;
    const W  = this.scale.width;

    // HP 바
    const hpRatio = Math.max(0, ps.hp / ps.maxHp);
    this.hpFill.width = 200 * hpRatio;
    const hpColor = hpRatio > 0.5 ? 0x33dd4d : hpRatio > 0.25 ? 0xf2cc00 : 0xf23333;
    this.hpFill.setFillStyle(hpColor);
    this.hpText.setText(`${Math.ceil(ps.hp)} / ${ps.maxHp}`);

    // XP 바
    const xpRatio = ps.xp / ps.xpToNext;
    this.xpFill.width = W * xpRatio;

    // 레벨
    this.lvText.setText(`Lv.${ps.level}`);

    // 타이머
    const rem = g.getRemainingSeconds();
    const m   = Math.floor(rem / 60).toString().padStart(2, '0');
    const s   = Math.floor(rem % 60).toString().padStart(2, '0');
    this.timerText.setText(`${m}:${s}`);
    this.timerText.setColor(rem < 300 ? '#ff4444' : rem < 600 ? '#ffcc00' : '#ffffff');

    // 웨이브 카운터
    const wn = g.waveNumber || 0;
    if ((g.waveSpawnQueue || 0) > 0) {
      this.waveText.setText(`WAVE ${wn}  ▼ 진행 중`);
    } else if (g.enemies && g.enemies.countActive(true) > 0) {
      this.waveText.setText(`WAVE ${wn}  — 모두 처치 시 다음 웨이브`);
    } else {
      this.waveText.setText(`WAVE ${wn}  ✓ 클리어!`);
    }

    // 킬 / 골드
    this.killText.setText(`☠ ${ps.kills.toLocaleString()}`);
    this.goldText.setText(`◆ ${ps.gold}`);

    // 무기 슬롯
    const weapons = g.equippedWeapons || [];
    for (let i = 0; i < 6; i++) {
      if (i < weapons.length) {
        const w = weapons[i];
        this.weaponSlotTexts[i].setText(`${w.def.name} Lv.${w.level}`);
      } else {
        this.weaponSlotTexts[i].setText('');
      }
    }

    // 보스 HP 바
    const boss = g.activeBoss;
    const bossAlive = !!(boss && boss.active);
    this.bossBg.setVisible(bossAlive);
    this.bossFill.setVisible(bossAlive);
    this.bossNameText.setVisible(bossAlive);
    if (bossAlive) {
      const ratio = Math.max(0, boss.hp / boss.maxHp);
      this.bossFill.width = Math.round(400 * ratio);
      const col = ratio > 0.5 ? 0xff3333 : ratio > 0.25 ? 0xff6600 : 0xffcc00;
      this.bossFill.setFillStyle(col);
      this.bossNameText.setText(boss.def.name);
    }

    // 일시정지 오버레이
    const paused = !!(g.isPaused);
    this.pauseOverlay.setVisible(paused);
    this.pauseTitle.setVisible(paused);
    this.pauseHint.setVisible(paused);
  }
}
