import { useState } from "react";
import { User, Role } from "../types";
import { dbService } from "../databaseService";
import { X, Plus, Trash2, Save, Users } from "lucide-react";

interface StaffManagerProps {
  users: User[];
  onClose: () => void;
  onSaved: () => void;
}

const ROLE_OPTIONS = [
  { value: Role.STAFF,    label: "직원" },
  { value: Role.MANAGER,  label: "과장" },
  { value: Role.DIRECTOR, label: "관장" },
];

const TITLE_OPTIONS = [
  "사회복지사", "과장", "관장", "조리사", "스마트매니저", "안전관리인", "사무원", "간호사", "물리치료사", "요양보호사", "기타"
];

const emptyForm = () => ({
  name: "",
  title: "사회복지사",
  role: Role.STAFF as Role,
  initialLeave: 15,
});

export default function StaffManager({ users, onClose, onSaved }: StaffManagerProps) {
  const [localUsers, setLocalUsers] = useState<User[]>([...users]);
  const [addMode, setAddMode] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // 직원 추가
  const handleAdd = () => {
    if (!form.name.trim()) { alert("이름을 입력해주세요."); return; }
    const newUser: User = {
      id: "user_" + Date.now(),
      name: form.name.trim(),
      title: form.title,
      role: form.role,
      initialLeave: Number(form.initialLeave),
    };
    setLocalUsers(prev => [...prev, newUser]);
    setForm(emptyForm());
    setAddMode(false);
  };

  // 직원 삭제
  const handleDelete = (userId: string) => {
    // 관장/과장은 삭제 불가
    const target = localUsers.find(u => u.id === userId);
    if (target?.role === Role.DIRECTOR) { alert("관장 계정은 삭제할 수 없습니다."); return; }
    setLocalUsers(prev => prev.filter(u => u.id !== userId));
    setDeleteConfirm(null);
  };

  // 저장
  const handleSave = () => {
    dbService.saveUsers(localUsers);
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 700);
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:8800, background:"rgba(10,15,30,.78)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"560px", boxShadow:"0 20px 60px rgba(0,0,0,.3)", maxHeight:"90vh", overflowY:"auto" }}>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Users size={20} color="#1d4ed8" />
            <span className="text-base font-black text-slate-900">직원 관리</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={18}/></button>
        </div>

        {/* 직원 목록 */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
          {/* 헤더행 */}
          <div className="grid grid-cols-[1fr_80px_70px_80px_40px] bg-slate-50 px-4 py-2.5 text-[11px] font-bold text-slate-500 border-b border-slate-200">
            <span>이름 / 직위</span>
            <span className="text-center">역할</span>
            <span className="text-center">연차</span>
            <span className="text-center">입사구분</span>
            <span></span>
          </div>

          {localUsers.map((user, i) => (
            <div key={user.id} className={`grid grid-cols-[1fr_80px_70px_80px_40px] px-4 py-3 items-center border-b border-slate-100 last:border-0 ${i%2===0?"bg-white":"bg-slate-50/50"}`}>
              <div>
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-[11px] text-slate-400">{user.title}</p>
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  user.role === Role.DIRECTOR ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                  user.role === Role.MANAGER  ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {user.role === Role.DIRECTOR ? "관장" : user.role === Role.MANAGER ? "과장" : "직원"}
                </span>
              </div>
              <div className="text-center text-sm font-mono font-bold text-slate-700">{user.initialLeave}일</div>
              <div className="text-center text-[10px] text-slate-400">{user.id}</div>
              <div className="flex justify-center">
                {user.role !== Role.DIRECTOR && (
                  deleteConfirm === user.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(user.id)} className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded cursor-pointer font-bold">확인</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer">취소</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(user.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={14}/>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 직원 추가 폼 */}
        {addMode ? (
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3 mb-4">
            <p className="text-xs font-bold text-blue-700 mb-2">신규 직원 등록</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">이름 *</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  placeholder="홍길동" className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">직위 *</label>
                <select value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className={inputCls}>
                  {TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">역할</label>
                <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value as Role}))} className={inputCls}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">연차 부여일수</label>
                <input
                  type="number" step="0.5" min="0" max="30"
                  value={form.initialLeave}
                  onChange={e => setForm(p => ({...p, initialLeave: parseFloat(e.target.value)}))}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setAddMode(false); setForm(emptyForm()); }}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white cursor-pointer">취소</button>
              <button onClick={handleAdd}
                className="flex-[2] py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer">등록</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddMode(true)}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-400 hover:text-blue-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer mb-4"
          >
            <Plus size={14}/> 직원 추가
          </button>
        )}

        {/* 저장 버튼 */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer">취소</button>
          <button onClick={handleSave}
            className={`flex-[2] py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors ${saved ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700"}`}>
            <Save size={14}/>{saved ? "저장됨!" : "변경사항 저장"}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-3">저장 후 DB 초기화 없이 즉시 반영됩니다.</p>
      </div>
    </div>
  );
}
