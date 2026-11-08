import React from 'react';
import { GameMode } from '../types/game';
import { Timer, Target, Gauge, ChevronRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ModeSelectorProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  onStartGame,
}) => {
  const modes: Array<{
    id: GameMode;
    name: string;
    tagline: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    rules: string[];
    accentColor: string;
  }> = [
    {
      id: 'TIME_ATTACK',
      name: '60秒限時挑戰',
      tagline: '極限手速 · 連擊狂歡',
      description: '一分鐘內盡可能打碎大量氣球與招財貓！維持連續命中累積 Combo 加成！',
      icon: <Timer className="w-6 h-6 text-cyan-400" />,
      badge: '熱門推薦',
      rules: ['限時 60 秒倒數', '連擊 Combo 倍率加分', '誤擊炸彈/無辜小狗重罰扣分'],
      accentColor: 'border-cyan-500/50 hover:border-cyan-400',
    },
    {
      id: 'CLASSIC_TEN',
      name: '經典十發包廂',
      tagline: '彈藥有限 · 門檻考驗',
      description: '傳統夜市最考驗真功夫的十發單局！需達到 80% 命中率門檻才算挑戰成功！',
      icon: <Target className="w-6 h-6 text-amber-400" />,
      badge: '經典懷舊',
      rules: ['嚴格限定 10 發彈藥', '命中率門檻 ≥ 80%', '無辜標靶零容忍'],
      accentColor: 'border-amber-500/50 hover:border-amber-400',
    },
    {
      id: 'RAIL_SPEED',
      name: '橫向滑行極速',
      tagline: '速度暴增 · 3命生存',
      description: '頂層機械滑軌目標不斷加速，漏靶與誤擊將直接扣除生命值，能撐多久？',
      icon: <Gauge className="w-6 h-6 text-rose-400" />,
      badge: '高手極限',
      rules: ['防線 3 條生命值', '滑軌速度持續加劇', '誤擊陷阱直接扣命'],
      accentColor: 'border-rose-500/50 hover:border-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((m) => {
          const isSelected = selectedMode === m.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                onSelectMode(m.id);
                soundEngine.playCorkPop();
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {m.badge}
                  </span>
                </div>

                <h3 className="font-black text-lg text-white">{m.name}</h3>
                <div className="text-xs text-amber-400/90 font-medium mt-0.5">{m.tagline}</div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                  {m.rules.map((rule, idx) => (
                    <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <span className="text-amber-400 text-xs">▸</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div
                  className={`w-full py-2 rounded-xl text-xs font-bold text-center transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isSelected ? '已選中此模式' : '點擊選擇'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 進入射擊台確認按鈕 */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            soundEngine.ensureContext();
            soundEngine.playReload();
            onStartGame();
          }}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <span>🎯 前往射擊台開火！</span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
