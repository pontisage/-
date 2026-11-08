export type GameMode = 'TIME_ATTACK' | 'CLASSIC_TEN' | 'RAIL_SPEED';

export type WeaponId = 'cork_gun' | 'bb_rifle' | 'dart' | 'laser_gun';

export interface Weapon {
  id: WeaponId;
  name: string;
  nameEn: string;
  description: string;
  ammoCapacity: number; // 0 means infinite / reload per shot
  fireRateMs: number;
  reloadTimeMs: number;
  damage: number;
  recoilIntensity: number; // 1-10
  bulletSpread: number; // pixels
  color: string;
  crosshairType: 'cork' | 'rifle' | 'dart' | 'laser';
}

export type TargetKind =
  | 'balloon_red'
  | 'balloon_blue'
  | 'balloon_gold'
  | 'lucky_cat'
  | 'bomb'
  | 'civilian_dog';

export interface TargetItem {
  id: string;
  kind: TargetKind;
  layer: 'rail' | 'shutter'; // 頂部機械滑軌 or 中層隨機百葉窗
  shutterIndex?: number;
  x: number; // percentage or px
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1;
  points: number;
  penaltyHealth: number;
  penaltyPoints: number;
  expiresAt: number; // for shutters
  isHit: boolean;
  scale?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
  isPenalty?: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export interface BulletMark {
  id: string;
  x: number;
  y: number;
  type: WeaponId;
  createdAt: number;
}

export interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  accuracy: number;
  mode: GameMode;
  weapon: WeaponId;
  date: string;
  shotsHit?: number;
  maxCombo?: number;
  ticketsEarned?: number;
  password?: string;
  isLocalOnly?: boolean;
}

export interface GameStats {
  shotsFired: number;
  shotsHit: number;
  score: number;
  combo: number;
  maxCombo: number;
  health: number; // 0-3 for rail speed
  timeRemaining: number;
  ammoLeft: number;
  isReloading: boolean;
}
