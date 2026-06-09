/**
 * ChangePasswordModal.tsx
 * Firebase Auth 비밀번호 변경
 */
import { useState } from "react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import { Lock, Eye, EyeOff, X } from "lucide-react";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError("");
    if (next.length < 6) { setError("새 비밀번호는 6자리 이상이어야 합니다."); return; }
    if (next !== confirm) { setError("새 비밀번호가 일치하지 않습니다."); return; }

    const user = auth.currentUser;
    if (!user || !user.email) { setError("로그인 정보를 찾을 수 없습니다."); return; }

    setLoading(true);
    try {
      // 재인증
      const credential = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user, credential);
      // 비밀번호 변경
      await updatePassword(user, next);
      setSaved(true);
      setTimeout(() => onClose(), 1000);
    } catch (e: any) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("현재 비밀번호가 틀립니다.");
      } else {
        setError("비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white pr-10";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9900, background:"rgba(10,15,30,.80)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"380px", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock size={18} color="#1d4ed8" />
            <span className="text-base font-black text-slate-900">비밀번호 변경</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">현재 비밀번호</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={current}
                onChange={e => setCurrent(e.target.value)} placeholder="현재 비밀번호"
                className={inputCls} />
              <button onClick={() => setShowCurrent(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">새 비밀번호 (6자리 이상)</label>
            <div className="relative">
              <input type={showNext ? "text" : "password"} value={next}
                onChange={e => setNext(e.target.value)} placeholder="새 비밀번호"
                className={inputCls} />
              <button onClick={() => setShowNext(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                {showNext ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">새 비밀번호 확인</label>
            <input type="password" value={confirm}
              onChange={e => setConfirm(e.target.value)} placeholder="새 비밀번호 재입력"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white" />
          </div>
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer">
            취소
          </button>
          <button onClick={handleSave} disabled={loading}
            className={`flex-[2] py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors ${saved ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"}`}>
            {saved ? "✅ 변경됨!" : loading ? "처리 중..." : "비밀번호 변경"}
          </button>
        </div>
      </div>
    </div>
  );
}
