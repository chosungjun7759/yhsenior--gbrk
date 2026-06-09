import { useState } from "react";
import { LeaveRequest, LeaveType, LEAVE_TYPE_LABELS } from "../types";
import { X, Save, Trash2 } from "lucide-react";

interface LeaveEditModalProps {
  request: LeaveRequest;
  onSave: (updated: LeaveRequest) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function LeaveEditModal({ request, onSave, onDelete, onClose }: LeaveEditModalProps) {
  const [startDate, setStartDate] = useState(request.startDate);
  const [endDate, setEndDate] = useState(request.endDate);
  const [reason, setReason] = useState(request.reason);
  const [halfType, setHalfType] = useState(request.halfType ?? "AM");
  const [quarterHours, setQuarterHours] = useState(request.quarterHours ?? "");
  const [replacementDate, setReplacementDate] = useState(request.replacementDate ?? "");
  const [replacementHours, setReplacementHours] = useState(request.replacementHours ?? "");
  const [replacementTask, setReplacementTask] = useState(request.replacementTask ?? "");
  const [replacementVerifier, setReplacementVerifier] = useState(request.replacementVerifier ?? "");
  const [duration, setDuration] = useState(String(request.duration));
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSave = () => {
    const updated: LeaveRequest = {
      ...request,
      startDate,
      endDate: endDate || startDate,
      reason,
      duration: parseFloat(duration) || request.duration,
      halfType: request.leaveType === LeaveType.HALF ? halfType : request.halfType,
      quarterHours: request.leaveType === LeaveType.QUARTER ? quarterHours : request.quarterHours,
      replacementDate: request.leaveType === LeaveType.REPLACEMENT ? replacementDate : request.replacementDate,
      replacementHours: request.leaveType === LeaveType.REPLACEMENT ? replacementHours : request.replacementHours,
      replacementTask: request.leaveType === LeaveType.REPLACEMENT ? replacementTask : request.replacementTask,
      replacementVerifier: request.leaveType === LeaveType.REPLACEMENT ? replacementVerifier : request.replacementVerifier,
    };
    onSave(updated);
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white";
  const labelCls = "block text-xs font-bold text-slate-500 mb-1.5";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9500, background:"rgba(10,15,30,.78)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"480px", boxShadow:"0 20px 60px rgba(0,0,0,.3)", maxHeight:"90vh", overflowY:"auto" }}>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-base font-black text-slate-900">휴가 내용 수정</p>
            <p className="text-xs text-slate-400 mt-0.5">{request.userName} · {LEAVE_TYPE_LABELS[request.leaveType]}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* 상태 배지 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-5">
          <p className="text-xs text-amber-700 font-bold">⚠️ 관장 권한으로 수정합니다. 결재 완료된 문서도 변경됩니다.</p>
        </div>

        <div className="space-y-4">
          {/* 날짜 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                {request.leaveType === LeaveType.HALF || request.leaveType === LeaveType.QUARTER ? "날짜" : "시작일"}
              </label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
            </div>
            {request.leaveType !== LeaveType.HALF && request.leaveType !== LeaveType.QUARTER && request.leaveType !== LeaveType.REPLACEMENT && (
              <div>
                <label className={labelCls}>종료일</label>
                <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
              </div>
            )}
          </div>

          {/* 반일휴가 오전/오후 */}
          {request.leaveType === LeaveType.HALF && (
            <div>
              <label className={labelCls}>시간대</label>
              <div className="grid grid-cols-2 gap-3">
                {(["AM","PM"] as const).map(t => (
                  <button key={t} onClick={() => setHalfType(t)}
                    className={`py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${halfType===t?"bg-blue-600 border-blue-600 text-white":"bg-white border-slate-200 text-slate-600"}`}>
                    {t === "AM" ? "오전 (09:00~14:00)" : "오후 (14:00~18:00)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1/4 휴가 시간 */}
          {request.leaveType === LeaveType.QUARTER && (
            <div>
              <label className={labelCls}>휴가 시간대</label>
              <input type="text" value={quarterHours} onChange={e => setQuarterHours(e.target.value)} placeholder="09:00~11:00" className={inputCls} />
            </div>
          )}

          {/* 대체휴무 */}
          {request.leaveType === LeaveType.REPLACEMENT && (
            <div className="space-y-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700">근무 내역</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>근무일자</label><input type="date" value={replacementDate} onChange={e => setReplacementDate(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>근무시간</label><input type="text" value={replacementHours} onChange={e => setReplacementHours(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>업무내용</label><input type="text" value={replacementTask} onChange={e => setReplacementTask(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>확인자</label><input type="text" value={replacementVerifier} onChange={e => setReplacementVerifier(e.target.value)} className={inputCls} /></div>
              </div>
            </div>
          )}

          {/* 차감 연차 */}
          <div>
            <label className={labelCls}>차감 연차 (일)</label>
            <input type="number" step="0.125" min="0" value={duration} onChange={e => setDuration(e.target.value)} className={inputCls} />
          </div>

          {/* 사유 */}
          <div>
            <label className={labelCls}>신청 사유</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          {deleteConfirm ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-500 font-bold">삭제?</span>
              <button
                onClick={() => { onDelete(request.id); setDeleteConfirm(false); }}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2.5 py-2 rounded-xl font-bold cursor-pointer"
              >확인</button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2.5 py-2 rounded-xl font-bold cursor-pointer"
              >취소</button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="p-3 border border-red-200 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
            취소
          </button>
          <button onClick={handleSave} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Save size={14} /> 수정 저장
          </button>
        </div>
      </div>
    </div>
  );
}
