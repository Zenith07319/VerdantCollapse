# LevelUp UI 설정 가이드

## Canvas 설정
- Render Mode: Screen Space - Overlay
- Sort Order: **10** (HUD Canvas보다 위)
- Canvas Scaler: Scale With Screen Size, 1920×1080

---

## 오브젝트 계층

```
LevelUpCanvas
└── LevelUpRoot              ← LevelUpUI.cs
    ├── DimBg                Image (전체 화면, 검정 alpha 0.65)
    │
    ├── Panel                (중앙, 900×520px)
    │   ├── TitleText        TextMeshPro "LEVEL UP!  Lv.12"
    │   │                    fontSize 48, Bold, Color #CCFF44
    │   ├── SubtitleText     TextMeshPro "업그레이드를 선택하세요"
    │   │                    fontSize 22, Color #AAAAAA
    │   │
    │   └── CardsRow         Horizontal Layout Group (spacing 20px)
    │       ├── Card_0       ← UpgradeCardUI.cs
    │       ├── Card_1       ← UpgradeCardUI.cs
    │       └── Card_2       ← UpgradeCardUI.cs
    │
    └── RerollRow            Horizontal Layout, 하단
        ├── RerollButton     Button + TextMeshPro "리롤 ◆30"
        └── RerollHintText   TMP "골드가 부족합니다" (조건부 표시)
```

---

## UpgradeCardUI 단일 카드 구조 (260×380px)

```
Card_N
├── CardBg            Image (둥근 사각형, #1A1A1E, alpha 0.95)
├── PhaseStrip        Image (좌측 4px 세로 바, Phase 색상)
├── NewBadge          Image+TMP "NEW" (우상단, 미보유 시만 표시)
├── IconImage         Image (64×64, 중앙 상단)
├── NameText          TextMeshPro (fontSize 22, Bold)
├── DescText          TextMeshPro (fontSize 16, #CCCCCC, 2줄)
├── LevelRow          Horizontal Layout
│   ├── LevelLabel    TextMeshPro "Lv.2→3"
│   └── DotsRow       Horizontal Layout
│       └── Dot_0~7   Image ×8 (10×10 원형)
└── SelectButton      Button (전체 카드 영역 커버)
```

---

## LevelUpUI Inspector 연결

```
LevelUpUI 컴포넌트 (LevelUpRoot에 추가)
├── panelRoot      → Panel
├── canvasGroup    → Panel (CanvasGroup 컴포넌트 추가)
├── levelText      → TitleText
├── subtitleText   → SubtitleText
├── cards[0~2]     → Card_0, Card_1, Card_2
├── rerollButton   → RerollButton
└── rerollCostText → RerollButton의 TMP 텍스트
```

## UpgradePool Inspector 연결

```
UpgradePool 컴포넌트 (별도 빈 오브젝트 또는 LevelUpRoot에 추가)
├── allWeapons[0]   → EmberShard WeaponData SO
├── allWeapons[1]   → TidePulse WeaponData SO
├── allWeapons[2]   → RootArrow WeaponData SO
├── allPassives[0]  → ThickBark PassiveData SO
├── allPassives[1]  → Photosynthesis PassiveData SO
├── allPassives[2]  → ToxinSac PassiveData SO
├── allPassives[3]  → DeepRoots PassiveData SO
├── allPassives[4]  → SporeMembrane PassiveData SO
└── allPassives[5]  → Overgrowth PassiveData SO
```

---

## Phase 색상

| Phase | 색상 HEX | 용도 |
|-------|----------|------|
| 1 | #44EE55 | 무기 초록 |
| 2 | #FF8800 | 무기 주황 |
| 3 | #CC22EE | 무기 보라 |
| Passive | #66CCFF | 패시브 파랑 |
| NEW 뱃지 | #CCFF44 | 신규 획득 |

---

## 동작 흐름

```
PlayerStats.OnLevelUp(newLevel)
    └─→ LevelUpUI.OnLevelUp()
        ├─→ GameManager.SetState(LevelUp)    ← Time.timeScale = 0
        ├─→ UpgradePool.GenerateOptions(3)
        │    ├─ WeaponController.FindWeapon() / WeaponSlotsFull
        │    └─ WeaponController.FindPassive() / PassiveSlotsFull
        ├─→ UpgradeCardUI.Bind() ×3
        └─→ (카드 클릭)
            ├─→ WeaponController.AddOrLevelUpWeapon/Passive()
            │    └─→ CheckEvolution()
            │         └─→ EvolutionChecker.TriggerEvolution()
            │              └─→ TreasureChest 소환
            └─→ GameManager.SetState(Playing)  ← Time.timeScale = 1
```
