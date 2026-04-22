export default class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }); }

  init(data) { this.result = data; }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const r = this.result;

    this.add.rectangle(W/2, H/2, W, H, 0x050a05);

    const title = r.victory ? 'VICTORY' : 'DEFEATED';
    const color = r.victory ? '#ccff44' : '#ff4444';

    this.add.text(W/2, H * 0.25, title, {
      fontSize: '56px', fontFamily: 'monospace', color,
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);

    const m = Math.floor(r.elapsed / 60).toString().padStart(2, '0');
    const s = (r.elapsed % 60).toString().padStart(2, '0');

    const stats = [
      `생존 시간: ${m}:${s}`,
      `도달 레벨: Lv.${r.level}`,
      `처치 수:   ${r.kills.toLocaleString()}`,
      `골드:      ${r.gold}`,
    ];

    stats.forEach((line, i) => {
      this.add.text(W/2, H * 0.45 + i * 34, line, {
        fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(0.5);
    });

    // 다시 시작 버튼
    const btn = this.add.text(W/2, H * 0.78, '[ 다시 시작 ]', {
      fontSize: '24px', fontFamily: 'monospace', color: '#ccff44',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setColor('#ffffff'));
    btn.on('pointerout',   () => btn.setColor('#ccff44'));
    btn.on('pointerdown',  () => this.scene.start('GameScene'));
  }
}
