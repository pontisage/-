import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JWT } from 'google-auth-library';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
  [key: string]: unknown;
}

// 取得 Service Account 憑證 (支援環境變數 JSON 字串、檔案路徑、私鑰換行修復)
function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  // 去除可能包覆的單雙引號
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    raw = raw.substring(1, raw.length - 1).trim();
  }

  try {
    // 1. 直接是 JSON 物件字串
    if (raw.startsWith('{') && raw.endsWith('}')) {
      const parsed = JSON.parse(raw);
      if (parsed.client_email && parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        return parsed;
      }
    }

    // 2. 支援 Base64 編碼的 JSON 字串
    if (!raw.startsWith('{') && !raw.includes('/') && !raw.includes('\\') && raw.length > 80) {
      try {
        const decoded = Buffer.from(raw, 'base64').toString('utf-8');
        if (decoded.startsWith('{')) {
          const parsed = JSON.parse(decoded);
          if (parsed.client_email && parsed.private_key) {
            parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
            return parsed;
          }
        }
      } catch {
        // 非 Base64 格式，繼續嘗試路徑解析
      }
    }

    // 3. 檔案路徑解析 (支援絕對路徑、相對專案根目錄、或預設 service-account.json)
    const possiblePaths = [
      raw,
      path.resolve(process.cwd(), raw),
      path.resolve(__dirname, raw),
      path.resolve(process.cwd(), 'service-account.json'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8').trim();
        const parsed = JSON.parse(content);
        if (parsed.client_email && parsed.private_key) {
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('解析 GOOGLE_SERVICE_ACCOUNT_JSON 失敗:', err);
  }

  return null;
}

// 取得 Google 試算表 ID (支援純 ID 或完整試算表網址自動擷取)
function getGoogleSheetId(): string | null {
  const raw = process.env.GOOGLE_SHEET_ID?.trim();
  if (!raw) return null;

  // 若使用者填入完整網址：https://docs.google.com/spreadsheets/d/[ID]/edit... 自動擷取中間 ID
  const urlMatch = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // 否則去除前後引號回傳純 ID
  return raw.replace(/['"]/g, '').trim();
}

function getAuthClient(creds: ServiceAccountCredentials) {
  return new JWT({
    email: creds.client_email,
    key: creds.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// 工作表名稱常數 (嚴格遵照使用者指定名稱)
const SHEET_GAME_RECORD = '遊戲記錄';
const SHEET_PLAYERS = '玩家';
const SHEET_SETTINGS_LEADERBOARD = '設定';

function formatTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. 取得 Google Sheets 服務設定狀態與三張指定工作表資訊
  app.get('/api/sheets-status', (req, res) => {
    const creds = getServiceAccountCredentials();
    const sheetId = getGoogleSheetId();

    res.json({
      isConfigured: !!(creds && sheetId),
      hasCredentials: !!creds,
      clientEmail: creds ? creds.client_email : null,
      hasSheetId: !!sheetId,
      sheetId: sheetId ? `${sheetId.substring(0, 6)}...${sheetId.substring(sheetId.length - 4)}` : null,
      sheets: [
        {
          name: SHEET_GAME_RECORD,
          columns: ['玩家名稱', '密碼', '最後一次登入時間'],
        },
        {
          name: SHEET_PLAYERS,
          columns: ['玩家名稱', '密碼', '最後一次登入時間'],
        },
        {
          name: SHEET_SETTINGS_LEADERBOARD,
          columns: ['時間', '玩家名稱', '遊戲模式', '最終得分', '命中率', '擊破數', '最高連擊', '使用武器', '獲得夜市幣'],
        },
      ],
    });
  });

  // 2. 玩家登入驗證 (資料來源嚴格為「玩家」工作表)
  app.post('/api/player/login', async (req, res) => {
    const creds = getServiceAccountCredentials();
    const sheetId = getGoogleSheetId();
    const { playerName, password = '' } = req.body;

    if (!playerName || !playerName.trim()) {
      return res.status(400).json({ success: false, message: '請輸入射手名稱' });
    }

    const cleanName = playerName.trim();
    const cleanPwd = String(password ?? '').trim();
    const loginTime = formatTimestamp();

    if (!creds || !sheetId) {
      return res.json({
        success: true,
        syncedWithSheets: false,
        message: '未配置試算表環境變數，以本機玩家身份遊玩',
        player: { playerName: cleanName, lastLogin: loginTime },
      });
    }

    try {
      const client = getAuthClient(creds);

      // (A) 嚴格從「玩家」工作表讀取並驗證射手資料
      const playersRes = await client.request<{ values?: string[][] }>({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_PLAYERS)}!A:C?valueRenderOption=FORMATTED_VALUE`,
        method: 'GET',
      });

      const playerRows = playersRes.data?.values || [];
      const startIndex = playerRows.length > 0 && playerRows[0][0] === '玩家名稱' ? 1 : 0;
      
      let playerRowIndex = -1;
      let matchedRow: string[] | null = null;

      for (let i = startIndex; i < playerRows.length; i++) {
        const row = playerRows[i];
        if (row && String(row[0] ?? '').trim().toLowerCase() === cleanName.toLowerCase()) {
          playerRowIndex = i + 1; // 1-based index in sheets
          matchedRow = row;
          break;
        }
      }

      // 若在「玩家」工作表中查無此玩家
      if (playerRowIndex <= 0 || !matchedRow) {
        return res.status(404).json({
          success: false,
          notFound: true,
          message: `「玩家」工作表中查無射手「${cleanName}」，請檢查名稱或切換至【註冊新玩家】建立資料！`,
        });
      }

      // 密碼比對驗證 (欄位 B: 密碼)
      const storedPwd = String(matchedRow[1] ?? '').trim();
      if (storedPwd !== '' && cleanPwd !== storedPwd) {
        return res.status(401).json({
          success: false,
          message: '密碼驗證失敗！請輸入在「玩家」工作表登記之正確密碼。',
        });
      }

      // 驗證通過：更新「玩家」工作表之「最後一次登入時間」(欄位 C)
      try {
        await client.request({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_PLAYERS)}!C${playerRowIndex}?valueInputOption=USER_ENTERED`,
          method: 'PUT',
          data: {
            values: [[loginTime]],
          },
        });
      } catch (updateErr) {
        console.warn('更新登入時間警告:', updateErr);
      }

      // 寫入「遊戲記錄」工作表 (日誌留存)
      try {
        await client.request({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_GAME_RECORD)}!A:C:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
          method: 'POST',
          data: {
            values: [[cleanName, cleanPwd || storedPwd || '0000', loginTime]],
          },
        });
      } catch (logErr) {
        console.warn('寫入遊戲記錄日誌警告:', logErr);
      }

      return res.json({
        success: true,
        syncedWithSheets: true,
        message: `「玩家」工作表驗證成功！歡迎射手「${cleanName}」入場！`,
        player: { playerName: cleanName, lastLogin: loginTime },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('「玩家」工作表驗證失敗:', errorMsg);
      return res.status(500).json({
        success: false,
        message: `連線 Google Sheets「玩家」工作表驗證失敗：${errorMsg}`,
      });
    }
  });

  // 2-B. 註冊新玩家 (寫入「玩家」工作表)
  app.post('/api/player/register', async (req, res) => {
    const creds = getServiceAccountCredentials();
    const sheetId = getGoogleSheetId();
    const { playerName, password = '0000' } = req.body;

    if (!playerName || !playerName.trim()) {
      return res.status(400).json({ success: false, message: '請提供玩家名稱' });
    }

    const cleanName = playerName.trim();
    const cleanPwd = String(password).trim() || '0000';
    const loginTime = formatTimestamp();

    if (!creds || !sheetId) {
      return res.json({
        success: true,
        syncedWithSheets: false,
        message: '未配置試算表環境變數，以本機玩家身份完成登記',
        player: { playerName: cleanName, lastLogin: loginTime },
      });
    }

    try {
      const client = getAuthClient(creds);

      // 檢查是否已存在於「玩家」工作表
      const playersRes = await client.request<{ values?: string[][] }>({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_PLAYERS)}!A:C?valueRenderOption=FORMATTED_VALUE`,
        method: 'GET',
      });

      const playerRows = playersRes.data?.values || [];
      const startIndex = playerRows.length > 0 && playerRows[0][0] === '玩家名稱' ? 1 : 0;

      for (let i = startIndex; i < playerRows.length; i++) {
        const row = playerRows[i];
        if (row && String(row[0] ?? '').trim().toLowerCase() === cleanName.toLowerCase()) {
          return res.status(409).json({
            success: false,
            message: `射手「${cleanName}」已存在於「玩家」工作表，請切換至【登入】頁籤輸入密碼！`,
          });
        }
      }

      // 新增至「玩家」工作表 (欄位: 玩家名稱, 密碼, 最後一次登入時間)
      await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_PLAYERS)}!A:C:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        method: 'POST',
        data: {
          values: [[cleanName, cleanPwd, loginTime]],
        },
      });

      // 同步追加寫入「遊戲記錄」工作表
      await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_GAME_RECORD)}!A:C:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        method: 'POST',
        data: {
          values: [[cleanName, cleanPwd, loginTime]],
        },
      });

      return res.json({
        success: true,
        syncedWithSheets: true,
        message: `恭喜！已成功將「${cleanName}」註冊至「玩家」工作表，並已完成登入！`,
        player: { playerName: cleanName, lastLogin: loginTime },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('註冊新玩家至「玩家」工作表失敗:', errorMsg);
      return res.status(500).json({
        success: false,
        message: `寫入「玩家」工作表失敗：${errorMsg}`,
      });
    }
  });

  // 3. 取得排行榜記錄 (從「設定」工作表讀取)
  // 欄位: 時間, 玩家名稱, 遊戲模式, 最終得分, 命中率, 擊破數, 最高連擊, 使用武器, 獲得夜市幣
  app.get('/api/leaderboard', async (req, res) => {
    const creds = getServiceAccountCredentials();
    const sheetId = getGoogleSheetId();

    if (!creds || !sheetId) {
      return res.json({
        syncedWithSheets: false,
        message: '尚未配置 GOOGLE_SERVICE_ACCOUNT_JSON 或 GOOGLE_SHEET_ID 環境變數',
        scores: [],
      });
    }

    try {
      const client = getAuthClient(creds);
      const response = await client.request<{ values?: string[][] }>({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_SETTINGS_LEADERBOARD)}!A:I?valueRenderOption=FORMATTED_VALUE`,
        method: 'GET',
      });

      const rows = response.data?.values || [];
      const scores = [];

      // 若有第一列表頭，從第二行開始讀取 (檢查 index 3 是否為數值)
      const startIndex = rows.length > 0 && isNaN(Number(rows[0][3])) ? 1 : 0;
      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 4) continue;

        scores.push({
          id: `setting-row-${i}`,
          date: row[0] || new Date().toISOString().substring(0, 10),
          playerName: row[1] || '匿名射手',
          mode: row[2] || 'TIME_ATTACK',
          score: Number(String(row[3]).replace(/,/g, '')) || 0,
          accuracy: Number(String(row[4]).replace(/%/g, '')) || 0,
          shotsHit: Number(row[5]) || 0,
          maxCombo: Number(row[6]) || 0,
          weapon: row[7] || 'cork_gun',
          ticketsEarned: Number(row[8]) || 0,
          isLocalOnly: false,
        });
      }

      scores.sort((a, b) => b.score - a.score);

      return res.json({
        syncedWithSheets: true,
        sheetTitle: SHEET_SETTINGS_LEADERBOARD,
        scores,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('讀取「設定」工作表失敗:', errorMsg);
      return res.status(500).json({
        syncedWithSheets: false,
        error: errorMsg,
        message: `讀取「${SHEET_SETTINGS_LEADERBOARD}」工作表失敗，請確認該試算表已將 Service Account Email 加入共用編輯權限。`,
        scores: [],
      });
    }
  });

  // 4. 提交新遊戲記錄至 Google Sheets
  // 同步寫入：
  // 1.「設定」工作表: [時間, 玩家名稱, 遊戲模式, 最終得分, 命中率, 擊破數, 最高連擊, 使用武器, 獲得夜市幣]
  // 2.「玩家」工作表: [玩家名稱, 密碼, 最後一次登入時間] (更新登入時間)
  // 3.「遊戲記錄」工作表: [玩家名稱, 密碼, 最後一次登入時間] (追加登入日誌)
  app.post('/api/leaderboard', async (req, res) => {
    const creds = getServiceAccountCredentials();
    const sheetId = getGoogleSheetId();
    const {
      playerName = '夜市快槍手',
      password = '0000',
      score = 0,
      accuracy = 0,
      mode = 'TIME_ATTACK',
      weapon = 'cork_gun',
      date,
      shotsHit = 0,
      maxCombo = 0,
      ticketsEarned = 0,
    } = req.body;

    const timestamp = date || formatTimestamp();
    const cleanName = String(playerName).trim() || '夜市快槍手';
    const cleanPwd = String(password).trim() || '0000';

    if (!creds || !sheetId) {
      return res.json({
        success: false,
        syncedWithSheets: false,
        message: '伺服器未配置 GOOGLE_SERVICE_ACCOUNT_JSON，記錄將僅保存在本地客戶端。',
      });
    }

    try {
      const client = getAuthClient(creds);

      // (A) 寫入「設定」工作表 (嚴格 9 欄)
      // 欄位: 時間, 玩家名稱, 遊戲模式, 最終得分, 命中率, 擊破數, 最高連擊, 使用武器, 獲得夜市幣
      await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_SETTINGS_LEADERBOARD)}!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        method: 'POST',
        data: {
          values: [
            [
              timestamp,
              cleanName,
              mode,
              score,
              `${accuracy}%`,
              shotsHit,
              maxCombo,
              weapon,
              ticketsEarned,
            ],
          ],
        },
      });

      // (B) 寫入「遊戲記錄」工作表 (嚴格 3 欄: 玩家名稱, 密碼, 最後一次登入時間)
      await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_GAME_RECORD)}!A:C:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        method: 'POST',
        data: {
          values: [[cleanName, cleanPwd, timestamp]],
        },
      });

      // (C) 更新或新增「玩家」工作表 (嚴格 3 欄: 玩家名稱, 密碼, 最後一次登入時間)
      try {
        const playersRes = await client.request<{ values?: string[][] }>({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_PLAYERS)}!A:C?valueRenderOption=FORMATTED_VALUE`,
          method: 'GET',
        });

        const playerRows = playersRes.data?.values || [];
        let playerRowIndex = -1;

        for (let i = 1; i < playerRows.length; i++) {
          if (playerRows[i] && playerRows[i][0] === cleanName) {
            playerRowIndex = i + 1;
            break;
          }
        }

        if (playerRowIndex > 0) {
          // 更新最後登入時間
          await client.request({
            url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_PLAYERS)}!C${playerRowIndex}?valueInputOption=USER_ENTERED`,
            method: 'PUT',
            data: {
              values: [[timestamp]],
            },
          });
        } else {
          // 新增至玩家表
          await client.request({
            url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_PLAYERS)}!A:C:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
            method: 'POST',
            data: {
              values: [[cleanName, cleanPwd, timestamp]],
            },
          });
        }
      } catch (playerErr) {
        console.warn('更新玩家工作表提示:', playerErr);
      }

      return res.json({
        success: true,
        syncedWithSheets: true,
        message: '恭喜！戰績已成功寫入「設定」工作表，玩家資料與記錄亦同步至「玩家」與「遊戲記錄」！',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('寫入 Google Sheets 失敗:', errorMsg);
      return res.status(500).json({
        success: false,
        syncedWithSheets: false,
        error: errorMsg,
        message: '寫入失敗，請確認該試算表已存在「遊戲記錄」、「玩家」、「設定」三張工作表，且 Service Account 已被授予編輯者權限。',
      });
    }
  });

  // 前端 Vite 靜態與中間件
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`夜市神射手伺服器已啟動於 http://0.0.0.0:${PORT}`);
  });
}

startServer();
