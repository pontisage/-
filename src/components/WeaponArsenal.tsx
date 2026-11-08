import React from 'react';
import { WeaponId } from '../types/game';
import { WEAPONS } from '../data/weapons';
import { Crosshair, Shield, Zap, Sparkles, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface WeaponArsenalProps {
  selectedWeaponId: WeaponId;
  onSelectWeapon: (id: WeaponId) => void;
  onClose: () => void;
}

export const WeaponArsenal: React.FC<WeaponArsenalProps> = ({
  selectedWeaponId,
  onSelectWeapon,
  onClose,
}) => {
  const weaponsList = Object.values(WEAPONS);
  const activeWeapon = WEAPONS[selectedWeaponId];

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">夜市軍械庫 · 四大招牌武器</h2>
            <p className="text-xs text-slate-400">挑選適合不同挑戰模式的專屬手感與彈道特性</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          返回攤位
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {weaponsList.map((w) => {
          const isSelected = w.id === selectedWeaponId;
          return (
            <button
              key={w.id}
              onClick={() => {
                onSelectWeapon(w.id);
                soundEngine.playReload();
              }}
              className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="text-3xl mb-2">
                {w.id === 'cork_gun' && '🪵'}
                {w.id === 'bb_rifle' && '🔫'}
                {w.id === 'dart' && '🎯'}
                {w.id === 'laser_gun' && '⚡'}
              </div>

              <div className="font-bold text-slate-100 text-sm">{w.name}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{w.nameEn}</div>

              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300 line-clamp-2">
                {w.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* 選中武器詳細數值展示 */}
      <div className="mt-6 p-5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-lg">{activeWeapon.name}</span>
            <span className="text-xs bg-amber-950 border border-amber-800 text-amber-300 px-2 py-0.5 rounded font-mono">
              裝填: {activeWeapon.ammoCapacity === 0 ? '無限' : `${activeWeapon.ammoCapacity} 發`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeWeapon.description}</p>
        </div>

        <div className="space-y-3">
          {/* 威力 */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>單發威力 (Damage)</span>
              <span className="font-mono text-slate-200">{activeWeapon.damage} PTS</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(activeWeapon.damage / 200) * 100}%` }}
              />
            </div>
          </div>

          {/* 射速 */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>連發射速 (Fire Rate)</span>
              <span className="font-mono text-slate-200">
                {activeWeapon.fireRateMs <= 150 ? '極高' : activeWeapon.fireRateMs <= 300 ? '高' : '單發'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${Math.max(15, (1 - activeWeapon.fireRateMs / 600) * 100)}%` }}
              />
            </div>
          </div>

          {/* 準確度 */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>散佈精準度 (Accuracy)</span>
              <span className="font-mono text-slate-200">
                {activeWeapon.bulletSpread === 0 ? '極致瞄準 (0散佈)' : '微量擴散'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.max(20, (1 - activeWeapon.bulletSpread / 15) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
