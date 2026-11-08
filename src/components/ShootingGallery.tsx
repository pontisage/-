import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameMode, WeaponId, TargetItem, FloatingText, Particle, BulletMark, GameStats } from '../types/game';
import { WEAPONS } from '../data/weapons';
import { soundEngine } from '../utils/audio';
import { AlertTriangle, Flame, RefreshCw, Zap, Shield, Target } from 'lucide-react';

interface ShootingGalleryProps {
  mode: GameMode;
  weaponId: WeaponId;
  onGameOver: (stats: {
    score: number;
    accuracy: number;
    shotsFired: number;
    shotsHit: number;
    maxCombo: number;
    ticketsEarned: number;
    isVictory: boolean;
  }) => void;
  onExit: () => void;
}

export const ShootingGallery: React.FC<ShootingGalleryProps> = ({
  mode,
  weaponId,
  onGameOver,
  onExit,
}) => {
  const currentWeapon = WEAPONS[weaponId];
  const containerRef = useRef<HTMLDivElement>(null);

  // 遊戲即時狀態
  const [stats, setStats] = useState<GameStats>({
    shotsFired: 0,
    shotsHit: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 3,
    timeRemaining: mode === 'TIME_ATTACK' ? 60 : mode === 'CLASSIC_TEN' ? 90 : 60,
    ammoLeft: currentWeapon.ammoCapacity === 0 ? 999 : currentWeapon.ammoCapacity,
    isReloading: false,
  });

  // 準心位置 (百分比)
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const [recoilOffset, setRecoilOffset] = useState({ x: 0, y: 0 });
  const [muzzleFlash, setMuzzleFlash] = useState<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  // 實體清單 (Refs 用於 60fps 物理循環避免頻繁 React 重新渲染)
  const targetsRef = useRef<TargetItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const bulletMarksRef = useRef<BulletMark[]>([]);
  const lastShotTimeRef = useRef<number>(0);
  const isGameOverTriggered = useRef<boolean>(false);
  const gameStartTimeRef = useRef<number>(Date.now());

  // 百葉窗狀態 (4 個窗格，記錄開啟時間與內容)
  const [shutters, setShutters] = useState<
    Array<{
      id: number;
      isOpen: boolean;
      target: TargetItem | null;
      openUntil: number;
    }>
  >([
    { id: 0, isOpen: false, target: null, openUntil: 0 },
    { id: 1, isOpen: false, target: null, openUntil: 0 },
    { id: 2, isOpen: false, target: null, openUntil: 0 },
    { id: 3, isOpen: false, target: null, openUntil: 0 },
  ]);

  // 動態渲染 state
  const [, setRenderTick] = useState(0);

  // 初始化標靶產生器 (滑軌懸吊靶)
  const createRailTarget = useCallback(
    (direction: 1 | -1, forcedSpeed?: number): TargetItem => {
      const rand = Math.random();
      let kind: TargetItem['kind'] = 'balloon_red';
      let points = 100;
      let penaltyHealth = 0;
      let penaltyPoints = 0;

      if (rand < 0.28) {
        kind = 'balloon_red';
        points = 100;
      } else if (rand < 0.52) {
        kind = 'balloon_blue';
        points = 160;
      } else if (rand < 0.68) {
        kind = 'balloon_gold';
        points = 350;
      } else if (rand < 0.78) {
        kind = 'lucky_cat';
        points = 500;
      } else if (rand < 0.9) {
        kind = 'bomb';
        points = 0;
        penaltyPoints = 500;
        penaltyHealth = 1;
      } else {
        kind = 'civilian_dog';
        points = 0;
        penaltyPoints = 600;
        penaltyHealth = 1;
      }

      // 極速模式隨時間加速
      const elapsedSeconds = (Date.now() - gameStartTimeRef.current) / 1000;
      const speedMultiplier = mode === 'RAIL_SPEED' ? 1 + elapsedSeconds * 0.03 : 1;

      const speedBase = forcedSpeed || (mode === 'RAIL_SPEED' ? 24 : 16);
      const speed = (speedBase + Math.random() * 8) * (kind === 'balloon_gold' ? 1.4 : 1) * speedMultiplier;

      return {
        id: `target-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        kind,
        layer: 'rail',
        x: direction === 1 ? -10 : 110,
        y: 22 + Math.random() * 6, // 頂層軌道高度 (22% - 28%)
        width: kind === 'lucky_cat' ? 64 : 54,
        height: kind === 'lucky_cat' ? 68 : 64,
        speed,
        direction,
        points,
        penaltyHealth,
        penaltyPoints,
        expiresAt: 0,
        isHit: false,
      };
    },
    [mode]
  );

  // 補充滑軌標靶
  const ensureRailTargets = useCallback(() => {
    const activeRails = targetsRef.current.filter((t) => t.layer === 'rail' && !t.isHit);
    const maxOnRail = mode === 'RAIL_SPEED' ? 5 : 4;

    if (activeRails.length < maxOnRail) {
      const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
      targetsRef.current.push(createRailTarget(dir));
    }
  }, [createRailTarget, mode]);

  // 百葉窗隨機翻轉輪巡邏輯 (中層窗口)
  useEffect(() => {
    const shutterTimer = setInterval(() => {
      if (isGameOverTriggered.current) return;

      setShutters((prev) => {
        const now = Date.now();
        return prev.map((shutter, idx) => {
          // 如果目前開啟且時間已過，關閉
          if (shutter.isOpen && now > shutter.openUntil) {
            return { ...shutter, isOpen: false, target: null };
          }

          // 如果目前關閉，有 30% 機率翻開
          if (!shutter.isOpen && Math.random() < 0.3) {
            const rand = Math.random();
            let kind: TargetItem['kind'] = 'lucky_cat';
            let points = 500;
            let penaltyPoints = 0;
            let penaltyHealth = 0;

            if (rand < 0.45) {
              kind = 'lucky_cat';
              points = 500;
            } else if (rand < 0.72) {
              kind = 'balloon_gold';
              points = 300;
            } else if (rand < 0.88) {
              kind = 'bomb';
              points = 0;
              penaltyPoints = 500;
              penaltyHealth = 1;
            } else {
              kind = 'civilian_dog';
              points = 0;
              penaltyPoints = 600;
              penaltyHealth = 1;
            }

            const duration = 1600 + Math.random() * 900; // 開啟 1.6 - 2.5 秒
            const target: TargetItem = {
              id: `shutter-target-${idx}-${now}`,
              kind,
              layer: 'shutter',
              shutterIndex: idx,
              x: 0, // 將在射擊時根據 DOM 精確計算中心
              y: 0,
              width: 60,
              height: 64,
              speed: 0,
              direction: 1,
              points,
              penaltyPoints,
              penaltyHealth,
              expiresAt: now + duration,
              isHit: false,
            };

            return {
              ...shutter,
              isOpen: true,
              target,
              openUntil: now + duration,
            };
          }

          return shutter;
        });
      });
    }, 600);

    return () => clearInterval(shutterTimer);
  }, []);

  // 倒數計時與勝負檢測
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      if (isGameOverTriggered.current) return;

      setStats((prev) => {
        const newTime = prev.timeRemaining - 1;

        if (newTime <= 0 || (mode === 'RAIL_SPEED' && prev.health <= 0)) {
          triggerGameOver(prev);
          return { ...prev, timeRemaining: 0 };
        }

        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [mode]);

  // 觸發遊戲結算
  const triggerGameOver = (currentStats: GameStats) => {
    if (isGameOverTriggered.current) return;
    isGameOverTriggered.current = true;

    soundEngine.playGameOver();

    const accuracy =
      currentStats.shotsFired > 0
        ? Math.round((currentStats.shotsHit / currentStats.shotsFired) * 100)
        : 0;

    let isVictory = false;
    let baseTickets = Math.floor(currentStats.score / 50);

    if (mode === 'CLASSIC_TEN') {
      isVictory = accuracy >= 80 && currentStats.score >= 1200;
    } else if (mode === 'TIME_ATTACK') {
      isVictory = accuracy >= 70 && currentStats.score >= 2500;
    } else {
      isVictory = currentStats.health > 0 && currentStats.score >= 1800;
    }

    if (isVictory) {
      baseTickets += 60; // 通關加成夜市幣
      soundEngine.playVictoryFanfare();
    }

    onGameOver({
      score: Math.max(0, currentStats.score),
      accuracy,
      shotsFired: currentStats.shotsFired,
      shotsHit: currentStats.shotsHit,
      maxCombo: currentStats.maxCombo,
      ticketsEarned: Math.max(10, baseTickets),
      isVictory,
    });
  };

  // 主物理動畫循環 (60 FPS)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // 1. 移動滑軌標靶
      ensureRailTargets();
      targetsRef.current.forEach((t) => {
        if (t.layer === 'rail') {
          t.x += t.direction * t.speed * dt;
        }
      });

      // 移除超出邊界的滑軌標靶
      targetsRef.current = targetsRef.current.filter((t) => {
        if (t.layer === 'rail') {
          if (t.direction === 1 && t.x > 115) return false;
          if (t.direction === -1 && t.x < -15) return false;
        }
        return true;
      });

      // 2. 更新粒子
      particlesRef.current.forEach((p) => {
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.vy += 0.25; // 重力
        p.life -= dt * 1.8;
        p.alpha = Math.max(0, p.life);
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // 3. 更新浮動文字
      const now = Date.now();
      floatingTextsRef.current = floatingTextsRef.current.filter(
        (f) => now - f.createdAt < 1200
      );

      // 4. 清理舊彈孔 (保留最多 20 個)
      bulletMarksRef.current = bulletMarksRef.current.filter((b) => now - b.createdAt < 8000);

      // 觸發視覺刷新
      setRenderTick((t) => (t + 1) % 1000);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [ensureRailTargets]);

  // 粒子噴射器
  const spawnParticles = (x: number, y: number, color: string, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 1,
      });
    }
  };

  // 手動或自動換彈
  const handleReload = () => {
    if (stats.isReloading || stats.ammoLeft === currentWeapon.ammoCapacity) return;

    setStats((prev) => ({ ...prev, isReloading: true }));
    soundEngine.playReload();

    setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        isReloading: false,
        ammoLeft: currentWeapon.ammoCapacity === 0 ? 999 : currentWeapon.ammoCapacity,
      }));
    }, currentWeapon.reloadTimeMs);
  };

  // 射擊邏輯處理
  const fireShot = (clientX: number, clientY: number) => {
    if (isGameOverTriggered.current) return;

    const now = Date.now();
    // 射速冷卻防護
    if (now - lastShotTimeRef.current < currentWeapon.fireRateMs) return;

    // 彈藥檢查
    if (currentWeapon.ammoCapacity > 0 && stats.ammoLeft <= 0) {
      soundEngine.playReload();
      handleReload();
      return;
    }

    if (stats.isReloading) return;

    lastShotTimeRef.current = now;

    // 後座力視角震動
    const recoilX = (Math.random() - 0.5) * currentWeapon.recoilIntensity * 2;
    const recoilY = -currentWeapon.recoilIntensity * 2.5;
    setRecoilOffset({ x: recoilX, y: recoilY });
    setTimeout(() => setRecoilOffset({ x: 0, y: 0 }), 120);

    // 槍口閃光與準心即時定位
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pctX = ((clientX - rect.left) / rect.width) * 100;
      const pctY = ((clientY - rect.top) / rect.height) * 100;

      // 觸控即時更新準心
      setCrosshairPos({ x: pctX, y: pctY });

      // 考慮武器擴散散佈
      const spread = (Math.random() - 0.5) * (currentWeapon.bulletSpread / rect.width) * 100;
      const hitX = Math.max(2, Math.min(98, pctX + spread));
      const hitY = Math.max(2, Math.min(98, pctY + spread));

      setMuzzleFlash({ active: true, x: hitX, y: hitY });
      setTimeout(() => setMuzzleFlash({ active: false, x: 0, y: 0 }), 60);

      // 留下彈孔/飛鏢痕跡
      bulletMarksRef.current.push({
        id: `bm-${now}`,
        x: hitX,
        y: hitY,
        type: weaponId,
        createdAt: now,
      });

      // 播放專屬開火音效
      if (weaponId === 'cork_gun') soundEngine.playCorkPop();
      else if (weaponId === 'bb_rifle') soundEngine.playBBFire();
      else if (weaponId === 'dart') {
        soundEngine.playDartThrow();
        setTimeout(() => soundEngine.playDartImpact(), 60);
      } else if (weaponId === 'laser_gun') soundEngine.playLaserZap();

      // 檢查命中目標
      let isHitAny = false;
      let pointsScored = 0;
      let healthDamage = 0;
      let penaltyTotal = 0;

      // 候選目標清單
      const candidates: Array<{ target: TargetItem; centerX: number; centerY: number }> = [];

      // 1. 滑軌動態標靶 (以 target.x, target.y 為中心)
      targetsRef.current.forEach((t) => {
        if (!t.isHit && t.layer === 'rail') {
          candidates.push({ target: t, centerX: t.x, centerY: t.y });
        }
      });

      // 2. 當前百葉窗內標靶 (以 DOM 實際格位中心為準，精準判定)
      shutters.forEach((s) => {
        if (s.isOpen && s.target && !s.target.isHit) {
          const shutterDom = document.getElementById(`shutter-cell-${s.id}`);
          if (shutterDom) {
            const sRect = shutterDom.getBoundingClientRect();
            const centerX = ((sRect.left + sRect.width / 2 - rect.left) / rect.width) * 100;
            const centerY = ((sRect.top + sRect.height / 2 - rect.top) / rect.height) * 100;
            candidates.push({ target: s.target, centerX, centerY });
          }
        }
      });

      // 雷射手槍具備貫穿效果 (可命中直線周遭多重目標)
      const maxHitsAllowed = weaponId === 'laser_gun' ? 3 : 1;
      let hitsCount = 0;

      candidates.forEach(({ target, centerX, centerY }) => {
        if (hitsCount >= maxHitsAllowed) return;

        // 計算點擊與目標中心距離
        const targetRadiusX = (target.width / (rect.width || 800)) * 52;
        const targetRadiusY = (target.height / (rect.height || 600)) * 52;

        const dx = Math.abs(hitX - centerX);
        const dy = Math.abs(hitY - centerY);

        if (dx <= targetRadiusX && dy <= targetRadiusY) {
          hitsCount++;
          isHitAny = true;
          target.isHit = true;

          // 標靶各種類型反應
          if (target.kind === 'balloon_red' || target.kind === 'balloon_blue' || target.kind === 'balloon_gold') {
            soundEngine.playBalloonPop();
            const color =
              target.kind === 'balloon_gold'
                ? '#facc15'
                : target.kind === 'balloon_blue'
                ? '#38bdf8'
                : '#f43f5e';
            spawnParticles(centerX, centerY, color, target.kind === 'balloon_gold' ? 24 : 16);

            let bonus = target.points;
            if (weaponId === 'dart') bonus = Math.round(bonus * 1.5); // 飛鏢暴擊

            pointsScored += bonus;

            floatingTextsRef.current.push({
              id: `ft-${now}-${Math.random()}`,
              text: `+${bonus}${weaponId === 'dart' ? ' (暴擊!)' : ''}`,
              x: centerX,
              y: centerY - 4,
              color: '#34d399',
              createdAt: now,
            });
          } else if (target.kind === 'lucky_cat') {
            soundEngine.playLuckyCatBell();
            spawnParticles(centerX, centerY, '#fbbf24', 28);
            pointsScored += target.points;

            floatingTextsRef.current.push({
              id: `ft-${now}-${Math.random()}`,
              text: `招財進寶 +${target.points}!`,
              x: centerX,
              y: centerY - 5,
              color: '#facc15',
              createdAt: now,
            });
          } else if (target.kind === 'bomb') {
            // 誤擊炸彈懲罰！
            soundEngine.playBombExplosion();
            spawnParticles(centerX, centerY, '#1e293b', 30);
            penaltyTotal += target.penaltyPoints;
            healthDamage += target.penaltyHealth;

            floatingTextsRef.current.push({
              id: `ft-${now}-${Math.random()}`,
              text: `踩雷爆破! -${target.penaltyPoints}`,
              x: centerX,
              y: centerY - 5,
              color: '#ef4444',
              createdAt: now,
              isPenalty: true,
            });
          } else if (target.kind === 'civilian_dog') {
            // 誤擊無辜吉祥物懲罰！
            soundEngine.playDogBarkPenalty();
            spawnParticles(centerX, centerY, '#94a3b8', 16);
            penaltyTotal += target.penaltyPoints;
            healthDamage += target.penaltyHealth;

            floatingTextsRef.current.push({
              id: `ft-${now}-${Math.random()}`,
              text: `誤擊無辜! -${target.penaltyPoints}`,
              x: centerX,
              y: centerY - 5,
              color: '#ef4444',
              createdAt: now,
              isPenalty: true,
            });
          }

          // 如果命中百葉窗目標，立即關閉該窗格
          if (target.layer === 'shutter' && target.shutterIndex !== undefined) {
            setShutters((prev) =>
              prev.map((s) =>
                s.id === target.shutterIndex ? { ...s, isOpen: false, target: null } : s
              )
            );
          }
        }
      });

      // 結算單次射擊分數與狀態
      setStats((prev) => {
        const newFired = prev.shotsFired + 1;
        const newHit = isHitAny ? prev.shotsHit + 1 : prev.shotsHit;
        const newAmmo = currentWeapon.ammoCapacity === 0 ? 999 : prev.ammoLeft - 1;

        const newCombo = isHitAny && penaltyTotal === 0 ? prev.combo + 1 : 0;
        const newMaxCombo = Math.max(prev.maxCombo, newCombo);

        // 連擊加乘分數
        const comboBonus = newCombo > 2 ? (newCombo - 2) * 30 : 0;
        const netScore = Math.max(0, prev.score + pointsScored + comboBonus - penaltyTotal);
        const newHealth = Math.max(0, prev.health - healthDamage);

        // 檢查經典十發包廂是否射完 10 發
        if (mode === 'CLASSIC_TEN' && newFired >= 10) {
          setTimeout(() => {
            triggerGameOver({
              ...prev,
              shotsFired: newFired,
              shotsHit: newHit,
              score: netScore,
              combo: newCombo,
              maxCombo: newMaxCombo,
              ammoLeft: 0,
            });
          }, 300);
        }

        // 檢查極速模式生命值歸零
        if (mode === 'RAIL_SPEED' && newHealth <= 0) {
          setTimeout(() => {
            triggerGameOver({
              ...prev,
              shotsFired: newFired,
              shotsHit: newHit,
              score: netScore,
              health: 0,
            });
          }, 300);
        }

        // 如果軟木塞手槍打完單發，自動觸發快速裝填
        if (currentWeapon.ammoCapacity === 1 && newAmmo === 0) {
          setTimeout(handleReload, 80);
        }

        return {
          ...prev,
          shotsFired: newFired,
          shotsHit: newHit,
          score: netScore,
          combo: newCombo,
          maxCombo: newMaxCombo,
          ammoLeft: newAmmo,
          health: newHealth,
        };
      });
    }
  };

  // 滑鼠/觸控追蹤
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCrosshairPos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={(e) => {
        // 防止手機雙擊縮放
        e.preventDefault();
        fireShot(e.clientX, e.clientY);
      }}
      className="relative w-full h-[580px] sm:h-[620px] max-w-5xl mx-auto rounded-2xl overflow-hidden border-4 border-amber-950 shadow-2xl bg-slate-950 select-none cursor-crosshair touch-none"
      style={{
        transform: `translate(${recoilOffset.x}px, ${recoilOffset.y}px)`,
        transition: 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* 1. 夜市攤位頂部經典紅黃相間遮雨棚 */}
      <div className="absolute top-0 left-0 right-0 h-14 canopy-stripes z-30 shadow-md flex items-center justify-between px-6 border-b-2 border-amber-900">
        {/* 鎢絲吊燈串裝飾 */}
        <div className="flex items-center space-x-6">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_12px_#fde047] animate-pulse" />
          <div className="w-3.5 h-3.5 rounded-full bg-amber-200 shadow-[0_0_10px_#fef08a]" />
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185] animate-pulse" />
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
        </div>

        {/* 攤位招牌名號 */}
        <div className="px-5 py-1 bg-amber-950/90 rounded-md border border-amber-500/50 text-amber-300 font-black tracking-wider text-sm shadow-inner flex items-center gap-2">
          <span>🎯 夜市第一家</span>
          <span className="text-xs text-amber-200/80 font-normal">神準射擊棚</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185] animate-pulse" />
          <div className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_12px_#fde047]" />
        </div>
      </div>

      {/* 2. 攤位頂部即時抬頭顯示器 (HUD) */}
      <div className="absolute top-16 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* 得分與連擊 */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-xl shadow-lg">
            <span className="text-xs text-slate-400 block font-medium">目前得分</span>
            <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {stats.combo > 1 && (
            <div className="bg-rose-950/90 border border-rose-500/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
              <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span className="text-xs font-black text-rose-300">
                {stats.combo} 連擊!
              </span>
            </div>
          )}
        </div>

        {/* 模式專屬狀態 (時間 / 子彈 / 生命) */}
        <div className="flex items-center gap-3">
          {mode === 'TIME_ATTACK' && (
            <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">剩餘時間</span>
              <span
                className={`text-2xl font-black font-mono tabular-nums ${
                  stats.timeRemaining <= 10 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'
                }`}
              >
                {stats.timeRemaining}s
              </span>
            </div>
          )}

          {mode === 'CLASSIC_TEN' && (
            <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">剩餘彈藥 (門檻 ≥80%)</span>
              <span className="text-2xl font-black font-mono tabular-nums text-amber-400">
                {Math.max(0, 10 - stats.shotsFired)} / 10
              </span>
            </div>
          )}

          {mode === 'RAIL_SPEED' && (
            <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-xl text-center">
              <span className="text-xs text-slate-400 block">防線生命值</span>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3].map((heart) => (
                  <span
                    key={heart}
                    className={`text-lg transition-transform ${
                      heart <= stats.health ? 'text-rose-500 scale-110' : 'text-slate-600 opacity-40'
                    }`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 武器彈匣與換彈指示 */}
          <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3">
            <div>
              <span className="text-xs text-slate-400 block">{currentWeapon.name}</span>
              <span className="text-lg font-bold text-slate-200 font-mono tabular-nums">
                {currentWeapon.ammoCapacity === 0
                  ? '無限'
                  : stats.isReloading
                  ? '填裝中...'
                  : `${stats.ammoLeft} / ${currentWeapon.ammoCapacity}`}
              </span>
            </div>

            {currentWeapon.ammoCapacity > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReload();
                }}
                disabled={stats.isReloading || stats.ammoLeft === currentWeapon.ammoCapacity}
                className="pointer-events-auto p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition-colors"
                title="點擊裝填彈藥"
              >
                <RefreshCw className={`w-4 h-4 ${stats.isReloading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. 頂部機械滑軌鋼樑 (懸掛標靶層) */}
      <div className="absolute top-28 left-0 right-0 h-2 bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-950 border-b border-zinc-600 shadow-lg z-10">
        {/* 滑軌齒輪與螺栓 */}
        <div className="absolute -top-1 left-4 w-4 h-4 rounded-full border-2 border-zinc-500 bg-zinc-800" />
        <div className="absolute -top-1 right-4 w-4 h-4 rounded-full border-2 border-zinc-500 bg-zinc-800" />
        <div className="absolute -top-0.5 inset-x-8 h-1 bg-amber-500/20" />
      </div>

      {/* 滑軌標靶實體渲染 */}
      {targetsRef.current
        .filter((t) => t.layer === 'rail' && !t.isHit)
        .map((target) => (
          <div
            key={target.id}
            className="absolute z-10 transition-transform duration-75 pointer-events-none"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${target.width}px`,
              height: `${target.height}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* 懸吊金屬細線 */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-zinc-500/80" />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-400" />

            {/* 標靶圖像/向量造型 */}
            {target.kind === 'balloon_red' && (
              <div className="relative w-full h-full flex flex-col items-center animate-wiggle">
                <div className="w-12 h-14 rounded-full bg-gradient-to-tr from-rose-700 via-rose-500 to-rose-400 shadow-md flex items-center justify-center border border-rose-300/40">
                  <div className="w-2.5 h-3 bg-white/50 rounded-full absolute top-2 left-2.5 blur-[0.5px]" />
                  <span className="text-[10px] font-black text-white/90">100</span>
                </div>
                <div className="w-2 h-2 bg-rose-800 rotate-45 -mt-1" />
              </div>
            )}

            {target.kind === 'balloon_blue' && (
              <div className="relative w-full h-full flex flex-col items-center">
                <div className="w-12 h-14 rounded-full bg-gradient-to-tr from-sky-700 via-sky-500 to-cyan-300 shadow-md flex items-center justify-center border border-cyan-200/50">
                  <div className="w-2.5 h-3 bg-white/60 rounded-full absolute top-2 left-2.5 blur-[0.5px]" />
                  <span className="text-[10px] font-black text-white/90">160</span>
                </div>
                <div className="w-2 h-2 bg-sky-800 rotate-45 -mt-1" />
              </div>
            )}

            {target.kind === 'balloon_gold' && (
              <div className="relative w-full h-full flex flex-col items-center animate-pulse">
                <div className="w-12 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-[0_0_15px_#facc15] flex items-center justify-center border border-yellow-100">
                  <div className="w-3 h-3 bg-white/80 rounded-full absolute top-2 left-2 blur-[0.5px]" />
                  <span className="text-[11px] font-black text-amber-950">350</span>
                </div>
                <div className="w-2 h-2 bg-amber-700 rotate-45 -mt-1" />
              </div>
            )}

            {target.kind === 'lucky_cat' && (
              <div className="relative w-full h-full flex flex-col items-center animate-bounce">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-yellow-200 shadow-[0_0_20px_#facc15] flex items-center justify-center text-3xl">
                  🐱
                </div>
                <span className="text-[9px] font-black text-amber-300 mt-0.5">招財 +500</span>
              </div>
            )}

            {target.kind === 'bomb' && (
              <div className="relative w-full h-full flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-800 to-zinc-700 shadow-lg flex items-center justify-center border border-red-500/70">
                  <span className="text-xl">💣</span>
                </div>
                <div className="mt-1 px-1.5 py-0.2 bg-red-600/90 text-[9px] font-black text-white rounded">
                  陷阱 -500
                </div>
              </div>
            )}

            {target.kind === 'civilian_dog' && (
              <div className="relative w-full h-full flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-amber-100 border-2 border-amber-600 shadow-md flex items-center justify-center text-2xl">
                  🐶
                </div>
                <div className="mt-1 px-1 bg-rose-700 text-[8px] font-bold text-white rounded">
                  無辜吉祥物 -600
                </div>
              </div>
            )}
          </div>
        ))}

      {/* 4. 中層復古百葉窗格子 (4格木造翻轉門窗，具備精確定位 DOM ID) */}
      <div className="absolute top-[48%] -translate-y-1/2 left-6 right-6 h-40 z-10 grid grid-cols-4 gap-4 pointer-events-none">
        {shutters.map((shutter) => (
          <div
            id={`shutter-cell-${shutter.id}`}
            key={shutter.id}
            className="relative h-full rounded-xl wood-board border-2 border-amber-800/80 shadow-2xl overflow-hidden flex items-center justify-center"
          >
            {/* 窗台背景深邃陰影 */}
            <div className="absolute inset-0 bg-black/60 shadow-inner" />

            {/* 翻開後出現之目標 */}
            {shutter.isOpen && shutter.target && !shutter.target.isHit && (
              <div className="relative z-10 flex flex-col items-center animate-scale-up">
                {shutter.target.kind === 'lucky_cat' && (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border-2 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.7)] flex items-center justify-center text-3xl">
                      🐱
                    </div>
                    <span className="text-[10px] font-black text-yellow-300 mt-1 drop-shadow-md">
                      招財貓 +500!
                    </span>
                  </div>
                )}

                {shutter.target.kind === 'balloon_gold' && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-14 rounded-full bg-yellow-400 shadow-[0_0_15px_#fde047] flex items-center justify-center text-xl">
                      🎈
                    </div>
                    <span className="text-[10px] font-black text-yellow-300 mt-1">黃金氣球 +300</span>
                  </div>
                )}

                {shutter.target.kind === 'bomb' && (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-zinc-900 border-2 border-rose-500 shadow-lg flex items-center justify-center text-3xl">
                      💣
                    </div>
                    <span className="text-[10px] font-black text-rose-400 mt-1">炸彈勿擊! -500</span>
                  </div>
                )}

                {shutter.target.kind === 'civilian_dog' && (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-500 shadow-md flex items-center justify-center text-3xl">
                      🐕
                    </div>
                    <span className="text-[10px] font-black text-rose-400 mt-1">小狗勿打! -600</span>
                  </div>
                )}
              </div>
            )}

            {/* 百葉窗扇葉（開啟時透明度縮放，關閉時百葉木紋橫條） */}
            <div
              className={`absolute inset-0 bg-amber-950 border border-amber-900 transition-all duration-300 flex flex-col justify-between p-1.5 ${
                shutter.isOpen
                  ? 'opacity-10 scale-95 pointer-events-none'
                  : 'opacity-100 scale-100'
              }`}
            >
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <div
                  key={bar}
                  className="h-3 w-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-sm shadow-sm border-t border-amber-700/40"
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-black text-amber-500/70 tracking-widest bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                  {shutter.isOpen ? 'OPEN' : 'LOCKED'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. 命中碎屑粒子系統 */}
      {particlesRef.current.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none z-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.alpha,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* 6. 彈孔與飛鏢標記 */}
      {bulletMarksRef.current.map((bm) => (
        <div
          key={bm.id}
          className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${bm.x}%`, top: `${bm.y}%` }}
        >
          {bm.type === 'dart' ? (
            <div className="w-3 h-3 rounded-full bg-pink-500 border border-white shadow-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          ) : bm.type === 'laser_gun' ? (
            <div className="w-4 h-4 rounded-full bg-violet-500/40 border border-violet-300 blur-[1px]" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-black/75 border border-zinc-700" />
          )}
        </div>
      ))}

      {/* 7. 浮動分數與懲罰文字 */}
      {floatingTextsRef.current.map((ft) => (
        <div
          key={ft.id}
          className={`absolute pointer-events-none font-black text-base z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -translate-x-1/2 animate-float-up ${
            ft.isPenalty ? 'text-rose-500' : 'text-emerald-400'
          }`}
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}

      {/* 8. 槍口開火瞬間閃光 */}
      {muzzleFlash.active && (
        <div
          className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px]"
          style={{
            left: `${muzzleFlash.x}%`,
            top: `${muzzleFlash.y}%`,
            width: weaponId === 'laser_gun' ? '120px' : '60px',
            height: weaponId === 'laser_gun' ? '120px' : '60px',
            backgroundColor:
              weaponId === 'laser_gun'
                ? 'rgba(168, 85, 247, 0.7)'
                : weaponId === 'cork_gun'
                ? 'rgba(251, 191, 36, 0.6)'
                : 'rgba(255, 255, 255, 0.8)',
          }}
        />
      )}

      {/* 9. 底部木造射擊櫃台與彈藥置物箱 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 wood-board border-t-4 border-amber-900 z-20 flex items-center justify-between px-6 sm:px-8 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300/80 font-medium">使用武器</span>
            <span className="px-3 py-1 bg-amber-950 rounded-lg border border-amber-700 text-amber-200 text-xs font-bold">
              {currentWeapon.name}
            </span>
          </div>

          <span className="text-amber-800">|</span>

          <div className="flex items-center gap-1.5 text-xs text-amber-300/70">
            <span>命中率:</span>
            <span className="font-mono font-bold text-amber-200">
              {stats.shotsFired > 0
                ? Math.round((stats.shotsHit / stats.shotsFired) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* 遊戲操作輔助按鈕 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExit();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            結束本局
          </button>
        </div>
      </div>

      {/* 10. 動態專屬武器準心 */}
      <div
        className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{ left: `${crosshairPos.x}%`, top: `${crosshairPos.y}%` }}
      >
        {currentWeapon.crosshairType === 'cork' && (
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 opacity-90 shadow-sm" />
            <div className="absolute w-2 h-2 rounded-full bg-amber-300" />
            <div className="absolute -top-1 w-0.5 h-3 bg-amber-400" />
            <div className="absolute -bottom-1 w-0.5 h-3 bg-amber-400" />
            <div className="absolute -left-1 w-3 h-0.5 bg-amber-400" />
            <div className="absolute -right-1 w-3 h-0.5 bg-amber-400" />
          </div>
        )}

        {currentWeapon.crosshairType === 'rifle' && (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border border-cyan-400/80" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
            <div className="absolute -top-1.5 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute -bottom-1.5 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute -left-1.5 w-3 h-0.5 bg-cyan-400" />
            <div className="absolute -right-1.5 w-3 h-0.5 bg-cyan-400" />
          </div>
        )}

        {currentWeapon.crosshairType === 'dart' && (
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border border-pink-400/80 border-dashed" />
            <div className="w-2.5 h-2.5 rotate-45 bg-pink-400 shadow-[0_0_8px_#f472b6]" />
          </div>
        )}

        {currentWeapon.crosshairType === 'laser' && (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="w-10 h-10 rounded-lg border-2 border-purple-400 shadow-[0_0_10px_#c084fc]" />
            <div className="absolute w-1 h-1 bg-purple-200" />
            <div className="absolute w-12 h-0.5 bg-purple-500/40" />
            <div className="absolute h-12 w-0.5 bg-purple-500/40" />
          </div>
        )}
      </div>
    </div>
  );
};
