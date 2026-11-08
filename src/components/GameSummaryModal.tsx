import React, { useState } from 'react';
import { GameMode, WeaponId } from '../types/game';
import { sheetsService } from '../services/sheetsService';
import { soundEngine } from '../utils/audio';
import { Trophy, Ticket, Flame, Target, ArrowRight, RotateCcw } from 'lucide-react';
import { WEAPONS } from '../data/weapons';

interface GameSummaryModalProps {
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
  currentPlayer?: { playerName: string; password?: string } | null;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  stats,
  mode,
  weaponId,
  currentPlayer,
  onPlayAgain,
  onReturnToMenu,
}) => {
  const [playerName, setPlayerName] = useState(currentPlayer?.playerName || '夜市快槍手');
  const [playerPassword, setPlayerPassword] = useState(currentPlayer?.password || '0000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    soundEngine.playTicketSound();

    const res = await sheetsService.submitScore({
      playerName: playerName.trim(),
      password: playerPassword.trim() || '0000',
      score: stats.score,
      accuracy: stats.accuracy,
      mode,
      weapon: weaponId,
      shotsHit: stats.shotsHit,
      maxCombo: stats.maxCombo,
      ticketsEarned: stats.ticketsEarned,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    // 派發彩票
    sheetsService.addTickets(stats.ticketsEarned);

    setIsSubmitting(false);
    setIsSubmitted(true);
    setSubmitMessage(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-600/80 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_40px_rgba(245,158,11,0.2)] animate-scale-up">
        {/* 頂部勝負橫幅 */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="text-4xl mb-2">
            {stats.isVictory ? '🎉 🏆 🎯' : '🏮 💥 🎯'}
          </div>
          <h2 className="text-2xl font-black text-amber-400 tracking-wider">
            {stats.isVictory ? '太神啦！挑戰成功！' : '局數結束 · 戰果結算'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'TIME_ATTACK'
              ? '60秒限時極限射擊'
              : mode === 'CLASSIC_TEN'
              ? '經典十發包廂射擊'
              : '橫向滑軌極速防線'}
            {' · '}
            {WEAPONS[weaponId]?.name}
          </p>
        </div>

        {/* 戰績核心數據網格 */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">最終得分</span>
            <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">射擊命中率</span>
            <span className="text-2xl font-black text-cyan-400 font-mono tabular-nums">
              {stats.accuracy}%
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">最高連擊 (Max Combo)</span>
            <span className="text-xl font-bold text-rose-400 font-mono tabular-nums flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-rose-500" />
              {stats.maxCombo} 次
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">本次獲得彩票</span>
            <span className="text-xl font-bold text-yellow-400 font-mono tabular-nums flex items-center justify-center gap-1">
              <Ticket className="w-4 h-4" />
              +{stats.ticketsEarned} 張
            </span>
          </div>
        </div>

        {/* 榮譽榜登記表單 */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmitScore} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 mb-5">
            <label className="text-xs text-slate-300 font-bold block mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              登記夜市英雄排行榜 (同步至「設定」、「玩家」與「遊戲記錄」工作表)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">玩家名稱</span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={16}
                  placeholder="請輸入大名或外號"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">密碼 (預設: 0000)</span>
                <input
                  type="text"
                  value={playerPassword}
                  onChange={(e) => setPlayerPassword(e.target.value)}
                  maxLength={16}
                  placeholder="0000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !playerName.trim()}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? '同步寫入 Google 試算表中...' : '送出戰績並登錄'}
            </button>
          </form>
        ) : (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-semibold mb-5 text-center">
            ✅ {submitMessage}
          </div>
        )}

        {/* 底部行動按鈕 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            再來一局！
          </button>

          <button
            onClick={onReturnToMenu}
            className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            返回攤位
          </button>
        </div>
      </div>
    </div>
  );
};
