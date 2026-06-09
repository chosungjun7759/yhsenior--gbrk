/**
 * LeaveEditModal.tsx
 * 직원 부여 연차 수동 강제 조정 모달
 */
import { useState } from "react";
import { User, Role } from "../types";
import { X, Save, Edit } from "lucide-react";

interface LeaveEditModalProps {
  user: User;
  onClose: () => void;
  onSaved: (updatedUser: User) => void;
}

export default function LeaveEditModal({ user, onClose, onSaved }: LeaveEditModalProps) {
  const [leave, setLeave] = useState<number>(user.initialLeave);

  const handleSave = () => {
    if (isNaN(leave) || leave < 0) {  return; }
    onSaved({
      ...user,
      initialLeave: leave
    });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9800, background:"rgba(10,15,30,.80)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"380px", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-sm tracking-tight">
            <Edit size={16} />
            <span>기본 부여 연차 수정</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
            <span className="block text-[10px] font-bold text-slate-400">대상 직원</span>
            <span className="text-xs font-bold text-slate-800">{user.name} ({user.title})</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">새 기본 부여 연차 수량</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={leave}
              onChange={e => setLeave(parseFloat(e.target.value))}
              placeholder="예: 15"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-white font-mono font-bold"
            />
            <span className="block text-[10px] text-slate-400 font-bold mt-1.5 leading-relaxed">
              점 단위 조절을 권장합니다. (반차=0.5차감, 1/4연차=0.25차감 자동 반영)
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save size={13} /> 저장하기
          </button>
        </div>

      </div>
    </div>
  );
}
