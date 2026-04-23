import { ENEMIES, WEAPONS, PASSIVES, getSpawnRate, xpRequired, MAX_ENEMIES } from '../data/defs.js';

const RUN_DURATION = 20 * 60;

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  // ── 초기화 ────────────────────────────────────────────────────────────
  create() {
    this.physics.world.setBounds(-2000, -2000, 4000, 4000);

    this.add.tileSprite(0, 0, 8000, 8000, 'bg_tile').setOrigin(0.5);

    // ── 플레이어 스탯 ─────────────────────────────────────────────────
    this.ps = {
      maxHp: 100, hp: 100, hpRegen: 0,
      moveSpeed: 180, damageMultiplier: 1,
      xp: 0, level: 1, xpToNext: xpRequired(1),
      kills: 0, gold: 0,
      projBonus: 0, areaMultiplier: 1,
      iframes: 0,
    };

    // ── 플레이어 ──────────────────────────────────────────────────────
    this.player = this.physics.add.sprite(0, 0, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // ── 무기 ──────────────────────────────────────────────────────────
    this.equippedWeapons  = [];
    this.equippedPassives = [];
    this.addWeapon('ember_shard');

    // ── 그룹 ──────────────────────────────────────────────────────────
    this.enemies     = this.physics.add.group({ maxSize: MAX_ENEMIES });
    this.projectiles = this.physics.add.group({ maxSize: 500, runChildUpdate: false });
    this.xpGems      = this.physics.add.group({ maxSize: 600 });
    this.shadowGraphics = this.add.graphics().setDepth(1);

    // ── 충돌 ──────────────────────────────────────────────────────────
    this.physics.add.overlap(this.projectiles, this.enemies,  this.onProjHitEnemy,  null, this);
    this.physics.add.overlap(this.player,      this.enemies,  this.onPlayerHitEnemy, null, this);
    this.physics.add.overlap(this.player,      this.xpGems,  this.onCollectXP,     null, this);

    // ── 카메라 / 입력 ──────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1.2);

    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      up2: 'UP', down2: 'DOWN', left2: 'LEFT', right2: 'RIGHT',
    });

    this.gameTime     = 0;
    this.spawnAccum   = 0;
    this.isOver       = false;
    this.isPaused     = false;
    this.activeBoss   = null;
    this.spawnedBosses = new Set();
    this.ps.riptideBuff = 0;
    this.enrageLevel = 0;

    this.pauseKey = this.input.keyboard.addKey('ESC');
    this.pKey     = this.input.keyboard.addKey('P');

    this.scene.launch('HUDScene');
    this.hud = this.scene.get('HUDScene');
  }

  // ── 매 프레임 ─────────────────────────────────────────────────────────
  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.pKey)) {
      if (!this.isOver) this.togglePause();
      return;
    }
    if (this.isOver || this.isPaused) return;

    const dt = delta / 1000;
    this.gameTime += dt;
    if (this.gameTime >= RUN_DURATION) { this.endGame(true); return; }

    const newEnrage = Math.floor(this.gameTime / 300);
    if (newEnrage > this.enrageLevel) {
      this.enrageLevel = newEnrage;
      this.showEnrageWarning(this.enrageLevel);
    }

    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateWeapons(dt);
    this.updateXPGems();
    this.drawShadows();
    this.spawnEnemies(dt);
    this.checkBossSpawns();
    this.updateHpRegen(dt);
    if (this.ps.iframes   > 0) this.ps.iframes   -= dt;
    if (this.ps.riptideBuff > 0) this.ps.riptideBuff -= dt;
  }

  togglePause() {
    if (this.scene.isActive('LevelUpScene')) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) { this.physics.pause(); } else { this.physics.resume(); }
  }

  // ── 플레이어 이동 ──────────────────────────────────────────────────────
  updatePlayer(dt) {
    const k = this.keys;
    let vx = 0, vy = 0;
    if (k.left.isDown  || k.left2.isDown)  vx -= 1;
    if (k.right.isDown || k.right2.isDown) vx += 1;
    if (k.up.isDown    || k.up2.isDown)    vy -= 1;
    if (k.down.isDown  || k.down2.isDown)  vy += 1;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    this.player.setVelocity(vx * this.ps.moveSpeed, vy * this.ps.moveSpeed);
    this.player.setDepth(3 + (this.player.y + 2000) * 0.005 + 0.5);
  }

  updateHpRegen(dt) {
    if (this.ps.hpRegen > 0 && this.ps.hp < this.ps.maxHp)
      this.ps.hp = Math.min(this.ps.maxHp, this.ps.hp + this.ps.hpRegen * dt);
  }

  getEnrageMult() { return 1 + this.enrageLevel * 0.15; }

  showEnrageWarning(level) {
    this.cameras.main.shake(300, 0.02);
    const txt = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 60,
      `⚠ ENRAGE Lv.${level}  적 강화 +${level * 15}%`,
      { fontSize: '22px', fontFamily: 'monospace', color: '#ff4400', stroke: '#000', strokeThickness: 4 }
    ).setDepth(50).setOrigin(0.5).setScrollFactor(0);
    this.tweens.add({
      targets: txt,
      y: this.cameras.main.height / 2 - 110,
      alpha: 0,
      duration: 2500, ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  // ── 보스 스폰 ─────────────────────────────────────────────────────────
  checkBossSpawns() {
    const minutes = this.gameTime / 60;
    for (const def of Object.values(ENEMIES)) {
      if (!def.isBoss) continue;
      if (minutes >= def.spawnMinute && !this.spawnedBosses.has(def.id)) {
        if (this.spawnBoss(def)) this.spawnedBosses.add(def.id);
      }
    }
  }

  spawnBoss(def, hpBoost = 1) {
    const pos = this.getSpawnPos();
    const e = this.enemies.get(pos.x, pos.y, def.id);
    if (!e) return false;
    const minutes = this.gameTime / 60;
    const hpMult = 1 + def.hpScale * minutes;
    e.setActive(true).setVisible(true).setDepth(6);
    e.setCircle(def.radius);
    e.def = def;
    e.hp = def.hp * hpMult * hpBoost;
    e.maxHp = e.hp;
    e.contactCooldown = 0;
    e.slowTimer = 0; e.slowAmount = 0;
    e.burnTimer = 0; e.burnDmg = 0; e.burnAccum = 0;
    e.rootTimer = 0;
    this.activeBoss = e;
    this.cameras.main.shake(500, 0.025);
    return true;
  }

  // ── 적 스폰 ────────────────────────────────────────────────────────────
  spawnEnemies(dt) {
    const minutes = this.gameTime / 60;
    const rate = getSpawnRate(minutes);
    this.spawnAccum += rate * dt;
    while (this.spawnAccum >= 1 && this.enemies.getLength() < MAX_ENEMIES) {
      this.spawnAccum -= 1;
      this.spawnOneEnemy(minutes);
    }
  }

  spawnOneEnemy(minutes) {
    const candidates = Object.values(ENEMIES).filter(d => !d.isBoss && minutes >= d.minMinute);
    if (!candidates.length) return;

    const totalW = candidates.reduce((s, d) => s + d.spawnWeight, 0);
    let roll = Math.random() * totalW;
    let def = candidates[0];
    for (const d of candidates) { roll -= d.spawnWeight; if (roll <= 0) { def = d; break; } }

    const pos = this.getSpawnPos();
    const e = this.enemies.get(pos.x, pos.y, def.id);
    if (!e) return;

    const hpMult = 1 + def.hpScale * minutes;
    e.setActive(true).setVisible(true).setDepth(5);
    e.setCircle(def.radius);
    e.def = def;
    e.hp = def.hp * hpMult;
    e.maxHp = e.hp;
    e.contactCooldown = 0;
    e.slowTimer  = 0; e.slowAmount = 0;
    e.burnTimer  = 0; e.burnDmg   = 0; e.burnAccum = 0;
    e.rootTimer  = 0;
  }

  getSpawnPos() {
    const cam = this.cameras.main;
    const hw = (cam.width  / cam.zoom) / 2 + 60;
    const hh = (cam.height / cam.zoom) / 2 + 60;
    const cx = this.player.x, cy = this.player.y;
    const side = Phaser.Math.Between(0, 3);
    switch (side) {
      case 0: return { x: cx + Phaser.Math.FloatBetween(-hw, hw), y: cy - hh };
      case 1: return { x: cx + Phaser.Math.FloatBetween(-hw, hw), y: cy + hh };
      case 2: return { x: cx - hw, y: cy + Phaser.Math.FloatBetween(-hh, hh) };
      default: return { x: cx + hw, y: cy + Phaser.Math.FloatBetween(-hh, hh) };
    }
  }

  // ── 적 업데이트 ────────────────────────────────────────────────────────
  updateEnemies(dt) {
    const px = this.player.x, py = this.player.y;
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (e.contactCooldown > 0) e.contactCooldown -= dt;

      // ── 상태이상 틱 ──────────────────────────────────────────────
      if (e.burnTimer > 0) {
        e.burnTimer -= dt;
        e.burnAccum += dt;
        if (e.burnAccum >= 0.5) {
          e.burnAccum -= 0.5;
          this.damageEnemy(e, e.burnDmg, e.x, e.y - 8);
          if (e.active) {
            e.setTint(0xff6600);
            this.time.delayedCall(120, () => { if (e.active) this.refreshEnemyTint(e); });
          }
        }
        if (e.burnTimer <= 0) { e.burnTimer = 0; if (e.active) this.refreshEnemyTint(e); }
      }

      if (e.slowTimer > 0) e.slowTimer -= dt;

      // ── 이동: 속박 중이면 정지 ───────────────────────────────────
      if (e.rootTimer > 0) {
        e.rootTimer -= dt;
        e.setVelocity(0, 0);
        if (e.rootTimer <= 0) { e.rootTimer = 0; if (e.active) this.refreshEnemyTint(e); }
      } else {
        const slow  = e.slowTimer > 0 ? (1 - e.slowAmount) : 1;
        const angle = Phaser.Math.Angle.Between(e.x, e.y, px, py);
        const spd   = e.def.speed * slow * this.getEnrageMult();
        e.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
      }
      e.setDepth(3 + (e.y + 2000) * 0.005);
    });
  }

  // 상태이상 우선순위에 맞는 틴트 복원
  refreshEnemyTint(e) {
    if (!e.active) return;
    if (e.rootTimer  > 0) { e.setTint(0x44ff88); return; }
    if (e.slowTimer  > 0) { e.setTint(0x6699ff); return; }
    if (e.burnTimer  > 0) return; // 번 틱이 따로 처리
    e.clearTint();
  }

  // ── 무기 업데이트 ──────────────────────────────────────────────────────
  updateWeapons(dt) {
    for (const w of this.equippedWeapons) {
      w.timer -= dt;
      if (w.timer <= 0) {
        const stat = w.def.levels[w.level - 1];
        w.timer = stat.cooldown;
        this.fireWeapon(w, stat);
      }
      // 화살비 (root_arrow 고레벨)
      if (w.def.id === 'root_arrow') {
        const stat = w.def.levels[w.level - 1];
        if (stat.rain) {
          w.rainTimer = (w.rainTimer || 0) - dt;
          if (w.rainTimer <= 0) { w.rainTimer = 2.5; this.fireArrowRain(stat); }
        }
      }
    }
    this.projectiles.getChildren().forEach(p => {
      if (!p.active) return;
      p.lifetime -= dt;
      if (p.lifetime <= 0) this.returnProj(p);
    });
  }

  fireWeapon(w, stat) {
    const target = this.getNearestEnemy();
    if (!target) return;

    const count     = stat.projCount + this.ps.projBonus;
    const spread    = count > 1 ? 15 : 0;
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const projKey   = w.def.id === 'ember_shard' ? 'proj_fire'
                    : w.def.id === 'tide_pulse'  ? 'proj_water'
                    : 'proj_arrow';

    // riptide: 감속 킬 시 Tide Pulse 관통+2
    const riptideBonus = (w.def.id === 'tide_pulse' && this.ps.riptideBuff > 0) ? 2 : 0;

    for (let i = 0; i < count; i++) {
      const offset = count > 1 ? -spread + (spread * 2 / (count - 1)) * i : 0;
      const angle  = baseAngle + Phaser.Math.DegToRad(offset);
      this.spawnProjectile(projKey, this.player.x, this.player.y, angle, stat.speed, {
        damage:   Math.round(stat.damage * this.ps.damageMultiplier),
        pierce:   (stat.pierce || 0) + riptideBonus,
        lifetime: 5,
        weaponId: w.def.id,
        stat,
      });
    }
  }

  spawnProjectile(key, x, y, angle, speed, props) {
    const p = this.projectiles.get(x, y, key);
    if (!p) return null;
    p.setActive(true).setVisible(true).setDepth(25);
    p.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    Object.assign(p, { hitCount: 0, isSplit: false }, props);
    return p;
  }

  fireArrowRain(stat) {
    const cam  = this.cameras.main;
    const hw   = (cam.width  / cam.zoom) / 2;
    const topY = this.player.y - (cam.height / cam.zoom) / 2 - 60;
    for (let i = 0; i < 8; i++) {
      const rx = this.player.x + Phaser.Math.FloatBetween(-hw * 0.85, hw * 0.85);
      this.spawnProjectile('fx_rain_arrow', rx, topY,
        Math.PI / 2 + Phaser.Math.FloatBetween(-0.05, 0.05), 480, {
          damage:   Math.round(stat.damage * 0.55 * this.ps.damageMultiplier),
          pierce:   1, lifetime: 3,
          weaponId: 'root_arrow', stat,
          isSplit:  true,
        });
    }
  }

  returnProj(p) {
    p.setActive(false).setVisible(false);
    p.setVelocity(0, 0);
    this.projectiles.killAndHide(p);
  }

  getNearestEnemy() {
    let best = Infinity, result = null;
    const px = this.player.x, py = this.player.y;
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Squared(px, py, e.x, e.y);
      if (d < best) { best = d; result = e; }
    });
    return result;
  }

  // ── 충돌: 투사체 → 적 ─────────────────────────────────────────────────
  onProjHitEnemy(proj, enemy) {
    if (!proj.active || !enemy.active) return;

    const stat = proj.stat || {};
    const wid  = proj.weaponId;

    // ember_heart: 화상 중인 적에게 Ember Shard 추가 피해
    let dmg = proj.damage;
    if (wid === 'ember_shard' && enemy.burnTimer > 0) {
      const eh = this.equippedPassives.find(p => p.def.id === 'ember_heart');
      if (eh) {
        dmg = Math.round(dmg * (1 + PASSIVES.ember_heart.values[eh.level - 1]));
        this.showDamageNumber(dmg, proj.x, proj.y, '#ff6600'); // 주황 숫자
        this.damageEnemy(enemy, dmg, proj.x, proj.y, true);    // 숫자 이미 표시됨
      } else {
        this.damageEnemy(enemy, dmg, proj.x, proj.y);
      }
    } else {
      this.damageEnemy(enemy, dmg, proj.x, proj.y);
    }

    this.createHitEffect(wid, proj.x, proj.y);

    // ── EmberShard ────────────────────────────────────────────────
    if (wid === 'ember_shard') {
      if (stat.burn && enemy.active) {
        enemy.burnTimer = 4;
        enemy.burnDmg   = Math.max(1, Math.round(dmg * 0.15));
        enemy.burnAccum = 0;
      }
      if (stat.explode) {
        this.createExplodeAoe(proj.x, proj.y, dmg);
      }
    }

    // ── TidePulse ─────────────────────────────────────────────────
    if (wid === 'tide_pulse') {
      if (stat.slow && enemy.active) {
        enemy.slowTimer  = 3;
        enemy.slowAmount = stat.slow;
        this.refreshEnemyTint(enemy);
      }
      if (stat.chain) {
        this.createChainEffect(enemy, stat.chain, Math.round(dmg * 0.55), stat);
      }
    }

    // ── RootArrow ─────────────────────────────────────────────────
    if (wid === 'root_arrow') {
      if (stat.root && enemy.active) {
        enemy.rootTimer = stat.root;
        this.refreshEnemyTint(enemy);
        this.createRootEffect(proj.x, proj.y);
      }
      if (stat.split && !proj.isSplit) {
        this.createSplitArrows(proj.x, proj.y, dmg, stat.split);
      }
    }

    proj.hitCount++;
    if (proj.hitCount > proj.pierce) this.returnProj(proj);
  }

  damageEnemy(enemy, dmg, x, y, skipNumber = false) {
    if (!enemy.active) return;
    enemy.hp -= dmg;
    if (!skipNumber) this.showDamageNumber(dmg, x, y);

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    } else {
      // 피격 플래시 (흰색 → 상태이상 틴트로 복원)
      enemy.setTint(0xffffff);
      this.time.delayedCall(100, () => { if (enemy.active) this.refreshEnemyTint(enemy); });
    }
  }

  killEnemy(enemy) {
    if (enemy.def.isBoss) {
      if (this.activeBoss === enemy) this.activeBoss = null;
      const bossDef = enemy.def;
      this.time.delayedCall(3 * 60 * 1000, () => {
        if (!this.isOver) this.spawnBoss(bossDef, 1.5);
      });
    }

    // riptide: 감속 중 처치 시 Tide Pulse 관통+2 버프
    if (enemy.slowTimer > 0) {
      const rt = this.equippedPassives.find(p => p.def.id === 'riptide');
      if (rt) this.ps.riptideBuff = PASSIVES.riptide.values[rt.level - 1];
    }

    this.ps.kills++;
    this.ps.gold += enemy.def.gold;
    this.addXP(enemy.def.xp);

    const gemCount = enemy.def.isBoss ? 12 : enemy.def.isElite ? 3 : 1;
    for (let i = 0; i < gemCount; i++) {
      const gem = this.xpGems.get(
        enemy.x + Phaser.Math.FloatBetween(-15, 15),
        enemy.y + Phaser.Math.FloatBetween(-15, 15),
        'xp_gem'
      );
      if (gem) {
        gem.setActive(true).setVisible(true).setDepth(2);
        gem.xpValue = enemy.def.xp / gemCount;
      }
    }

    enemy.setActive(false).setVisible(false);
    this.enemies.killAndHide(enemy);
  }

  // ── 충돌: 플레이어 ↔ 적 ──────────────────────────────────────────────
  onPlayerHitEnemy(player, enemy) {
    if (!enemy.active || this.ps.iframes > 0) return;
    if (enemy.contactCooldown > 0) return;

    enemy.contactCooldown = enemy.def.contactCooldown;
    this.ps.hp -= Math.round(enemy.def.damage * this.getEnrageMult());
    this.ps.iframes = 0.5;
    this.cameras.main.shake(150, 0.012);
    this.player.setTint(0xff4444);
    this.time.delayedCall(200, () => this.player.clearTint());

    // spore_membrane: 피격 시 반경 90 포자 폭발
    const sm = this.equippedPassives.find(p => p.def.id === 'spore_membrane');
    if (sm) this.createSporeExplosion(this.player.x, this.player.y,
                                      PASSIVES.spore_membrane.values[sm.level - 1]);

    if (this.ps.hp <= 0) { this.ps.hp = 0; this.endGame(false); }
  }

  // ── XP 젬 ─────────────────────────────────────────────────────────────
  updateXPGems() {
    const collectRange = 80;
    const px = this.player.x, py = this.player.y;
    this.xpGems.getChildren().forEach(gem => {
      if (!gem.active) return;
      const d = Phaser.Math.Distance.Between(px, py, gem.x, gem.y);
      if (d < collectRange) {
        const angle = Phaser.Math.Angle.Between(gem.x, gem.y, px, py);
        gem.x += Math.cos(angle) * 8;
        gem.y += Math.sin(angle) * 8;
        if (d < 12) this.xpGems.killAndHide(gem);
      }
    });
  }

  onCollectXP(player, gem) {
    if (!gem.active) return;
    this.addXP(gem.xpValue || 2);
    this.xpGems.killAndHide(gem);
  }

  addXP(amount) {
    this.ps.xp += amount;
    if (this.ps.xp >= this.ps.xpToNext) {
      this.ps.xp -= this.ps.xpToNext;
      this.ps.level++;
      this.ps.xpToNext = xpRequired(this.ps.level);
      this.onLevelUp();
    }
  }

  onLevelUp() {
    this.physics.pause();
    this.scene.launch('LevelUpScene', { gameScene: this });
    this.scene.bringToTop('LevelUpScene');
  }

  resumeFromLevelUp() { if (!this.isPaused) this.physics.resume(); }

  // ── 무기/패시브 관리 ──────────────────────────────────────────────────
  addWeapon(weaponId) {
    const def = WEAPONS[weaponId];
    if (!def) return;
    const existing = this.equippedWeapons.find(w => w.def.id === weaponId);
    if (existing) {
      if (existing.level < def.maxLevel) existing.level++;
    } else {
      this.equippedWeapons.push({ def, level: 1, timer: 0 });
    }
  }

  addPassive(passiveId) {
    const def = PASSIVES[passiveId];
    if (!def) return;
    const existing = this.equippedPassives.find(p => p.def.id === passiveId);
    const level  = existing ? existing.level : 0;
    const nextVal = def.values[level] || 0;

    if (existing) { existing.level++; }
    else { this.equippedPassives.push({ def, level: 1 }); }

    switch (passiveId) {
      case 'thick_bark':     this.ps.maxHp += nextVal; this.ps.hp = Math.min(this.ps.hp + nextVal, this.ps.maxHp); break;
      case 'photosynthesis': this.ps.hpRegen += nextVal; break;
      case 'toxin_sac':      this.ps.damageMultiplier += nextVal; break;
      case 'overgrowth':     this.ps.projBonus += nextVal; break;
      case 'spore_membrane':
      case 'ember_heart':
      case 'riptide':        break; // 이벤트 기반 — 즉시 스탯 변화 없음
    }
  }

  // ── 그림자 ────────────────────────────────────────────────────────────
  drawShadows() {
    const cam = this.cameras.main;
    const hw = (cam.width  / cam.zoom) / 2 + 80;
    const hh = (cam.height / cam.zoom) / 2 + 80;
    const px = this.player.x, py = this.player.y;
    this.shadowGraphics.clear();
    this.shadowGraphics.fillStyle(0x000000, 0.28);
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (Math.abs(e.x - px) > hw || Math.abs(e.y - py) > hh) return;
      const r = e.def.radius;
      this.shadowGraphics.fillEllipse(e.x + r * 0.2, e.y + r * 0.65, r * 2.0, r * 0.65);
    });
    this.shadowGraphics.fillEllipse(px + 3, py + 13, 30, 10);
  }

  // ── 이펙트: 공통 ──────────────────────────────────────────────────────
  createHitEffect(weaponId, x, y) {
    if (weaponId === 'ember_shard') {
      // 불꽃 링
      const ring = this.add.image(x, y, 'fx_explode').setScale(0.25).setDepth(30);
      this.tweens.add({
        targets: ring, scale: 1.2, alpha: 0,
        duration: 320, ease: 'Power2',
        onComplete: () => ring.destroy(),
      });
      // 불꽃 파편
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i / 5) + Math.random() * 0.6;
        const em = this.add.image(x, y, 'fx_ember').setDepth(30);
        this.tweens.add({
          targets: em,
          x: x + Math.cos(angle) * 32, y: y + Math.sin(angle) * 32,
          alpha: 0, scale: 0.4,
          duration: 380, ease: 'Power2',
          onComplete: () => em.destroy(),
        });
      }

    } else if (weaponId === 'tide_pulse') {
      // 물결 링
      const ring = this.add.image(x, y, 'fx_ripple').setScale(0.25).setDepth(30);
      this.tweens.add({
        targets: ring, scale: 1.3, alpha: 0,
        duration: 400, ease: 'Sine.easeOut',
        onComplete: () => ring.destroy(),
      });
      // 물방울 파편
      for (let i = 0; i < 4; i++) {
        const drop = this.add.image(
          x + Phaser.Math.FloatBetween(-10, 10),
          y + Phaser.Math.FloatBetween(-6, 6),
          'fx_drop'
        ).setDepth(30);
        this.tweens.add({
          targets: drop, y: drop.y - 28, alpha: 0,
          duration: 480, ease: 'Sine.easeOut',
          onComplete: () => drop.destroy(),
        });
      }

    } else {
      // root_arrow: 스파크 방사
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i / 6);
        const sp = this.add.image(x, y, 'fx_spark').setScale(0.7).setDepth(30);
        this.tweens.add({
          targets: sp,
          x: x + Math.cos(angle) * 26, y: y + Math.sin(angle) * 26,
          alpha: 0, scale: 0.25,
          duration: 280, ease: 'Power2',
          onComplete: () => sp.destroy(),
        });
      }
    }
  }

  createRootEffect(x, y) {
    const ring = this.add.image(x, y, 'fx_root').setScale(0.35).setDepth(30);
    this.tweens.add({
      targets: ring, scale: 1.1, alpha: 0,
      duration: 500, ease: 'Power1',
      onComplete: () => ring.destroy(),
    });
  }

  createExplodeAoe(x, y, baseDmg) {
    const radius = 80 * this.ps.areaMultiplier;

    // 큰 폭발 링
    const ring = this.add.image(x, y, 'fx_explode').setScale(0.15).setDepth(30);
    this.tweens.add({
      targets: ring, scale: radius / 14, alpha: 0,
      duration: 480, ease: 'Power2',
      onComplete: () => ring.destroy(),
    });
    // 방사형 불씨
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i / 8);
      const em = this.add.image(x, y, 'fx_ember').setDepth(30);
      this.tweens.add({
        targets: em,
        x: x + Math.cos(angle) * radius * 0.7,
        y: y + Math.sin(angle) * radius * 0.7,
        alpha: 0, scale: 0.3,
        duration: 500, ease: 'Power1',
        onComplete: () => em.destroy(),
      });
    }
    // AoE 데미지
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (Phaser.Math.Distance.Between(x, y, e.x, e.y) < radius)
        this.damageEnemy(e, Math.round(baseDmg * 0.45), x, y);
    });
  }

  createChainEffect(fromEnemy, chainCount, dmg, stat) {
    const chainRadius = 220;
    let current = fromEnemy;
    const chained = new Set([fromEnemy]);

    for (let i = 0; i < chainCount; i++) {
      let nearest = null, nearestDist = chainRadius;
      this.enemies.getChildren().forEach(e => {
        if (!e.active || chained.has(e)) return;
        const d = Phaser.Math.Distance.Between(current.x, current.y, e.x, e.y);
        if (d < nearestDist) { nearestDist = d; nearest = e; }
      });
      if (!nearest) break;

      // 체인 번개 선
      const ln = current, nt = nearest;
      const g = this.add.graphics().setDepth(31);
      g.lineStyle(2, 0x44aaff, 0.9);
      g.lineBetween(ln.x, ln.y, nt.x, nt.y);
      const node = this.add.image(nt.x, nt.y, 'fx_chain_node').setScale(0.8).setDepth(31);
      // 물결 이펙트
      const rip = this.add.image(nt.x, nt.y, 'fx_ripple').setScale(0.2).setDepth(30);
      this.tweens.add({ targets: rip, scale: 0.9, alpha: 0, duration: 350, onComplete: () => rip.destroy() });
      this.tweens.add({ targets: [g, node], alpha: 0, duration: 280, onComplete: () => { g.destroy(); node.destroy(); } });

      this.damageEnemy(nearest, dmg, nearest.x, nearest.y);
      if (nearest.active) {
        nearest.slowTimer  = 3;
        nearest.slowAmount = stat.slow;
        this.refreshEnemyTint(nearest);
      }

      chained.add(nearest);
      current = nearest;
    }
  }

  // ── spore_membrane: 피격 시 반경 90 포자 폭발 ────────────────────────
  createSporeExplosion(x, y, dmg) {
    const radius = 90;
    // 포자 링 (노랑-초록 계열, fx_root 재사용 + 틴트)
    const ring = this.add.image(x, y, 'fx_root').setScale(0.2).setTint(0xccff44).setDepth(30);
    this.tweens.add({
      targets: ring, scale: radius / 14, alpha: 0,
      duration: 420, ease: 'Power2',
      onComplete: () => ring.destroy(),
    });
    // 포자 파편
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i / 7);
      const sp = this.add.image(x, y, 'fx_spark').setTint(0xaaff44).setScale(0.65).setDepth(30);
      this.tweens.add({
        targets: sp,
        x: x + Math.cos(angle) * radius * 0.65,
        y: y + Math.sin(angle) * radius * 0.65,
        alpha: 0, scale: 0.2,
        duration: 400, ease: 'Power1',
        onComplete: () => sp.destroy(),
      });
    }
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      if (Phaser.Math.Distance.Between(x, y, e.x, e.y) < radius)
        this.damageEnemy(e, dmg, e.x, e.y);
    });
  }

  createSplitArrows(x, y, dmg, splitCount) {
    for (let i = 0; i < splitCount; i++) {
      const angle = (Math.PI * 2 * i / splitCount);
      this.spawnProjectile('proj_arrow', x, y, angle, 300, {
        damage:   Math.round(dmg * 0.35),
        pierce:   0, lifetime: 1.6,
        weaponId: 'root_arrow', stat: {},
        isSplit:  true,
      });
    }
  }

  // ── 데미지 숫자 ───────────────────────────────────────────────────────
  showDamageNumber(dmg, x, y, color = '#ffdd44') {
    const txt = this.add.text(x, y - 10, Math.round(dmg), {
      fontSize: '14px', fontFamily: 'monospace',
      color, stroke: '#000', strokeThickness: 3,
    }).setDepth(35).setOrigin(0.5);

    this.tweens.add({
      targets: txt, y: y - 45, alpha: 0,
      duration: 700, ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  // ── 게임 종료 ─────────────────────────────────────────────────────────
  endGame(victory) {
    if (this.isOver) return;
    this.isOver = true;
    this.physics.pause();
    const elapsed = Math.floor(this.gameTime);
    this.scene.stop('HUDScene');
    this.scene.stop('LevelUpScene');
    this.scene.start('ResultScene', {
      victory, kills: this.ps.kills, gold: this.ps.gold,
      level: this.ps.level, elapsed,
    });
  }

  getMinutes() { return this.gameTime / 60; }
  getRemainingSeconds() { return Math.max(0, RUN_DURATION - this.gameTime); }
}
