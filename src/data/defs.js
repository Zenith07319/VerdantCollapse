// ── 적 정의 ──────────────────────────────────────────────────────────────
export const ENEMIES = {
  void_crawler: {
    id: 'void_crawler', name: 'Void Crawler',
    hp: 12, speed: 60, damage: 8, contactCooldown: 1.0,
    xp: 2, gold: 1, radius: 10,
    color: 0x9933cc, hpScale: 0.1, spawnWeight: 3,
    minMinute: 0,
  },
  spore_walker: {
    id: 'spore_walker', name: 'Spore Walker',
    hp: 30, speed: 45, damage: 12, contactCooldown: 1.0,
    xp: 5, gold: 2, radius: 14,
    color: 0x66cc33, hpScale: 0.1, spawnWeight: 2,
    minMinute: 0,
  },
  toxic_shambler: {
    id: 'toxic_shambler', name: 'Toxic Shambler',
    hp: 53, speed: 30, damage: 18, contactCooldown: 1.2,
    xp: 10, gold: 4, radius: 18,
    color: 0x336622, hpScale: 0.1, spawnWeight: 1,
    minMinute: 2,
  },
  stalker_elite: {
    id: 'stalker_elite', name: 'Stalker Elite',
    hp: 225, speed: 70, damage: 25, contactCooldown: 0.8,
    xp: 30, gold: 15, radius: 20,
    color: 0xff3366, hpScale: 0.1, spawnWeight: 0.3,
    minMinute: 3, isElite: true,
  },

  verdant_leviathan: {
    id: 'verdant_leviathan', name: 'Verdant Leviathan',
    hp: 800, speed: 55, damage: 35, contactCooldown: 0.8,
    xp: 200, gold: 50, radius: 28,
    hpScale: 0.1, spawnWeight: 0,
    isBoss: true, spawnMinute: 5,
  },
  ashen_colossus: {
    id: 'ashen_colossus', name: 'Ashen Colossus',
    hp: 2000, speed: 65, damage: 50, contactCooldown: 0.8,
    xp: 500, gold: 100, radius: 34,
    hpScale: 0.12, spawnWeight: 0,
    isBoss: true, spawnMinute: 10,
  },
  void_patriarch: {
    id: 'void_patriarch', name: 'Void Patriarch',
    hp: 5000, speed: 75, damage: 70, contactCooldown: 0.6,
    xp: 1000, gold: 200, radius: 42,
    hpScale: 0.15, spawnWeight: 0,
    isBoss: true, spawnMinute: 15,
  },
};

// ── 스폰율 곡선 (분 → 초당 스폰 수) ────────────────────────────────────
export const SPAWN_CURVE = [
  [0, 0.5], [3, 2.0], [6, 4.5], [10, 7.0],
  [15, 10.0], [18, 12.0], [20, 12.0],
];
export const MAX_ENEMIES = 350;

// ── 무기 정의 ─────────────────────────────────────────────────────────────
export const WEAPONS = {
  ember_shard: {
    id: 'ember_shard', name: 'Ember Shard', color: 0xff6600,
    maxLevel: 8,
    levels: [
      { damage: 18, cooldown: 1.4, projCount: 1, speed: 380, pierce: 0, desc: '기본 화염탄' },
      { damage: 22, cooldown: 1.3, projCount: 1, speed: 390, pierce: 1, desc: '관통+1' },
      { damage: 28, cooldown: 1.2, projCount: 2, speed: 400, pierce: 1, desc: '2발 동시' },
      { damage: 32, cooldown: 1.1, projCount: 2, speed: 410, pierce: 1, burn: true, desc: '화상 DoT 추가' },
      { damage: 38, cooldown: 1.0, projCount: 2, speed: 420, pierce: 1, burn: true, explode: true, desc: '폭발반경 확대' },
      { damage: 45, cooldown: 0.9, projCount: 3, speed: 430, pierce: 2, burn: true, explode: true, desc: '3발+폭발' },
      { damage: 55, cooldown: 0.8, projCount: 3, speed: 440, pierce: 2, burn: true, explode: true, desc: 'Pyre Ring 추가' },
      { damage: 70, cooldown: 0.7, projCount: 4, speed: 450, pierce: 3, burn: true, explode: true, desc: 'MAX: Pyre Nova' },
    ],
  },
  tide_pulse: {
    id: 'tide_pulse', name: 'Tide Pulse', color: 0x33aaff,
    maxLevel: 8,
    levels: [
      { damage: 14, cooldown: 1.2, projCount: 1, speed: 320, pierce: 0, slow: 0.3, desc: '감속 수구' },
      { damage: 17, cooldown: 1.1, projCount: 1, speed: 330, pierce: 1, slow: 0.35, desc: '관통+1' },
      { damage: 20, cooldown: 1.0, projCount: 2, speed: 340, pierce: 1, slow: 0.4, desc: '2발' },
      { damage: 24, cooldown: 0.95, projCount: 2, speed: 350, pierce: 1, slow: 0.45, chain: 1, desc: '체인1+수렁' },
      { damage: 28, cooldown: 0.85, projCount: 2, speed: 360, pierce: 2, slow: 0.5, chain: 2, desc: '체인2' },
      { damage: 34, cooldown: 0.75, projCount: 3, speed: 370, pierce: 2, slow: 0.55, chain: 3, desc: '3발+체인3' },
      { damage: 42, cooldown: 0.65, projCount: 3, speed: 380, pierce: 2, slow: 0.6, chain: 3, desc: '소용돌이' },
      { damage: 56, cooldown: 0.55, projCount: 4, speed: 390, pierce: 3, slow: 0.65, chain: 4, desc: 'MAX: Tidal Surge' },
    ],
  },
  root_arrow: {
    id: 'root_arrow', name: 'Root Arrow', color: 0x88ff44,
    maxLevel: 8,
    levels: [
      { damage: 22, cooldown: 1.6, projCount: 1, speed: 480, pierce: 1, desc: '고속 관통' },
      { damage: 28, cooldown: 1.5, projCount: 1, speed: 500, pierce: 2, desc: '관통+1' },
      { damage: 34, cooldown: 1.3, projCount: 2, speed: 520, pierce: 2, desc: '2발' },
      { damage: 38, cooldown: 1.2, projCount: 2, speed: 530, pierce: 2, split: 2, root: 1.5, desc: '분열2+속박' },
      { damage: 44, cooldown: 1.1, projCount: 2, speed: 540, pierce: 3, split: 3, root: 2.0, desc: '분열3' },
      { damage: 52, cooldown: 1.0, projCount: 3, speed: 550, pierce: 3, split: 4, root: 2.0, desc: '3발+분열4' },
      { damage: 62, cooldown: 0.85, projCount: 4, speed: 560, pierce: 4, split: 4, root: 2.5, rain: true, desc: '화살비' },
      { damage: 80, cooldown: 0.70, projCount: 5, speed: 580, pierce: 5, split: 5, root: 3.0, rain: true, desc: 'MAX: Arrow Storm' },
    ],
  },
};

// ── 패시브 정의 ───────────────────────────────────────────────────────────
export const PASSIVES = {
  // ── 범용 패시브 ────────────────────────────────────────────────────────
  thick_bark:     { id: 'thick_bark',     name: 'Thick Bark',     color: 0x885533,
                    desc: '최대 HP +20',        values: [20, 20, 25, 30, 30] },
  photosynthesis: { id: 'photosynthesis', name: 'Photosynthesis', color: 0x44ff88,
                    desc: 'HP 재생 +/s',        values: [0.3, 0.4, 0.5, 0.6, 0.7] },
  toxin_sac:      { id: 'toxin_sac',      name: 'Toxin Sac',      color: 0xaaff00,
                    desc: '피해량 +%',          values: [0.08, 0.09, 0.10, 0.11, 0.12] },
  overgrowth:     { id: 'overgrowth',     name: 'Overgrowth',     color: 0x33ff66,
                    desc: '투사체 수 +1',       values: [1, 1, 1, 1, 1] },

  // ── 이벤트 기반 패시브 ─────────────────────────────────────────────────
  spore_membrane: { id: 'spore_membrane', name: 'Spore Membrane', color: 0xccff44,
                    desc: '피격 시 반경 90 포자 폭발',
                    values: [12, 16, 20, 26, 34] },        // 폭발 피해

  // ── 무기 전용 패시브 ────────────────────────────────────────────────────
  ember_heart:    { id: 'ember_heart',    name: 'Ember Heart',    color: 0xff3300,
                    desc: '화상 적에게 Ember Shard 추가 피해',
                    values: [0.30, 0.35, 0.40, 0.45, 0.50] }, // 추가 배율

  riptide:        { id: 'riptide',        name: 'Riptide',        color: 0x0099ff,
                    desc: '감속 적 처치 시 Tide Pulse 관통+2',
                    values: [2.5, 3.0, 3.5, 4.0, 5.0] },  // 버프 지속(초)
};

// ── XP 테이블 ─────────────────────────────────────────────────────────────
export function xpRequired(level) {
  return Math.ceil(5 * Math.pow(level, 1.5));
}

// ── 스폰율 보간 ───────────────────────────────────────────────────────────
export function getSpawnRate(minutes) {
  for (let i = SPAWN_CURVE.length - 1; i >= 0; i--) {
    if (minutes >= SPAWN_CURVE[i][0]) {
      if (i === SPAWN_CURVE.length - 1) return SPAWN_CURVE[i][1];
      const t = (minutes - SPAWN_CURVE[i][0]) / (SPAWN_CURVE[i+1][0] - SPAWN_CURVE[i][0]);
      return SPAWN_CURVE[i][1] + t * (SPAWN_CURVE[i+1][1] - SPAWN_CURVE[i][1]);
    }
  }
  return 0.5;
}
