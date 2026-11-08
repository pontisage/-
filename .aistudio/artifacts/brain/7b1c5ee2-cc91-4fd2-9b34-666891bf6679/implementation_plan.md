# 夜市神射手 (Night Market Marksman)

一款融合台灣懷舊夜市攤位美學、機械滑軌與隨機百葉窗動態標靶、四大特色夜市武器與三大挑戰模式的跨平台純前端射擊遊戲，支援 Google Sheets 線上排行榜與完整 Web Audio 原生音效合成系統。

## User Review & Critical Decisions

> [!IMPORTANT]
> 依據前期偏好確認，本專案的核心架構與體驗定位已確定如下：

- **已確認排行榜架構**：採用 Google Sheets Webhook / 表單網址彈性自訂串接，並內建 LocalStorage 本地排行榜雙軌備援機制。即使未設定外部網址，玩家也能隨開即玩、自動記錄並檢視高分榜，連網後可一鍵同步。
- **已確認操控與射擊體驗**：支援桌面游標與手機觸控點擊射擊，具備專屬準心動態跟隨、武器特色後座力視角震動、彈道火光與子彈計數器。
- **已確認音效與氛圍系統**：全程使用 Web Audio API 原生程序合成音樂與音效（包含夜市電子小調晶片 BGM、軟木塞啵聲、BB連發聲、飛鏢破空聲、雷射充能聲、氣球爆破、招財貓鈴鐺、大獎鑼鼓與路人讚嘆聲），零外部音訊檔案依賴，無延遲且加載迅速。

---

## 1. Overview & Core Concept

- **What It Does**：
  提供沉浸式台灣懷舊夜市射擊攤位體驗。玩家站在復古木質射擊台前，透過動態標靶系統（頂部滑軌動態靶 + 中層百葉窗起伏靶）考驗精準度、反應速度與彈藥管理。擊破氣球、幸運招財貓可獲得高分與代幣，誤擊無辜攤商吉娃娃或惡作劇炸彈將觸發扣分或失格懲罰。遊戲累積之夜市彩票可於「獎品展示櫃」兌換懷舊夜市戰利品（巨型沙包娃娃、LED夜光竹蜻蜓、泡泡槍等）。
- **Target Audience / Persona**：
  喜愛休閒街機、射擊挑戰與懷舊夜市文化的跨平台（PC 游標操作 / 平板手機觸控操作）玩家。
- **Key Value**：
  零安裝、零伺服器維護成本、支援 Google Sheets 免費輕量雲端排行榜，搭配純代碼合成音效與細膩動畫，打造高流暢度（60 FPS）且具備強烈懷舊儀式感的夜市小遊戲。

---

## 2. User Experience & Visual Design

### Key User Flows
1. **攤位首頁 (Booth Entrance)**：
   - 霓虹燈招牌閃爍，攤位雨棚與燈泡串隨微風輕晃。
   - 模式選擇（60秒極限挑戰、經典十發包廂、橫向滑行極速）、武器庫切換、個人戰利品櫃與排行榜入口。
2. **射擊遊玩體驗 (Shooting Gallery)**：
   - **頂層機械滑軌**：懸吊標靶左右等速或變速平移（如快速金幣、滑行氣球、炸彈陷阱）。
   - **中層百葉隨機窗**：三排木質百葉窗，間歇性翻開並短暫停留（金貓、三連氣球、無辜吉祥物、炸彈）。
   - **即時回饋**：準心收縮擴散、開火槍口火光、彈道粒子、擊中碎屑爆開、浮動分數（Critical / Hit / Penalty）、連擊計數器（Combo）。
3. **結算與獎勵 (Round Summary & Prize Shop)**：
   - 結算命中率、總分、爆頭率與獲得彩票數。
   - 若進入高分榜，彈出夜市風格登記牌輸入大名，並非同步推送到 Google Sheets 與本地排行榜。
   - 兌換展示架上的復古戰利品（解鎖成就並陳列於木架）。

### Visual Identity & Theme
- **風格定位**：台灣懷舊夜市復古風格（條紋帆布棚、斑駁木架射擊台、手寫壓克力招牌、暖色鎢絲燈泡與粉青霓虹燈管）。
- **色票調色盤 (60-30-10)**：
  - **60% 畫布底層**：深夜市集夜色灰黑 (`#0B0F19`) 與老木造攤位暗褐色 (`#1C130E`)。
  - **30% 結構表面**：經典紅黃相間斜紋遮雨棚、百葉窗胡桃木板、金屬滑軌邊框。
  - **10% 霓虹與焦點**：夜市洋紅霓虹 (`#FF0055`)、電光水藍 (`#00F0FF`)、招財金黃 (`#FFB800`) 與氣球多彩色。
- **字體層級**：
  - 招牌與數字：具視覺衝擊力的幾何運動粗體（如 `Outfit`, `Oswald`）搭配等寬數字 (`tabular-nums`)。
  - 介面與說明：清晰且親切的無襯線字體（繁體中文友好搭配）。
- **防視覺疲勞與無障礙**：文字對比度符合 WCAG AA，扣分與陷阱不僅依靠紅綠顏色，輔以文字警示標籤與獨特警告震動音效。

---

## 3. Key Product Decisions & Trade-Offs

- **決策 1：Google Sheets 排行榜輕量串接與本機備援**
  - *方案*：前端提供預設示範榜單，並支援讀取與回傳 Google Apps Script Webhook 或 Google Form Endpoint。當網路離線或未填寫 Webhook 時，自動平滑降級至瀏覽器 LocalStorage 本地排行榜。
  - *效益*：免去龐大後端維運與資料庫費用，任何人複製一份 Apps Script 或試算表即可自成班級、公司或同好會專屬積分榜。
- **決策 2：全合成 Web Audio API 原生音效引擎**
  - *方案*：使用原生 `AudioContext` 配合振盪器（Oscillator）、白噪聲緩衝器（Noise Buffer）與增益包絡線（Gain Envelope），精確調配軟木塞氣壓彈出音、金屬BB彈射擊脆響、氣球破裂爆破波、中獎警報音與 8-bit 背景小調。
  - *效益*：100% 離線可用，無外部 mp3/wav 破圖或因網路延遲無法播出的問題，手機觸控喚醒即播。
- **決策 3：武器庫與彈藥機制系統**
  - *復古軟木塞手槍*：單發裝填，精準度極高，自帶經典「啵」聲與拋物線微調。
  - *連發BB玩具步槍*：高射速連擊，彈容量 30 發，連發壓制快速移動目標。
  - *磁吸夜市飛鏢*：自帶飛行延遲與物理下墜，爆擊傷害加倍，考驗預判。
  - *霓虹雷射手槍*：穿透型光束，可一槍貫穿多重重疊標靶，冷卻充能制。

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   App Component (Root)                 │
│  - Screen Router (Menu / Gallery / PrizeShop / Ranks)  │
│  - Web Audio Engine (BGM Synth, SFX Player, Volume)    │
│  - Persistent Settings & Token Wallet (LocalStorage)   │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────────────┐       ┌────────────────────────┐
│  Night Market Gallery   │       │   Leaderboard Service  │
│  - Rail System (Canvas) │       │ - Sheets Webhook API   │
│  - Louver Shutter Grid  │       │ - LocalStorage Fallback│
│  - Hitbox Collision     │       │ - Score Submission     │
│  - Recoil & Ammo Engine │       └────────────────────────┘
│  - Particle & Combo HUD │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│       Prize & Trophy Rack       │
│ - Ticket Redemptions            │
│ - Retro Night Market Collectibles
└─────────────────────────────────┘
```

### Core Data Models

```typescript
// 標靶定義
export interface TargetItem {
  id: string;
  type: 'balloon_red' | 'balloon_gold' | 'lucky_cat' | 'bomb' | 'civilian_dog';
  points: number;
  penaltyHealth?: number;
  penaltyPoints?: number;
  speed?: number;
  direction?: 1 | -1;
  position: { x: number; y: number };
  width: number;
  height: number;
  isHit: boolean;
}

// 武器屬性
export interface Weapon {
  id: 'cork_gun' | 'bb_rifle' | 'dart' | 'laser_gun';
  name: string;
  ammoCapacity: number;
  reloadTimeMs: number;
  fireRateMs: number;
  damage: number;
  recoilIntensity: number;
  crosshairStyle: string;
}

// 排行榜紀錄
export interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  accuracy: number;
  mode: 'time_attack' | 'classic_ten' | 'rail_speed';
  weaponUsed: string;
  timestamp: string;
}
```

---

## 5. Implementation Stages & Verification Plan

1. **基礎建設與全套 Web Audio 合成器**：
   - 建立音效引擎 `src/utils/audio.ts`，調製包含開火、擊中、爆破、警告、通關、背景晶片曲的原生音頻合成。
2. **夜市射擊場核心遊戲循環 (The Shooting Booth)**：
   - 頂層滑軌運動物理與中層百葉隨機彈出算法。
   - 準心動態跟隨、觸控適配、後座力晃動特效與開火散彈/連發邏輯。
   - 扣分陷阱（炸彈、無辜小動物）與獎勵標靶（招財貓、黃金氣球）。
3. **四大夜市武器庫與三大遊戲模式**：
   - 實現 60 秒限時、10 發精準包廂、無限滑行極速模式之規則與勝利門檻。
4. **Google Sheets 排行榜與本地雙軌整合**：
   - 實作 Google Apps Script / Webhook 呼叫邏輯與表單網址串接，具備一鍵測試與 LocalStorage 高分排行榜。
5. **獎品兌換戰利品架與懷舊夜市視覺拋光**：
   - 夜市彩票兌換系統，成就戰利品陳列櫃，全響應式手機/桌面體驗驗證。
