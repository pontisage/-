/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, WeaponId } from './types/game';
import { WEAPONS } from './data/weapons';
import { ShootingGallery } from './components/ShootingGallery';
import { ModeSelector } from './components/ModeSelector';
import { WeaponArsenal } from './components/WeaponArsenal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { GameSummaryModal } from './components/GameSummaryModal';
import { LoginModal } from './components/LoginModal';
import { sheetsService } from './services/sheetsService';
import { soundEngine } from './utils/audio';
import {
  Trophy,
  Crosshair,
  Volume2,
  VolumeX,
  Music,
  Coins,
  AlertTriangle,
  Layers,
  Compass,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

type ActiveView = 'HOME' | 'PLAYING' | 'ARSENAL' | 'LEADERBOARD' | 'ARCH';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('HOME');
  const [selectedMode, setSelectedMode] = useState<GameMode>('TIME_ATTACK');
  const [selectedWeaponId, setSelectedWeaponId] = useState<WeaponId>('cork_gun');
  const [nightMarketCoins, setNightMarketCoins] = useState<number>(sheetsService.getTickets());

  // 登入射手狀態 (資料來源：Google Sheets「玩家」工作表)
  const [currentPlayer, setCurrentPlayer] = useState<{
    playerName: string;
    password?: string;
    lastLogin?: string;
  } | null>(() => sheetsService.getCurrentPlayer());
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginIsRequired, setLoginIsRequired] = useState<boolean>(false);

  // 音訊控制
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmMuted, setIsBgmMuted] = useState<boolean>(false);

  // 遊戲結算狀態
  const [summaryData, setSummaryData] = useState<{
    stats: {
      score: number;
      accuracy: number;
      shotsFired: number;
      shotsHit: number;
      maxCombo: number;
      ticketsEarned: number;
      isVictory: boolean;
    };
    mode: GameMode;
    weaponId: WeaponId;
  } | null>(null);

  const refreshCoins = () => {
    setNightMarketCoins(sheetsService.getTickets());
  };

  useEffect(() => {
    // 啟動 BGM 循環
    soundEngine.startNightMarketBGM();
    return () => {
      soundEngine.stopNightMarketBGM();
    };
  }, []);

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleBgm = () => {
    const bgmMuted = soundEngine.toggleBgmMute();
    setIsBgmMuted(bgmMuted);
  };

  // 開始遊玩：強制檢查是否已於「玩家」工作表登入驗證
  const handleStartGame = () => {
    soundEngine.ensureContext();
    if (!currentPlayer) {
      setLoginIsRequired(true);
      setShowLoginModal(true);
      return;
    }
    setActiveView('PLAYING');
  };

  const handleLoginSuccess = (player: {
    playerName: string;
    password?: string;
    lastLogin?: string;
  }) => {
    setCurrentPlayer(player);
    setShowLoginModal(false);
    if (loginIsRequired) {
      setLoginIsRequired(false);
      soundEngine.ensureContext();
      setActiveView('PLAYING');
    }
  };

  const handleLogout = () => {
    sheetsService.logout();
    setCurrentPlayer(null);
  };

  const handleGameOver = (stats: {
    score: number;
    accuracy: number;
    shotsFired: number;
    shotsHit: number;
    maxCombo: number;
    ticketsEarned: number;
    isVictory: boolean;
  }) => {
    refreshCoins();
    setSummaryData({
      stats,
      mode: selectedMode,
      weaponId: selectedWeaponId,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* 頂部導航欄 (遵循 Top Bar Contract: 1-line brand, clean nav links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => setActiveView('HOME')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            🎯
          </div>
          <span className="text-lg font-black tracking-wider text-amber-400 font-mono">
            夜市神射手
          </span>
          <span className="hidden sm:inline text-xs text-amber-500/70 border border-amber-500/30 px-1.5 py-0.5 rounded">
            台灣懷舊射擊
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links (除外：夜市獎品兌換處) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
          <button
            onClick={() => setActiveView('HOME')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'HOME' ? 'text-amber-400' : ''
            }`}
          >
            射擊大廳
          </button>
          <button
            onClick={() => setActiveView('ARSENAL')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'ARSENAL' ? 'text-amber-400' : ''
            }`}
          >
            夜市軍械庫
          </button>
          <button
            onClick={() => setActiveView('LEADERBOARD')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'LEADERBOARD' ? 'text-amber-400' : ''
            }`}
          >
            英雄排行榜
          </button>
          <button
            onClick={() => setActiveView('ARCH')}
            className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeView === 'ARCH' ? 'text-amber-400' : ''
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            系統功能與架構圖
          </button>
        </nav>

        {/* Zone 3: 1 primary action & Audio toggles */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* 射手登入狀態 (資料來源：玩家 工作表) */}
          {currentPlayer ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-amber-500/50 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-300 max-w-[100px] truncate" title={`登入射手: ${currentPlayer.playerName}`}>
                {currentPlayer.playerName}
              </span>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 p-0.5 ml-0.5 transition-colors cursor-pointer"
                title="登出 / 切換射手"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginIsRequired(false);
                setShowLoginModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 rounded-lg text-xs text-amber-300 font-bold transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>玩家登入</span>
            </button>
          )}

          {/* 累積夜市幣 (對應「設定」工作表第 9 欄) */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 border border-amber-600/50 rounded-lg text-amber-300 text-xs font-mono font-bold"
            title="累積夜市幣（同步記錄至試算表設定工作表）"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{nightMarketCoins}</span>
          </div>

          {/* 背景音樂開關 */}
          <button
            onClick={handleToggleBgm}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              isBgmMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-slate-800 border-slate-700 text-amber-400'
            }`}
            title={isBgmMuted ? '開啟夜市合成配樂' : '靜音背景音樂'}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* 主音效開關 */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title={isMuted ? '解除靜音' : '靜音所有音效'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* 進入射擊行動按鈕 */}
          {activeView !== 'PLAYING' && (
            <button
              onClick={handleStartGame}
              className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              即刻開火
            </button>
          )}
        </div>
      </header>

      {/* 主工作區域 */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* 1. 射擊遊戲中 */}
        {activeView === 'PLAYING' && (
          <ShootingGallery
            mode={selectedMode}
            weaponId={selectedWeaponId}
            onGameOver={handleGameOver}
            onExit={() => setActiveView('HOME')}
          />
        )}

        {/* 2. 軍械庫檢視 */}
        {activeView === 'ARSENAL' && (
          <WeaponArsenal
            selectedWeaponId={selectedWeaponId}
            onSelectWeapon={(id) => setSelectedWeaponId(id)}
            onClose={() => setActiveView('HOME')}
          />
        )}

        {/* 3. 英雄排行榜與 Google Sheets 設定 */}
        {activeView === 'LEADERBOARD' && (
          <LeaderboardModal onClose={() => setActiveView('HOME')} />
        )}

        {/* 4. 系統架構資訊圖表 */}
        {activeView === 'ARCH' && (
          <ArchitectureModal onClose={() => setActiveView('HOME')} />
        )}

        {/* 4. 首頁攤位大廳 */}
        {activeView === 'HOME' && (
          <div className="space-y-8">
            {/* 復古夜市攤位 Hero 橫幅 */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-900/60 shadow-2xl p-8 sm:p-12 text-center wood-board">
              {/* 頂部裝飾小燈泡 */}
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              </div>

              <div className="inline-block px-4 py-1 rounded-full bg-amber-950/90 border border-amber-600/60 text-amber-300 text-xs font-bold tracking-widest uppercase mb-3">
                ★ 廟口老字號 · 彈無虛發 ★
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-amber-300 tracking-tight neon-glow-yellow">
                夜市神射手 · 挑戰賽
              </h1>

              <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-amber-100/80 leading-relaxed font-normal">
                經典台灣夜市射擊遊戲重現！頂層機械滑軌動態靶與中層隨機百葉窗雙層標靶，搭配四大特色夜市武器與三大挑戰模式！入場射擊前請先完成玩家登入驗證（資料來源為「玩家」工作表）。
              </p>

              {/* 未登入提醒卡片 */}
              {!currentPlayer ? (
                <div className="mt-6 p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto shadow-xl">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-200 flex items-center gap-2">
                        <span>入場前請先登入玩家身分</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                          玩家 工作表
                        </span>
                      </div>
                      <div className="text-xs text-amber-300/80 mt-0.5">
                        系統將即時向 Google Sheets【玩家】工作表驗證帳號與密碼
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLoginIsRequired(true);
                      setShowLoginModal(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    立即登入驗證
                  </button>
                </div>
              ) : (
                <div className="mt-6 p-3 px-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 inline-flex items-center gap-3 max-w-xl mx-auto shadow-md">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-200">
                    目前已通過「玩家」工作表登入驗證：<strong className="text-emerald-300 font-bold">{currentPlayer.playerName}</strong>
                  </span>
                </div>
              )}

              {/* 當前裝備快速切換與資訊 */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
                <div
                  onClick={() => setActiveView('ARSENAL')}
                  className="px-4 py-2 rounded-xl bg-slate-950/80 border border-amber-700/60 hover:border-amber-400 text-amber-200 cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span>當前武器: <strong>{WEAPONS[selectedWeaponId].name}</strong></span>
                  <span className="text-[10px] text-amber-400 underline">更換武器</span>
                </div>

                <div
                  onClick={() => setActiveView('LEADERBOARD')}
                  className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-amber-400 text-slate-300 cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Google Sheets 排行榜 (直連設定工作表)</span>
                </div>

                <div
                  onClick={() => setActiveView('ARCH')}
                  className="px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-700/60 hover:border-cyan-400 text-cyan-200 cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>檢視系統功能資訊圖表</span>
                </div>
              </div>
            </div>

            {/* 標靶與陷阱圖例指引 (嚴肅警告誤擊懲罰) */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  夜市攤位標靶辨識指南 · 嚴禁誤傷無辜與踩雷
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="text-2xl">🎈</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200">彩色氣球</div>
                    <div className="text-[11px] text-emerald-400 font-mono">+100 ~ 160分</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-amber-900/50 flex items-center gap-3">
                  <span className="text-2xl">🐱</span>
                  <div>
                    <div className="text-xs font-bold text-amber-300">黃金招財貓</div>
                    <div className="text-[11px] text-amber-400 font-mono">+500分 (極快)</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-yellow-900/50 flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="text-xs font-bold text-yellow-300">金色大氣球</div>
                    <div className="text-[11px] text-yellow-400 font-mono">+350分</div>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800 flex items-center gap-3">
                  <span className="text-2xl">💣</span>
                  <div>
                    <div className="text-xs font-bold text-rose-300">惡作劇炸彈</div>
                    <div className="text-[11px] text-rose-400 font-mono">扣 500分 / 扣命</div>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800 flex items-center gap-3">
                  <span className="text-2xl">🐶</span>
                  <div>
                    <div className="text-xs font-bold text-rose-300">無辜吉祥物</div>
                    <div className="text-[11px] text-rose-400 font-mono">扣 600分 / 扣命</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 挑戰模式選擇區 */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>三大夜市挑戰模式</span>
                  <span className="text-xs text-slate-400 font-normal">
                    依命中率門檻與彈藥限制挑戰登榜
                  </span>
                </h2>
              </div>

              <ModeSelector
                selectedMode={selectedMode}
                onSelectMode={(m) => setSelectedMode(m)}
                onStartGame={handleStartGame}
              />
            </div>
          </div>
        )}
      </main>

      {/* 局數結算 Modal */}
      {summaryData && (
        <GameSummaryModal
          stats={summaryData.stats}
          mode={summaryData.mode}
          weaponId={summaryData.weaponId}
          currentPlayer={currentPlayer}
          onPlayAgain={() => {
            setSummaryData(null);
            handleStartGame();
          }}
          onReturnToMenu={() => {
            setSummaryData(null);
            setActiveView('HOME');
          }}
        />
      )}

      {/* 射手入場登入驗證 Modal (驗證來源：Google Sheets「玩家」工作表) */}
      <LoginModal
        isOpen={showLoginModal}
        isRequired={loginIsRequired}
        onSuccess={handleLoginSuccess}
        onClose={() => {
          setShowLoginModal(false);
          setLoginIsRequired(false);
        }}
      />

      {/* 底部安靜頁尾 (遵循反偽裝 telemetry 規範) */}
      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500">
        <span>© 2026 夜市神射手 · 台灣傳統夜市懷舊射擊遊戲 · Web Audio 原生合成音效</span>
      </footer>
    </div>
  );
}
