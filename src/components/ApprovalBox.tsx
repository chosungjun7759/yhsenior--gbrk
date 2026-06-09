/**
 * ApprovalBox.tsx
 */
import { useState } from "react";
import { LeaveRequest, LEAVE_TYPE_LABELS, Role, LeaveType } from "../types";
import { Check, X, AlertCircle } from "lucide-react";

interface ApprovalBoxProps {
  currentUserRole: Role;
  currentUserId: string;
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function ApprovalBox({ currentUserRole, currentUserId, requests, onApprove, onReject }: ApprovalBoxProps) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleRejectSubmit = (id: string) => {
    if (!rejectReason.trim()) return;
    onReject(id, rejectReason);
    setRejectId(null);
    setRejectReason("");
  };

  // 나의 결재 대기 리스트 필터링
  const getApprovalTargets = () => {
    if (currentUserRole === Role.MANAGER) {
      // 과장은 PENDING 문서 전체 결재권 부여 (과장 본인 기안물 제외 - 본인 기안물은 MANAGER_APPROVED로 즉시 상신)
      return requests.filter(r => r.status === "PENDING" && r.userId !== currentUserId);
    }
    if (currentUserRole === Role.DIRECTOR) {
      // 관장은 MANAGER_APPROVED (과장 결재 완료) 문서 전체를 결재 권한 (관장 본인 신청물 빼고)
      return requests.filter(r => r.status === "MANAGER_APPROVED" && r.userId !== currentUserId);
    }
    return [];
  };

  const targets = getApprovalTargets();

  if (currentUserRole === Role.STAFF) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 tracking-tight">결재 대기 분석함 ({currentUserRole === Role.MANAGER?"과장":"관장"})</h2>
        <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
          결재 대기 {targets.length}건
        </span>
      </div>

      {targets.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <AlertCircle className="h-5 w-5 opacity-40 text-slate-400" />
          결재 대기 중인 문서가 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 pr-1">
          {targets.map((req) => (
            <div key={req.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700">{req.userName} ({req.userTitle})</span>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">
                      {LEAVE_TYPE_LABELS[req.leaveType]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium font-mono">
                    {req.startDate}
                    {req.leaveType !== LeaveType.HALF && req.leaveType !== LeaveType.QUARTER && ` ~ ${req.endDate}`}
                    <span className="ml-1 text-slate-400 font-bold">({req.duration}일)</span>
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2 mt-2 leading-relaxed whitespace-pre-wrap font-medium">
                    {req.reason}
                  </p>
                </div>

                {/* 결재 버튼 */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onApprove(req.id)}
                    className="flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Check size={13} /> 승인
                  </button>
                  <button
                    onClick={() => setRejectId(req.id)}
                    className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <X size={13} /> 반려
                  </button>
                </div>
              </div>

              {/* 반려 사유 입력 폼 */}
              {rejectId === req.id && (
                <div className="mt-3.5 bg-red-50 border border-red-100 rounded-xl p-3.5 space-y-2">
                  <label className="block text-[11px] font-black text-red-600">반려 사유 입력</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="예) 업무 일정이 중복됩니다. 사유 구체화 바람."
                      className="flex-1 border border-red-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none bg-white focus:border-red-300 font-medium"
                    />
                    <button
                      onClick={() => handleRejectSubmit(req.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 rounded-lg text-xs cursor-pointer"
                    >
                      전송
                    </button>
                    <button
                      onClick={() => setRejectId(null)}
                      className="bg-slate-200 text-slate-600 font-bold px-3 rounded-lg text-xs cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
