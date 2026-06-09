import { useState } from "react";
import { User, Role } from "../types";
import { X, Plus, Trash2, Save, Users, Key } from "lucide-react";

interface StaffManagerProps {
  users: User[];
  onClose: () => void;
  onSaved: (users: User[]) => void;
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
  email: "",
});

export default function StaffManager({ users, onClose, onSaved }: StaffManagerProps) {
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [formData, setFormData] = useState(emptyForm());

  const handleAdd = () => {
    if (!formData.name.trim()) return;
    const newUser: User = {
      id: "user_" + Date.now(),
      name: formData.name.trim(),
      title: formData.title,
      role: formData.role,
      initialLeave: formData.initialLeave,
      email: formData.email.trim(),
    };
    setLocalUsers([...localUsers, newUser]);
    setFormData(emptyForm());
  };

  const handleRemove = (id: string) => {
    if (confirm("정말 이 직원을 삭제하시겠습니까?")) {
      setLocalUsers(localUsers.filter(u => u.id !== id));
    }
  };

  const handleSave = () => {
    onSaved(localUsers);
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9800, background:"rgba(10,15,30,.80)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"680px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-sm tracking-tight">
            <Users size={16} />
            <span>임직원 인사 및 이메일 관리</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* 직원 추가 */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 space-y-3">
          <p className="text-xs font-black text-slate-800">신규 임직원 등록</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">성명</label>
              <input type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="홍길동" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">이메일(아이디)</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@..." className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">직위</label>
              <select value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
                {TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">권한</label>
              <select value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">부여 연차</label>
              <input type="number" value={formData.initialLeave}
                onChange={e => setFormData({ ...formData, initialLeave: parseFloat(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none" />
            </div>
          </div>
          <button onClick={handleAdd}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer">
            <Plus size={13} /> 목록에 추가
          </button>
        </div>

        {/* 직원 목록 */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_40px] bg-slate-50 border-b border-slate-200 px-4 py-2 text-[10px] font-black text-slate-400">
            <div>성명</div>
            <div>이메일</div>
            <div>직위</div>
            <div>권한</div>
            <div>부여 연차</div>
            <div></div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
            {localUsers.map(user => (
              <div key={user.id} className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_40px] items-center px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white">
                <div>{user.name}</div>
                <div className="truncate text-[11px] font-medium text-slate-400">{user.email || "(없음)"}</div>
                <div>{user.title}</div>
                <div>
                  {user.role === Role.DIRECTOR ? "👑 관장" : user.role === Role.MANAGER ? "★ 과장" : "직원"}
                </div>
                <div className="font-mono">{user.initialLeave}일</div>
                <div className="flex justify-end">
                  <button onClick={() => handleRemove(user.id)}
                    className="p-1 text-slate-300 hover:text-red-500 cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer">
            취소
          </button>
          <button onClick={handleSave}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <Save size={13} /> 데이터베이스 즉시 저장
          </button>
        </div>

      </div>
    </div>
  );
}
