import React, { useState, useEffect } from 'react';
import { GameMode, ScoreEntry } from '../types/game';
import { sheetsService, SheetsServerStatus } from '../services/sheetsService';
import { Trophy, RefreshCw, Key, ShieldCheck, CheckCircle2, AlertCircle, Table } from 'lucide-react';
import { WEAPONS } from '../data/weapons';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'service_account_info'>('leaderboard');
  const [selectedMode, setSelectedMode] = useState<GameMode | 'ALL'>('ALL');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isFromSheets, setIsFromSheets] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverStatus, setServerStatus] = useState<SheetsServerStatus>({
    isConfigured: false,
    hasCredentials: false,
    clientEmail: null,
    hasSheetId: false,
    sheetId: null,
  });

  const loadData = async () => {
    setIsLoading(true);
    const [status, scoreRes] = await Promise.all([
      sheetsService.getServerStatus(),
      sheetsService.getScores(selectedMode === 'ALL' ? undefined : selectedMode),
    ]);

    setServerStatus(status);
    setScores(scoreRes.scores);
    setIsFromSheets(scoreRes.fromSheets);
    setStatusMessage(scoreRes.message || '');
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedMode]);

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-5xl mx-auto shadow-2xl">
      {/* 頂部標題與頁籤 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">夜市神射手 · 英雄榮譽榜</h2>
              {serverStatus.isConfigured ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Google Sheets API 運作中
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600 text-amber-300 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> 本地雙軌備援中
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              直連指定工作表「設定」、「玩家」與「遊戲記錄」· 免登入即刻開打
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 頁籤切換 */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              排行榜 (設定工作表)
            </button>
            <button
              onClick={() => setActiveTab('service_account_info')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'service_account_info'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              工作表規格與架構
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            返回攤位
          </button>
        </div>
      </div>

      {/* 頁籤 1: 排行榜清單 (對應「設定」工作表之完整欄位) */}
      {activeTab === 'leaderboard' && (
        <div className="mt-5">
          {/* 模式篩選按鈕與狀態指示 */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'ALL', label: '全部模式' },
                { id: 'TIME_ATTACK', label: '60秒限時' },
                { id: 'CLASSIC_TEN', label: '經典十發' },
                { id: 'RAIL_SPEED', label: '極速滑軌' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedMode(btn.id as GameMode | 'ALL')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    selectedMode === btn.id
                      ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">
                {isFromSheets ? '🟢 雲端「設定」工作表實時數據' : '🟡 本機備援記錄 (隨時同步)'}
              </span>
              <button
                onClick={loadData}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
                title="刷新榜單"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
            </div>
          </div>

          {/* 表格：精確對應「設定」工作表：時間, 玩家名稱, 遊戲模式, 最終得分, 命中率, 擊破數, 最高連擊, 使用武器, 獲得夜市幣 */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 max-h-[420px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3">名次</th>
                  <th className="py-3 px-3">時間</th>
                  <th className="py-3 px-3">玩家名稱</th>
                  <th className="py-3 px-3">遊戲模式</th>
                  <th className="py-3 px-3 text-right">最終得分</th>
                  <th className="py-3 px-3 text-right">命中率</th>
                  <th className="py-3 px-3 text-right">擊破數</th>
                  <th className="py-3 px-3 text-right">最高連擊</th>
                  <th className="py-3 px-3">使用武器</th>
                  <th className="py-3 px-3 text-right">獲得夜市幣</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      尚無紀錄，成為第一個登頂的夜市神射手吧！
                    </td>
                  </tr>
                ) : (
                  scores.map((entry, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    return (
                      <tr
                        key={entry.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isTop1 ? 'bg-amber-950/15' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                          {isTop1 ? (
                            <span className="text-amber-400 text-sm">🥇 #1</span>
                          ) : isTop2 ? (
                            <span className="text-slate-300 text-sm">🥈 #2</span>
                          ) : isTop3 ? (
                            <span className="text-amber-600 text-sm">🥉 #3</span>
                          ) : (
                            <span className="text-slate-500">#{index + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {entry.date}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-200 whitespace-nowrap">
                          {entry.playerName}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                            {entry.mode === 'TIME_ATTACK'
                              ? '60秒限時'
                              : entry.mode === 'CLASSIC_TEN'
                              ? '經典十發'
                              : '極速滑軌'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-amber-400 text-sm tabular-nums whitespace-nowrap">
                          {entry.score.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-300 tabular-nums whitespace-nowrap">
                          {entry.accuracy}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                          {entry.shotsHit ?? '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-rose-400 font-bold tabular-nums whitespace-nowrap">
                          {entry.maxCombo ? `${entry.maxCombo}x` : '-'}
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {WEAPONS[entry.weapon]?.name || entry.weapon}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-yellow-400 font-bold tabular-nums whitespace-nowrap">
                          {entry.ticketsEarned ? `+${entry.ticketsEarned}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 頁籤 2: 3張已定義工作表規格確認 */}
      {activeTab === 'service_account_info' && (
        <div className="mt-5 space-y-5">
          {/* 當前連線狀態卡片 */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Service Account 伺服端認證狀態
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">GOOGLE_SERVICE_ACCOUNT_JSON</span>
                {serverStatus.hasCredentials ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已載入 ({serverStatus.clientEmail})
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">尚未配置（請在 .env 中填寫）</span>
                )}
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">GOOGLE_SHEET_ID</span>
                {serverStatus.hasSheetId ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 已綁定試算表 ({serverStatus.sheetId})
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">尚未配置（請在 .env 中填寫）</span>
                )}
              </div>
            </div>
          </div>

          {/* 3張指定工作表與欄位結構確認卡片 */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-amber-400" />
              已適配的三張工作表欄位規格 (嚴格對應、未增加任何額外欄位)
            </h4>

            <div className="space-y-3 text-xs">
              {/* 工作表 1: 遊戲記錄 */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-400 text-sm">1. 工作表名稱：「遊戲記錄」</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                    3 欄
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-300">
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">玩家名稱</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">密碼</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">最後一次登入時間</span>
                </div>
              </div>

              {/* 工作表 2: 玩家 */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-cyan-400 text-sm">2. 工作表名稱：「玩家」</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                    3 欄
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-300">
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">玩家名稱</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">密碼</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">最後一次登入時間</span>
                </div>
              </div>

              {/* 工作表 3: 設定 */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-400 text-sm">3. 工作表名稱：「設定」</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                    9 欄 (排行榜核心)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-300">
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">時間</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">玩家名稱</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">遊戲模式</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">最終得分</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">命中率</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">擊破數</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">最高連擊</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">使用武器</span>
                  <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded">獲得夜市幣</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
