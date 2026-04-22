import { WEAPONS, PASSIVES } from '../data/defs.js';

export default class LevelUpScene extends Phaser.Scene {
  constructor() { super({ key: 'LevelUpScene' }); }

  init(data) { this.gameScene = data.gameScene; }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const g = this.gameScene;

    // 반투명 오버레이
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.7).setScrollFactor(0);

    // 타이틀
    this.add.text(W/2, H * 0.18, `LEVEL UP!  Lv.${g.ps.level}`, {
      fontSize: '32px', fontFamily: 'monospace', color: '#ccff44',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(W/2, H * 0.27, '업그레이드를 선택하세요', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0);

    // 선택지 3개 생성
    const options = this.buildOptions(g);
    const cardW = Math.min(200, (W - 80) / 3);
    const startX = W/2 - cardW - 20;

    options.forEach((opt, i) => {
      this.createCard(startX + i * (cardW + 20), H * 0.5, cardW, opt, g);
    });
  }

  // ── 선택지 생성 ────────────────────────────────────────────────────────
  buildOptions(g) {
    const options = [];

    // 무기 후보
    const weaponOpts = [];
    for (const [id, def] of Object.entries(WEAPONS)) {
      const existing = g.equippedWeapons.find(w => w.def.id === id);
      const canAdd   = !existing && g.equippedWeapons.length < 6;
      const canLevel = existing && existing.level < def.maxLevel;
      if (!canAdd && !canLevel) continue;

      const level = existing ? existing.level : 0;
      const stat  = def.levels[level] || def.levels[def.levels.length - 1];
      weaponOpts.push({
        type: 'weapon', id, def,
        label: existing ? `${def.name}\nLv.${level} → ${level + 1}` : `${def.name}\nNEW`,
        desc:  stat.desc || '강화',
        color: def.color,
        isNew: !existing,
      });
    }

    // 패시브 후보
    const passiveOpts = [];
    for (const [id, def] of Object.entries(PASSIVES)) {
      const existing = g.equippedPassives.find(p => p.def.id === id);
      const level    = existing ? existing.level : 0;
      if (level >= 5) continue;
      if (!existing && g.equippedPassives.length >= 6) continue;

      passiveOpts.push({
        type: 'passive', id, def,
        label: existing ? `${def.name}\nLv.${level} → ${level + 1}` : `${def.name}\nNEW`,
        desc:  def.desc,
        color: def.color,
        isNew: !existing,
      });
    }

    // 섞기
    Phaser.Utils.Array.Shuffle(weaponOpts);
    Phaser.Utils.Array.Shuffle(passiveOpts);

    // 무기 최소 1개, 패시브 최소 1개 보장
    if (weaponOpts.length)  options.push(weaponOpts.shift());
    if (passiveOpts.length) options.push(passiveOpts.shift());

    const rest = [...weaponOpts, ...passiveOpts];
    Phaser.Utils.Array.Shuffle(rest);
    while (options.length < 3 && rest.length) options.push(rest.shift());

    // 후보가 3개 미만이면 반복 채움 (극한 케이스)
    while (options.length < 3) options.push(options[0]);

    Phaser.Utils.Array.Shuffle(options);
    return options.slice(0, 3);
  }

  // ── 카드 UI ────────────────────────────────────────────────────────────
  createCard(cx, cy, w, opt, g) {
    const h = 180;
    const bg = this.add.rectangle(cx, cy, w, h, 0x1a1a22, 0.95)
      .setStrokeStyle(2, opt.color).setScrollFactor(0).setInteractive();

    // 아이콘
    const iconKey = opt.type === 'weapon' ? `icon_${opt.id}` : `icon_${opt.id}`;
    this.add.image(cx, cy - 55, iconKey).setScale(1.2).setScrollFactor(0);

    // NEW 뱃지
    if (opt.isNew) {
      this.add.text(cx + w/2 - 5, cy - h/2 + 5, 'NEW', {
        fontSize: '10px', fontFamily: 'monospace',
        backgroundColor: '#ccff44', color: '#000', padding: { x: 3, y: 1 },
      }).setOrigin(1, 0).setScrollFactor(0);
    }

    // 이름/레벨
    this.add.text(cx, cy - 15, opt.label, {
      fontSize: '13px', fontFamily: 'monospace',
      color: `#${opt.color.toString(16).padStart(6, '0')}`,
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0);

    // 설명
    this.add.text(cx, cy + 30, opt.desc, {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa',
      wordWrap: { width: w - 12 }, align: 'center',
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // 호버 효과
    bg.on('pointerover',  () => bg.setFillStyle(0x2a2a3a));
    bg.on('pointerout',   () => bg.setFillStyle(0x1a1a22));
    bg.on('pointerdown',  () => { bg.setFillStyle(0x3a3a4a); });
    bg.on('pointerup',    () => {
      this.applyUpgrade(opt, g);
    });
  }

  applyUpgrade(opt, g) {
    if (opt.type === 'weapon') {
      g.addWeapon(opt.id);
    } else {
      g.addPassive(opt.id);
    }
    g.resumeFromLevelUp();
    this.scene.stop();
  }
}
