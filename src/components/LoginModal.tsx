import React, { useState } from 'react';
import { sheetsService } from '../services/sheetsService';
import { soundEngine } from '../utils/audio';
import {
  UserCheck,
  Lock,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  X,
  Database,
  Sparkles,
  Eye,
  EyeOff,
  Crosshair,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: (player: { playerName: string; password?: string; lastLogin?: string }) => void;
  onClose?: () => void;
  isRequired?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  isRequired = false,
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [playerName, setPlayerName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canQuickRegister, setCanQuickRegister] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim();
    if (!cleanName) {
      setErrorMessage('請輸入射手玩家名稱');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setCanQuickRegister(false);

    const res = await sheetsService.loginPlayer(cleanName, password);
    setIsLoading(false);

    if (res.success && res.player) {
      soundEngine.playTicketSound();
      setSuccessMessage(res.message);
      setTimeout(() => {
        onSuccess({
          playerName: res.player!.playerName,
          password,
          lastLogin: res.player!.lastLogin,
        });
      }, 700);
    } else {
      setErrorMessage(res.message);
      if (res.notFound) {
        setCanQuickRegister(true);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim();
    if (!cleanName) {
      setErrorMessage('請輸入欲註冊之射手玩家名稱');
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMessage('兩次輸入之密碼不一致，請再次確認');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await sheetsService.registerPlayer(cleanName, password || '0000');
    setIsLoading(false);

    if (res.success && res.player) {
      soundEngine.playTicketSound();
      setSuccessMessage(res.message);
      setTimeout(() => {
        onSuccess({
          playerName: res.player!.playerName,
          password: password || '0000',
          lastLogin: res.player!.lastLogin,
        });
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  const switchToRegisterWithName = () => {
    setTab('REGISTER');
    setErrorMessage('');
    setCanQuickRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-600 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative animate-scale-up">
        {/* 關閉按鈕 (非強制時可點擊關閉) */}
        {!isRequired && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 標題與驗證來源說明 */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Crosshair className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
            射擊靶場入場登記 · 玩家登入
          </h2>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-amber-500/30 text-[11px] text-amber-200/90 font-mono">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>驗證資料來源：Google Sheets【玩家】工作表</span>
          </div>

          {isRequired && (
            <p className="text-xs text-rose-400 font-medium mt-2">
              ※ 開始遊玩挑戰前，必須先完成玩家登入驗證！
            </p>
          )}
        </div>

        {/* 頁籤切換：登入 / 註冊新玩家 */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 my-4">
          <button
            type="button"
            onClick={() => {
              setTab('LOGIN');
              setErrorMessage('');
              setSuccessMessage('');
              setCanQuickRegister(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'LOGIN'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>射手登入</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('REGISTER');
              setErrorMessage('');
              setSuccessMessage('');
              setCanQuickRegister(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'REGISTER'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>註冊新射手</span>
          </button>
        </div>

        {/* 錯誤反饋 */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-rose-300 text-xs mb-4 flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {canQuickRegister && (
              <button
                type="button"
                onClick={switchToRegisterWithName}
                className="mt-1 self-start px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded transition-colors cursor-pointer"
              >
                👉 立即以此名稱註冊至「玩家」工作表
              </button>
            )}
          </div>
        )}

        {/* 成功反饋 */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 表單內容 */}
        {tab === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>射手名稱 (於「玩家」工作表登記之名稱)</span>
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="例如：士林夜市槍王阿豪、逢甲神準小林"
                maxLength={20}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>密碼 (預設: 0000 或留空驗證)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? '隱藏' : '顯示'}</span>
                </button>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入玩家密碼"
                maxLength={20}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !playerName.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>向 Google Sheets【玩家】工作表驗證中...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>登入驗證並進入遊戲</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>欲註冊之射手名稱 (將新增至「玩家」工作表)</span>
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="請輸入欲登記的稱號或本名"
                maxLength={20}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>設定密碼 (預設建議為 0000)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? '隱藏' : '顯示'}</span>
                </button>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼 (預設: 0000)"
                maxLength={20}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>再次確認密碼</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次輸入相同密碼"
                maxLength={20}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !playerName.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>寫入 Google Sheets【玩家】工作表中...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>登記至「玩家」工作表並登入</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 提示備註 */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            🏮 驗證成功後，系統將記錄您的登入時間至「玩家」表，並同步記錄於「遊戲記錄」工作表。
          </p>
        </div>
      </div>
    </div>
  );
};
