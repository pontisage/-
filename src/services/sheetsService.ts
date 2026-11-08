import { ScoreEntry, GameMode } from '../types/game';

const LOCAL_STORAGE_KEY = 'nightmarket_marksman_highscores_v1';
const TICKETS_STORAGE_KEY = 'nightmarket_marksman_tickets';
const PRIZES_STORAGE_KEY = 'nightmarket_marksman_unlocked_prizes';

// 預設經典夜市高分榜 (本地備援與首度載入用)
const DEFAULT_SCORES: ScoreEntry[] = [
  {
    id: 'score-1',
    playerName: '士林夜市槍王阿豪',
    score: 8450,
    accuracy: 94,
    mode: 'TIME_ATTACK',
    weapon: 'bb_rifle',
    date: '2026-11-06'
  },
  {
    id: 'score-2',
    playerName: '逢甲神準小林',
    score: 7200,
    accuracy: 91,
    mode: 'TIME_ATTACK',
    weapon: 'cork_gun',
    date: '2026-11-07'
  },
  {
    id: 'score-3',
    playerName: '六合飛鏢盲俠',
    score: 6850,
    accuracy: 100,
    mode: 'CLASSIC_TEN',
    weapon: 'dart',
    date: '2026-11-05'
  },
  {
    id: 'score-4',
    playerName: '饒河雷射特工',
    score: 6400,
    accuracy: 88,
    mode: 'RAIL_SPEED',
    weapon: 'laser_gun',
    date: '2026-11-07'
  },
  {
    id: 'score-5',
    playerName: '台南大東氣球殺手',
    score: 5900,
    accuracy: 85,
    mode: 'TIME_ATTACK',
    weapon: 'cork_gun',
    date: '2026-11-04'
  },
  {
    id: 'score-6',
    playerName: '羅東夜市小霸王',
    score: 5100,
    accuracy: 90,
    mode: 'CLASSIC_TEN',
    weapon: 'bb_rifle',
    date: '2026-11-03'
  }
];

export interface SheetsServerStatus {
  isConfigured: boolean;
  hasCredentials: boolean;
  clientEmail: string | null;
  hasSheetId: boolean;
  sheetId: string | null;
}

class SheetsService {
  // 檢查後端 Service Account 與 Google Sheet ID 設定狀態
  public async getServerStatus(): Promise<SheetsServerStatus> {
    try {
      const res = await fetch('/api/sheets-status');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('檢查 Google Sheets 設定狀態失敗:', err);
    }

    return {
      isConfigured: false,
      hasCredentials: false,
      clientEmail: null,
      hasSheetId: false,
      sheetId: null,
    };
  }

  // 讀取本地排行榜
  public getLocalScores(): ScoreEntry[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
        return DEFAULT_SCORES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SCORES;
    }
  }

  // 取得排行榜 (優先從後端 Service Account Google Sheets 讀取，失敗時無縫切換本地)
  public async getScores(modeFilter?: GameMode): Promise<{ scores: ScoreEntry[]; fromSheets: boolean; message?: string }> {
    let scores: ScoreEntry[] = this.getLocalScores();
    let fromSheets = false;
    let message: string | undefined;

    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.syncedWithSheets && Array.isArray(data.scores)) {
          scores = data.scores;
          fromSheets = true;
        } else if (data.message) {
          message = data.message;
        }
      }
    } catch (e) {
      console.warn('Google Sheets 伺服端讀取失敗，使用本機備援', e);
      message = '目前使用本地高分記錄';
    }

    if (modeFilter) {
      scores = scores.filter((s) => s.mode === modeFilter);
    }

    return {
      scores: scores.sort((a, b) => b.score - a.score).slice(0, 50),
      fromSheets,
      message,
    };
  }

  // 提交分數至 Google Sheets (同時寫入 LocalStorage)
  public async submitScore(entry: Omit<ScoreEntry, 'id'>): Promise<{ success: boolean; syncedWithSheets: boolean; message: string }> {
    const newEntry: ScoreEntry = {
      ...entry,
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    // 1. 先寫入本地備援
    const current = this.getLocalScores();
    current.unshift(newEntry);
    current.sort((a, b) => b.score - a.score);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current.slice(0, 50)));

    // 2. 透過後端 Service Account 寫入 Google Sheets
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          syncedWithSheets: !!data.syncedWithSheets,
          message: data.message || '分數已成功同步寫入 Google 試算表！',
        };
      } else {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: true,
          syncedWithSheets: false,
          message: errorData.message || '分數已保存在本地，伺服端 Google Sheets 暫未同步。',
        };
      }
    } catch (e) {
      console.error('Google Sheets API 串接錯誤', e);
      return {
        success: true,
        syncedWithSheets: false,
        message: '連線暫時中斷，分數已妥善保存在本地！',
      };
    }
  }

  // 玩家夜市幣管理 (對應「設定」工作表第 9 欄)
  public getTickets(): number {
    return parseInt(localStorage.getItem(TICKETS_STORAGE_KEY) || '150', 10);
  }

  public addTickets(amount: number): number {
    const current = this.getTickets();
    const updated = Math.max(0, current + amount);
    localStorage.setItem(TICKETS_STORAGE_KEY, updated.toString());
    return updated;
  }

  // 玩家登入 Session 管理 (驗證來源為「玩家」工作表)
  public getCurrentPlayer(): { playerName: string; password?: string; lastLogin?: string } | null {
    try {
      const stored = localStorage.getItem('nightmarket_marksman_player_session');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  }

  public setCurrentPlayer(player: { playerName: string; password?: string; lastLogin?: string } | null): void {
    if (player) {
      localStorage.setItem('nightmarket_marksman_player_session', JSON.stringify(player));
    } else {
      localStorage.removeItem('nightmarket_marksman_player_session');
    }
  }

  public logout(): void {
    localStorage.removeItem('nightmarket_marksman_player_session');
  }

  // 登入驗證 (以 Google Sheets「玩家」工作表為資料來源)
  public async loginPlayer(
    playerName: string,
    password = ''
  ): Promise<{
    success: boolean;
    notFound?: boolean;
    message: string;
    player?: { playerName: string; lastLogin: string };
  }> {
    try {
      const res = await fetch('/api/player/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        this.setCurrentPlayer({
          playerName: data.player?.playerName || playerName,
          password,
          lastLogin: data.player?.lastLogin,
        });
        return {
          success: true,
          message: data.message || '登入成功',
          player: data.player,
        };
      }

      return {
        success: false,
        notFound: data.notFound,
        message: data.message || '登入驗證失敗',
      };
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `無法連線至伺服端驗證：${err}`,
      };
    }
  }

  // 註冊新玩家 (寫入 Google Sheets「玩家」工作表)
  public async registerPlayer(
    playerName: string,
    password = '0000'
  ): Promise<{
    success: boolean;
    message: string;
    player?: { playerName: string; lastLogin: string };
  }> {
    try {
      const res = await fetch('/api/player/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        this.setCurrentPlayer({
          playerName: data.player?.playerName || playerName,
          password,
          lastLogin: data.player?.lastLogin,
        });
        return {
          success: true,
          message: data.message || '註冊並登入成功',
          player: data.player,
        };
      }

      return {
        success: false,
        message: data.message || '註冊失敗',
      };
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `連線伺服器註冊失敗：${err}`,
      };
    }
  }
}

export const sheetsService = new SheetsService();

