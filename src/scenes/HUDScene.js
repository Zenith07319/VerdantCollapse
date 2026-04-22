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
  }
}
