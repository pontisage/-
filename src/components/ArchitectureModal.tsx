import React, { useState } from 'react';
import {
  Database,
  Server,
  Smartphone,
  Laptop,
  Shield,
  Volume2,
  Layers,
  Cpu,
  FileSpreadsheet,
  Lock,
  Target,
  Crosshair,
  Gauge,
  Flame,
  AlertTriangle,
  Coins,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

interface ArchitectureModalProps {
  initialTab?: 'features' | 'flow' | 'sheets' | 'audio_physics' | 'security';
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  initialTab = 'features',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'flow' | 'sheets' | 'audio_physics' | 'security'>(
    initialTab
  );

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-5xl mx-auto shadow-2xl">
      {/* 頂部標題與頁籤切換 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">夜市神射手 · 系統功能與架構圖表</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-300 font-bold">
                功能規格與全端架構
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              三大模式 · 四大武器 · 雙層動態靶 · Web Audio · Google Sheets 三表直連
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 頁籤切換 */}
          <div className="flex flex-wrap p-1 bg-slate-950 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'features'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              系統功能圖表
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'flow'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              系統架構全貌
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sheets'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              試算表三表結構
            </button>
            <button
              onClick={() => setActiveTab('audio_physics')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audio_physics'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              音效與物理引擎
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              免登入與資安
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            關閉圖表
          </button>
        </div>
      </div>

      {/* 頁籤 1: 系統功能資訊圖表 (System Features Infographic) */}
      {activeTab === 'features' && (
        <div className="mt-6 space-y-6">
          {/* 功能六大維度全景圖卡 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 功能維度 1: 雙層動態標靶系統 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-600/60 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
                    Feature 01 · 標靶引擎
                  </span>
                  <Target className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-base font-black text-amber-300">雙層動態標靶與例外懲罰</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  結合水平機械滑軌與百葉窗快閃翻轉之空間雙層矩陣：
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>頂層機械滑軌 (Rail)</span>
                    <span className="text-cyan-400 font-mono text-[11px]">左右等速/加速移動</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span>中層百葉窗 (Shutter)</span>
                    <span className="text-yellow-400 font-mono text-[11px]">4格快閃 1.6~2.5s</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800 flex justify-between items-center">
                    <span>惡作劇炸彈 💣</span>
                    <span className="text-rose-400 font-bold text-[11px]">扣500分 / 扣1命</span>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800 flex justify-between items-center">
                    <span>無辜吉祥物 🐶</span>
                    <span className="text-rose-400 font-bold text-[11px]">扣600分 / 扣1命</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能維度 2: 四大夜市特色武器庫 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-600/60 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                    Feature 02 · 軍械庫
                  </span>
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-base font-black text-cyan-300">四大夜市招牌武器庫</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  不同彈容量、射速、後座力晃動與散佈之專屬彈道：
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-amber-300">復古軟木塞手槍</span>
                    <span className="text-slate-400 font-mono text-[11px]">單發極致精準 · 0散佈</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-cyan-300">連發BB玩具步槍</span>
                    <span className="text-slate-400 font-mono text-[11px]">30發高速壓制 · 120ms</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-pink-300">磁吸夜市飛鏢</span>
                    <span className="text-slate-400 font-mono text-[11px]">重力拋物 · 1.5倍暴擊</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-purple-300">霓虹雷射手槍</span>
                    <span className="text-slate-400 font-mono text-[11px]">同軸貫穿 · 5發過熱</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能維度 3: 三大關卡挑戰模式 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-rose-600/60 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
                    Feature 03 · 遊戲規則
                  </span>
                  <Gauge className="w-4 h-4 text-rose-400" />
                </div>
                <h3 className="text-base font-black text-rose-300">三大關卡挑戰機制</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  具備命中率門檻、嚴格彈藥限制與極限速度防線：
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-200">60秒限時挑戰</span>
                    <span className="text-cyan-400 font-mono text-[11px]">連擊 Combo 倍率加乘</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-200">經典十發包廂</span>
                    <span className="text-amber-400 font-mono text-[11px]">限10發 · 門檻 ≥80%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-200">橫向滑行極速</span>
                    <span className="text-rose-400 font-mono text-[11px]">3條命 · 每10秒加速</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-200">夜市幣累積</span>
                    <span className="text-yellow-400 font-mono text-[11px]">依得分與通關發放</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能維度 4: Web Audio 原生程序合成音效 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-600/60 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
                    Feature 04 · 音訊技術
                  </span>
                  <Volume2 className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-base font-black text-purple-300">Web Audio 原生合成音效</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  純代碼演算法振盪器調配，0 外部檔案加載、0 延遲：
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>軟木塞啵聲 / BB彈撞擊</span>
                    <span className="text-amber-300 font-mono text-[10px]">Sine + Bandpass</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>氣球爆破 / 炸彈重低音</span>
                    <span className="text-rose-300 font-mono text-[10px]">Noise + Sub Rumble</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>招財貓鈴鐺 / 勝利號角</span>
                    <span className="text-yellow-300 font-mono text-[10px]">Pentatonic Harmonics</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>8-Bit 夜市小調背景音樂</span>
                    <span className="text-purple-300 font-mono text-[10px]">Square Wave Arp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能維度 5: Google Sheets 3表直連與免登入持久化 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-600/60 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                    Feature 05 · 資料持久化
                  </span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-black text-emerald-300">Google Sheets 三表整合</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Service Account 伺服代理，玩家免登入即可讀寫：
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="font-bold text-emerald-300">工作表 1: 設定</span>
                    <span className="text-slate-400 font-mono text-[10px]">9欄 完整戰績榜單</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="font-bold text-cyan-300">工作表 2: 玩家</span>
                    <span className="text-slate-400 font-mono text-[10px]">3欄 名冊與最後登入</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="font-bold text-amber-300">工作表 3: 遊戲記錄</span>
                    <span className="text-slate-400 font-mono text-[10px]">3欄 遊玩時間日誌</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="font-bold text-slate-300">本機 LocalStorage 備援</span>
                    <span className="text-emerald-400 font-mono text-[10px]">斷網無縫降級切換</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能維度 6: 跨平台操控與懷舊美學 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-blue-600/60 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 font-bold">
                    Feature 06 · 操控體驗
                  </span>
                  <Smartphone className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-base font-black text-blue-300">跨平台操控與懷舊美學</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  適配桌機游標與行動觸控，打造沉浸式夜市射擊棚：
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>動態準心跟隨與閃光</span>
                    <span className="text-blue-300 font-mono text-[10px]">Muzzle Flash</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>視角後座力震動回饋</span>
                    <span className="text-blue-300 font-mono text-[10px]">Screen Recoil</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>復古夜市攤棚視覺</span>
                    <span className="text-amber-300 font-mono text-[10px]">紅黃條紋+胡桃木</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>手機防縮放觸控優化</span>
                    <span className="text-emerald-300 font-mono text-[10px]">touch-none 60FPS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 頁籤 2: 系統架構全貌流程圖 */}
      {activeTab === 'flow' && (
        <div className="mt-6 space-y-6">
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
              {/* 節點 1 */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800">
                      Client Tier
                    </span>
                    <div className="flex gap-1 text-slate-400">
                      <Laptop className="w-4 h-4" />
                      <Smartphone className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-black text-slate-100 text-sm">跨平台終端裝置</h3>
                  <p className="text-[11px] text-slate-400 mt-1">電腦游標 / 手機觸控即點即射</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                  <div>• 游標動態跟隨與後座力</div>
                  <div>• 武器準心即時反饋</div>
                  <div>• 完全免安裝任何 App</div>
                </div>
              </div>

              {/* 節點 2 */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-600/80 flex flex-col justify-between shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-700">
                      React 19 SPA
                    </span>
                    <Cpu className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="font-black text-amber-300 text-sm">夜市射擊遊戲核心</h3>
                  <p className="text-[11px] text-amber-200/70 mt-1">60FPS 雙層動態標靶與音效</p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-900/60 text-[10px] text-amber-200/80 space-y-1">
                  <div>• 頂層機械滑軌運動物理</div>
                  <div>• 中層 4 格隨機百葉窗靶</div>
                  <div>• Web Audio 原生代碼合成</div>
                  <div>• 四大武器庫與三挑戰模式</div>
                </div>
              </div>

              {/* 節點 3 */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-600/80 flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-700">
                      Express Server
                    </span>
                    <Server className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="font-black text-cyan-300 text-sm">安全代理與認證中樞</h3>
                  <p className="text-[11px] text-cyan-200/70 mt-1">環境變數讀取與 API 代理</p>
                </div>
                <div className="mt-3 pt-2 border-t border-cyan-900/60 text-[10px] text-cyan-200/80 space-y-1">
                  <div>• 載入 .env 隔離保護金鑰</div>
                  <div>• Service Account JWT 簽署</div>
                  <div>• /api/leaderboard 讀寫</div>
                  <div>• /api/player/login 登入</div>
                </div>
              </div>

              {/* 節點 4 */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-600/80 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700">
                      Cloud DB
                    </span>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-black text-emerald-300 text-sm">Google Sheets 試算表</h3>
                  <p className="text-[11px] text-emerald-200/70 mt-1">三張指定工作表持久化</p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-900/60 text-[10px] text-emerald-200/80 space-y-1">
                  <div>• 「設定」: 9 欄戰績排行榜</div>
                  <div>• 「玩家」: 3 欄名冊與登入</div>
                  <div>• 「遊戲記錄」: 3 欄遊戲日誌</div>
                  <div>• 一般玩家免登入即可讀寫</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">即時資料流向：</span>
                <span className="text-slate-400">
                  玩家開火結算 ➔ 前端整理戰績 ➔ POST /api/leaderboard ➔ 後端使用 Service Account 寫入 Google 試算表 ➔ 排行榜同步更新
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 頁籤 3: 試算表三表結構 */}
      {activeTab === 'sheets' && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Google Sheets 試算表三表資料字典 (Data Dictionary)
            </h3>
            <p className="text-xs text-slate-400">
              系統嚴格限定使用此三張工作表，欄位數與名稱完全對應，絕無額外冗餘欄位。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-600/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-400">工作表：遊戲記錄</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">3 欄</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">記錄每次玩家遊玩或登入之行為日誌</p>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-amber-300">Col A: 玩家名稱</span>
                    <span className="text-slate-500">Text</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-amber-300">Col B: 密碼</span>
                    <span className="text-slate-500">Text</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-amber-300">Col C: 最後一次登入時間</span>
                    <span className="text-slate-500">Timestamp</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-600/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-cyan-400">工作表：玩家</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">3 欄</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">存放玩家名冊，為開始遊玩前之登入驗證資料來源；驗證成功時更新最後登入時間</p>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-cyan-300">Col A: 玩家名稱</span>
                    <span className="text-slate-500">Primary</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-cyan-300">Col B: 密碼</span>
                    <span className="text-slate-500">Secret</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-cyan-300">Col C: 最後一次登入時間</span>
                    <span className="text-slate-500">Timestamp</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-600/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-emerald-400">工作表：設定 (排行榜)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">9 欄</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">英雄排行榜主要來源，每局戰績追加寫入</p>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-emerald-300">A: 時間</span>
                    <span className="text-slate-500">B: 玩家名稱</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-emerald-300">C: 遊戲模式</span>
                    <span className="text-slate-500">D: 最終得分</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-emerald-300">E: 命中率</span>
                    <span className="text-slate-500">F: 擊破數</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-emerald-300">G: 最高連擊</span>
                    <span className="text-slate-500">H: 使用武器</span>
                  </div>
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span className="text-emerald-300">I: 獲得夜市幣</span>
                    <span className="text-amber-400">Reward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 頁籤 4: 音效與物理引擎 */}
      {activeTab === 'audio_physics' && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Web Audio API 原生程序合成架構
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                全專案不依賴任何外部音效檔案，所有聲音均以瀏覽器音訊上下文實時合成，保證無加載延遲、0 破圖、100% 離線可用。
              </p>
              <div className="text-xs text-slate-300 space-y-2 font-mono">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-amber-400 block font-bold">1. 氣壓軟木塞 (Cork Pop)</span>
                  <span className="text-slate-400 text-[11px]">Sine 波 190Hz➔50Hz 指數下掃 + 800Hz~2400Hz 帶通白噪</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 block font-bold">2. 連發BB槍 (BB Rapid)</span>
                  <span className="text-slate-400 text-[11px]">Triangle 550Hz➔110Hz 金屬撞擊 + 2000Hz~6000Hz 高頻彈簧</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-rose-400 block font-bold">3. 氣球破裂 (Balloon Burst)</span>
                  <span className="text-slate-400 text-[11px]">120Hz➔30Hz 氣流震波 + 1200Hz~7000Hz 瞬間破皮撕裂噪聲</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-purple-400 block font-bold">4. 8-Bit 夜市小調 (Background BGM)</span>
                  <span className="text-slate-400 text-[11px]">Square 波歡樂五聲音階主旋律 + Triangle 低音伴奏輪循</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-cyan-400 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                動態標靶雙層矩陣與物理判定
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                60 FPS requestAnimationFrame 物理驅動，結合滑軌等速移動與百葉窗隨機起伏，並透過實體 DOM 矩形換算精確碰撞。
              </p>
              <div className="text-xs text-slate-300 space-y-2">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-cyan-300 block font-bold">頂層滑軌運動系統 (Top Rail)</span>
                  <span className="text-slate-400 text-[11px]">
                    左右定速滑行，極速模式每 10 秒加速 30%，乘載紅/藍/金氣球、招財貓與陷阱。
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-amber-300 block font-bold">中層百葉窗隨機翻轉 (Louver Shutter Matrix)</span>
                  <span className="text-slate-400 text-[11px]">
                    4 格木造百葉窗各自獨立定時翻開（停留 1.6~2.5 秒），快閃高分目標或炸彈。
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-rose-400 block font-bold">例外懲罰判定 (Penalty System)</span>
                  <span className="text-slate-400 text-[11px]">
                    誤擊炸彈扣 500 分/扣命；誤擊無辜吉祥物扣 600 分/扣命；彈藥超發或漏靶觸發門檻失格。
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 頁籤 5: 免登入與資安 */}
      {activeTab === 'security' && (
        <div className="mt-6 space-y-4">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Service Account 免登入代理與 GitHub 資安隔離
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-sm flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  GitHub 零洩漏防護
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  專案 <code>.gitignore</code> 已將 <code>.env*</code>、<code>service-account*.json</code>、<code>*.key.json</code> 進行全域封鎖。
                  開發者在伺服器端配置的 Google Cloud 服務帳號私鑰與 Sheet ID 絕不會被 Commit 或 Push 到 GitHub。
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  使用者完全免登入
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  傳統前端存取 Google Sheets 需要玩家逐一完成 OAuth 授權登入；本系統改採後端代理模式（Server-to-Google），由後端代為執行 JWT 認證，任何訪客直接開啟網頁即可遊玩與登榜。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
