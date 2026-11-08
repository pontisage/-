import { Weapon } from '../types/game';

export const WEAPONS: Record<string, Weapon> = {
  cork_gun: {
    id: 'cork_gun',
    name: '復古軟木塞手槍',
    nameEn: 'Vintage Cork Pistol',
    description: '夜市傳統單發氣壓軟木塞槍。精準無偏差，經典「啵！」聲百聽不厭，打一發裝一發。',
    ammoCapacity: 1,
    fireRateMs: 400,
    reloadTimeMs: 420,
    damage: 100,
    recoilIntensity: 3,
    bulletSpread: 0,
    color: '#f59e0b',
    crosshairType: 'cork'
  },
  bb_rifle: {
    id: 'bb_rifle',
    name: '連發BB玩具步槍',
    nameEn: 'Automatic BB Rifle',
    description: '30發大彈匣連續壓制。適合掃射成群氣球與高速滑軌標靶，注意後座力微幅晃動。',
    ammoCapacity: 30,
    fireRateMs: 120,
    reloadTimeMs: 1200,
    damage: 85,
    recoilIntensity: 5,
    bulletSpread: 12,
    color: '#06b6d4',
    crosshairType: 'rifle'
  },
  dart: {
    id: 'dart',
    name: '磁吸夜市飛鏢',
    nameEn: 'Magnetic Night Dart',
    description: '重力手拋飛鏢，破空呼嘯！精準擊中氣球中心享 1.5 倍暴擊彩票加乘，考驗拋物預判。',
    ammoCapacity: 0, // 無限/單次冷卻
    fireRateMs: 550,
    reloadTimeMs: 0,
    damage: 150,
    recoilIntensity: 2,
    bulletSpread: 4,
    color: '#ec4899',
    crosshairType: 'dart'
  },
  laser_gun: {
    id: 'laser_gun',
    name: '霓虹雷射手槍',
    nameEn: 'Neon Laser Blaster',
    description: '攤商私藏科技結晶！發射高能電光束，一槍貫穿直線軌道上所有目標，連射5發需散熱。',
    ammoCapacity: 5,
    fireRateMs: 250,
    reloadTimeMs: 1100,
    damage: 200,
    recoilIntensity: 6,
    bulletSpread: 0,
    color: '#8b5cf6',
    crosshairType: 'laser'
  }
};
