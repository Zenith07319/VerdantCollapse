# HUD Canvas 계층 구조 설정 가이드

## Canvas 설정
- Render Mode: Screen Space - Overlay
- Canvas Scaler: Scale With Screen Size
- Reference Resolution: 1920 × 1080
- Match: 0.5 (Width/Height 균형)

---

## 오브젝트 계층

```
Canvas
├── HUDRoot                         ← HUDController.cs
│   │
│   ├── TopPanel                    ← Horizontal Layout Group
│   │   ├── HPPanel                 ← (좌측 앵커, min=250px)
│   │   │   ├── HPIcon              Image (하트 아이콘, 32×32)
│   │   │   ├── HPSlider            Slider (Fill + Ghost Fill)
│   │   │   │   ├── Background      Image (어두운 배경)
│   │   │   │   ├── GhostFill       Image (흰색, alpha 0.5)
│   │   │   │   └── Fill            Image (그라디언트)
│   │   │   └── HPText              TextMeshPro "85 / 100"
│   │   │   ** HPPanel → HPBarUI.cs 연결
│   │   │
│   │   ├── TimerPanel              ← (중앙 앵커, Flexible)
│   │   │   └── TimerText           TextMeshPro "08:42"
│   │   │   ** TimerPanel → TimerUI.cs 연결
│   │   │
│   │   └── StatsPanel              ← (우측 앵커)
│   │       ├── KillText            TextMeshPro "☠ 247"
│   │       └── GoldText            TextMeshPro "◆ 320"
│   │
│   ├── BossHPPanel                 ← (상단 중앙, 초기 hidden)
│   │   ├── BossNameText            TextMeshPro
│   │   ├── HPSlider                Slider
│   │   │   ├── GhostFill           Image (fillAmount 방식)
│   │   │   └── Fill                Image
│   │   └── PhaseText               TextMeshPro "Phase 2"
│   │   ** BossHPPanel → BossHPBar.cs 연결
│   │
│   ├── BottomPanel                 ← Horizontal Layout Group (하단)
│   │   ├── DebuffPanel             ← (좌측, Vertical Layout)
│   │   │   └── [DebuffIcon] ×n     (동적 생성)
│   │   │   ** DebuffPanel → DebuffHUD.cs 연결
│   │   │
│   │   ├── Spacer                  Flexible Space
│   │   │
│   │   └── WeaponPanel             ← (우측, Vertical Layout)
│   │       ├── WeaponSlot_0        ← WeaponSlotUI.cs
│   │       │   ├── Icon            Image (64×64)
│   │       │   ├── NameText        TextMeshPro
│   │       │   ├── LevelText       TextMeshPro
│   │       │   ├── DotsRow         Horizontal Layout
│   │       │   │   └── Dot_0~7     Image ×8 (12×12 원형)
│   │       │   ├── PhaseStrip      Image (좌측 4px 세로 바)
│   │       │   └── CooldownOverlay Image (Radial360, alpha 0.4)
│   │       ├── WeaponSlot_1~5      (동일 구조 ×5)
│   │       ** WeaponPanel → WeaponSlotsPanel.cs (slots 배열에 0~5 연결)
│   │
│   └── XPPanel                     ← (최하단, 전체 너비)
│       ├── XPSlider                Slider (full width)
│       │   └── Fill                Image (teal glow)
│       ├── LevelText               TextMeshPro "Lv.12" (우측)
│       └── LevelUpFlash            Image (전체 화면, alpha 0, 레벨업 시 점멸)
│       ** XPPanel → XPBarUI.cs 연결
│
├── VictoryScreen                   (초기 inactive)
│   └── VictoryText                 "VICTORY"
│
└── DefeatScreen                    (초기 inactive)
    └── DefeatText                  "DEFEATED"
```

---

## 앵커 프리셋 요약

| 요소 | Anchor Preset | Pivot | 크기 |
|------|---------------|-------|------|
| TopPanel | Top Stretch | (0.5, 1) | H: 60px |
| BossHPPanel | Top Center | (0.5, 1) | 600×50px |
| BottomPanel | Bottom Stretch | (0.5, 0) | H: 200px |
| XPPanel | Bottom Stretch | (0.5, 0) | H: 20px |
| WeaponSlot | — | (0.5, 0.5) | 260×48px |
| DebuffIcon | — | (0, 0.5) | 80×80px |

---

## WeaponSlotUI Inspector 연결

```
WeaponSlotUI 컴포넌트
├── weaponIcon     → Icon (Image)
├── weaponName     → NameText (TMP)
├── levelText      → LevelText (TMP)
├── levelDots[0~7] → Dot_0 ~ Dot_7 (Image ×8)
├── phaseStrip     → PhaseStrip (Image)
├── cooldownOverlay→ CooldownOverlay (Image, FillMethod=Radial360)
└── emptyIndicator → 빈 슬롯 오브젝트 (Image "-")

CooldownOverlay 설정:
  Image Type: Filled
  Fill Method: Radial 360
  Fill Origin: Top
  Clockwise: true (시계방향)
  Color: (0, 0, 0, 0.5)
```

---

## DebuffHUD Icon Prefab 구조

```
DebuffIconPrefab
├── Image (배경 원형, 64×64)
├── Text (TMP, 약어: "DECAY")
└── TimerSlider
    └── Fill (남은 시간 바)
```

---

## 색상 팔레트 (Verdant Collapse)

| 요소 | HEX | 용도 |
|------|-----|------|
| HP 만땅 | #33DD4D | HP 바 초록 |
| HP 중간 | #F2CC00 | HP 바 노랑 |
| HP 위험 | #F23333 | HP 바 빨강 |
| XP 바 | #1AF2D6 | XP 틸 |
| XP 가득 | #CCFF44 | XP 레벨업 직전 |
| Phase 1 | #44EE55 | 무기 초록 |
| Phase 2 | #FF8800 | 무기 주황 |
| Phase 3 | #CC22EE | 무기 보라 |
| Boss P1 | #CC2222 | 보스 바 빨강 |
| Boss P2 | #DD6611 | 보스 바 주황 |
| Boss P3 | #AA11CC | 보스 바 보라 |
| Gold | #FFD700 | 골드 노랑 |
