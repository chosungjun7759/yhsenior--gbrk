/**
 * LoginScreen.tsx
 * Firebase Auth 이메일/비밀번호 로그인 화면
 */
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Heart, Eye, EyeOff, Lock, Mail } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (e: any) {
      const code = e.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("이메일 또는 비밀번호가 틀렸습니다.");
      } else if (code === "auth/invalid-email") {
        setError("이메일 형식이 올바르지 않습니다.");
      } else if (code === "auth/too-many-requests") {
        setError("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) { setError("이메일을 입력해주세요."); return; }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      setError("");
    } catch {
      setError("이메일 전송에 실패했습니다. 이메일 주소를 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">

        {/* 로고 */}
        <div className="text-center space-y-2">
          <div className="bg-blue-600 text-white rounded-2xl p-3.5 inline-block shadow-md">
            <Heart className="h-8 w-8 fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">연희노인복지관</h1>
          <p className="text-xs bg-slate-100 text-slate-500 font-semibold py-1.5 px-3 rounded-lg inline-block">
            전자결재 휴가관리 시스템
          </p>
        </div>

        {!showReset ? (
          /* 로그인 폼 */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">회사 이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="example@yhsenior.or.kr"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="비밀번호 입력"
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white"
                />
                <button onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

            <button
              onClick={handleLogin} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>

            <button onClick={() => { setShowReset(true); setResetEmail(email); setError(""); }}
              className="w-full text-xs text-slate-400 hover:text-blue-500 transition-colors cursor-pointer text-center">
              비밀번호를 잊으셨나요?
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              초기 비밀번호: <span className="font-bold text-slate-600">Yeonhee0000!</span>
            </p>
          </div>
        ) : (
          /* 비밀번호 재설정 폼 */
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">비밀번호 재설정</p>
              <p className="text-xs text-slate-400 mt-1">회사 이메일로 재설정 링크를 보내드려요</p>
            </div>
            {resetSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-emerald-700">✅ 이메일을 전송했습니다!</p>
                <p className="text-xs text-emerald-600 mt-1">메일함을 확인해주세요.</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">회사 이메일</label>
                <input type="email" value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="example@yhsenior.or.kr"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white" />
              </div>
            )}
            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            {!resetSent && (
              <button onClick={handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl text-sm cursor-pointer">
                재설정 이메일 발송
              </button>
            )}
            <button onClick={() => { setShowReset(false); setResetSent(false); setError(""); }}
              className="w-full text-xs text-slate-400 hover:text-slate-600 cursor-pointer text-center">
              ← 로그인으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
