import BootScene    from './scenes/BootScene.js';
import GameScene    from './scenes/GameScene.js';
import HUDScene     from './scenes/HUDScene.js';
import LevelUpScene from './scenes/LevelUpScene.js';
import ResultScene  from './scenes/ResultScene.js';

const config = {
  type: Phaser.AUTO,
  width:  960,
  height: 540,
  backgroundColor: '#050a05',
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, GameScene, HUDScene, LevelUpScene, ResultScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
