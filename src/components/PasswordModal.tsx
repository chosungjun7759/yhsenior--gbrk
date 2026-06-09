/**
 * PasswordModal.tsx
 * 비밀번호 입력 / 변경 모달
 */
import { useState } from "react";
import { User } from "../types";
import { Lock, Eye, EyeOff, X } from "lucide-react";

// ── 로그인 비밀번호 입력 ──────────────────────────────────
interface LoginPasswordProps {
  user: User;
  onConfirm: (pw: string) => void;
  onCancel: () => void;
  error?: string;
}

export function LoginPasswordModal({ user, onConfirm, onCancel, error }: LoginPasswordProps) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9900, background:"rgba(10,15,30,.80)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"32px", width:"100%", maxWidth:"360px", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white rounded-lg p-1.5">
              <Lock size={16} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-400">{user.title}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500">비밀번호</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === "Enter" && pw && onConfirm(pw)}
              placeholder="비밀번호 입력"
              maxLength={20}
              autoFocus
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white pr-10"
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-bold">{error}</p>
          )}

          <p className="text-[11px] text-slate-400">최초 비밀번호는 0000 입니다.</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={() => pw && onConfirm(pw)}
            disabled={!pw}
            className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 비밀번호 변경 ──────────────────────────────────────────
interface ChangePasswordProps {
  user: User;
  onSave: (newPw: string) => void;
  onClose: () => void;
}

export function ChangePasswordModal({ user, onSave, onClose }: ChangePasswordProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const currentPw = user.password ?? "0000";
    if (current !== currentPw) { setError("현재 비밀번호가 틀립니다."); return; }
    if (next.length < 4) { setError("새 비밀번호는 4자리 이상이어야 합니다."); return; }
    if (next !== confirm) { setError("새 비밀번호가 일치하지 않습니다."); return; }
    setError("");
    setSaved(true);
    setTimeout(() => { onSave(next); onClose(); }, 700);
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
            <label className="block text-xs font-bold text-slate-500 mb-1.5">새 비밀번호</label>
            <div className="relative">
              <input type={showNext ? "text" : "password"} value={next}
                onChange={e => setNext(e.target.value)} placeholder="새 비밀번호 (4자리 이상)"
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
              className={inputCls.replace("pr-10","")} />
          </div>

          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer">
            취소
          </button>
          <button onClick={handleSave}
            className={`flex-[2] py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors ${saved ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700"}`}>
            {saved ? "변경됨!" : "비밀번호 변경"}
          </button>
        </div>
      </div>
    </div>
  );
}
