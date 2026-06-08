import { useState } from "react";
import { User } from "../types";
import { dbService } from "../databaseService";
import { RefreshCw, X, ChevronDown, CheckCircle } from "lucide-react";

interface LeaveResetManagerProps {
  users: User[];
  onClose: () => void;
  onSaved: () => void;
}

export default function LeaveResetManager({ users, onClose, onSaved }: LeaveResetManagerProps) {
  // 직원별 새 연차 입력값
  const [newLeaves, setNewLeaves] = useState<Record<string, string>>(
    Object.fromEntries(users.map(u => [u.id, String(u.initialLeave)]))
  );
  const [resetRequests, setResetRequests] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 유효성 검사
    for (const user of users) {
      const val = parseFloat(newLeaves[user.id]);
      if (isNaN(val) || val < 0) {
        alert(`${user.name}의 연차 값이 올바르지 않습니다.`);
        return;
      }
    }

    // 직원별 initialLeave 업데이트
    const allUsers = dbService.getUsers();
    const updated = allUsers.map(u => ({
      ...u,
      initialLeave: parseFloat(parseFloat(newLeaves[u.id] ?? String(u.initialLeave)).toFixed(3))
    }));
    dbService.saveUsers(updated);

    // 결재 내역도 초기화 옵션
    if (resetRequests) {
      dbService.saveRequests([]);
    }

    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 800);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:8500,
      background:"rgba(10,15,30,.78)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"24px",
      overflowY:"auto"
    }}>
      <div style={{
        background:"#fff", borderRadius:"20px", padding:"32px",
        width:"100%", maxWidth:"520px",
        boxShadow:"0 20px 60px rgba(0,0,0,.3)",
        maxHeight:"90vh", overflowY:"auto"
      }}>
        {/* 헤더 */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <RefreshCw size={20} color="#1d4ed8" />
            <span style={{ fontSize:"15px", fontWeight:800, color:"#0f172a" }}>연차 초기화 / 재설정</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize:"12px", color:"#64748b", marginBottom:"20px", lineHeight:1.6 }}>
          직원별 연차 초기 부여일수를 수정합니다. 새해 연차 부여 또는 개별 조정 시 사용하세요.
        </p>

        {/* 직원별 연차 입력 */}
        <div style={{ border:"1px solid #e2e8f0", borderRadius:"12px", overflow:"hidden", marginBottom:"16px" }}>
          {/* 헤더행 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 100px", background:"#f8fafc", padding:"10px 16px", fontSize:"11px", fontWeight:700, color:"#64748b" }}>
            <span>직원명 (직위)</span>
            <span style={{ textAlign:"center" }}>현재</span>
            <span style={{ textAlign:"center" }}>변경 후</span>
          </div>
          {users.map((user, i) => (
            <div
              key={user.id}
              style={{
                display:"grid", gridTemplateColumns:"1fr 80px 100px",
                padding:"10px 16px", alignItems:"center",
                background: i % 2 === 0 ? "#fff" : "#fafafa",
                borderTop:"1px solid #f1f5f9"
              }}
            >
              <div>
                <span style={{ fontSize:"13px", fontWeight:700, color:"#1e293b" }}>{user.name}</span>
                <span style={{ fontSize:"11px", color:"#94a3b8", marginLeft:"6px" }}>({user.title})</span>
              </div>
              <div style={{ textAlign:"center", fontSize:"13px", color:"#64748b", fontFamily:"monospace" }}>
                {user.initialLeave}
              </div>
              <div style={{ display:"flex", justifyContent:"center" }}>
                <input
                  type="number"
                  step="0.125"
                  min="0"
                  max="30"
                  value={newLeaves[user.id]}
                  onChange={e => setNewLeaves(prev => ({ ...prev, [user.id]: e.target.value }))}
                  style={{
                    width:"72px", padding:"4px 8px", textAlign:"center",
                    border:"1px solid #cbd5e1", borderRadius:"8px",
                    fontSize:"13px", fontFamily:"monospace", fontWeight:700,
                    color: parseFloat(newLeaves[user.id]) !== user.initialLeave ? "#1d4ed8" : "#1e293b",
                    background: parseFloat(newLeaves[user.id]) !== user.initialLeave ? "#eff6ff" : "#fff",
                    outline:"none"
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 결재 내역 초기화 옵션 */}
        <label style={{
          display:"flex", alignItems:"center", gap:"10px",
          padding:"12px 14px", border:"1px solid #fecaca",
          borderRadius:"12px", background:"#fff5f5",
          cursor:"pointer", marginBottom:"20px"
        }}>
          <input
            type="checkbox"
            checked={resetRequests}
            onChange={e => setResetRequests(e.target.checked)}
            style={{ width:"16px", height:"16px", accentColor:"#ef4444", cursor:"pointer" }}
          />
          <div>
            <p style={{ fontSize:"12px", fontWeight:700, color:"#dc2626", margin:0 }}>결재 내역도 함께 초기화</p>
            <p style={{ fontSize:"11px", color:"#f87171", margin:0, marginTop:"2px" }}>
              체크 시 모든 휴가 신청/결재 기록이 삭제됩니다.
            </p>
          </div>
        </label>

        {/* 저장 버튼 */}
        <div style={{ display:"flex", gap:"10px" }}>
          <button
            onClick={onClose}
            style={{
              flex:1, padding:"12px", border:"1px solid #e2e8f0",
              borderRadius:"12px", background:"#f8fafc", color:"#64748b",
              fontSize:"13px", fontWeight:700, cursor:"pointer"
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              flex:2, padding:"12px", border:"none",
              borderRadius:"12px",
              background: saved ? "#10b981" : "#1d4ed8",
              color:"#fff", fontSize:"13px", fontWeight:700,
              cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"
            }}
          >
            {saved ? <><CheckCircle size={14} /> 저장됨!</> : "연차 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
