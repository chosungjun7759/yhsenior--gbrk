/**
 * RequestHistory.tsx
 */
import { useState } from "react";
import { User, LeaveRequest, LEAVE_TYPE_LABELS, Role, LeaveType } from "../types";
import { Trash2, AlertCircle } from "lucide-react";
import PrintForm from "./PrintForm";
import HandoverPrint from "./HandoverPrint";

interface RequestHistoryProps {
  currentUser: User;
  requests: LeaveRequest[];
  onDelete: (id: string) => void;
}

export default function RequestHistory({ currentUser, requests, onDelete }: RequestHistoryProps) {
  // 사용자의 신청 리스트만 필터링 (관장/과장은 모든 리스트 확인 가능)
  const isApprover = currentUser.role === Role.MANAGER || currentUser.role === Role.DIRECTOR;
  const filteredRequests = isApprover
    ? requests
    : requests.filter(r => r.userId === currentUser.id);

  // 대기중인 경우에만 신청 취소 가능
  const canDelete = (req: LeaveRequest) => {
    // 본인이 신청한 문서이면서
    if (req.userId !== currentUser.id) return false;
    // 과장은 MANAGER_APPROVED 이거나 PENDING 일 때 삭제 가능 (자기 문서)
    if (currentUser.role === Role.MANAGER) {
      return req.status === "PENDING" || req.status === "MANAGER_APPROVED";
    }
    // 일반 직원은 PENDING 상태일 때만 삭제 가능
    return req.status === "PENDING";
  };

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded border">대기중</span>;
      case "MANAGER_APPROVED":
        return <span className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded border">과장승인</span>;
      case "FINAL_APPROVED":
        return <span className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded border">최종결재</span>;
      case "REJECTED":
        return <span className="bg-red-100 text-red-800 border-red-200 text-[10px] font-bold px-2 py-0.5 rounded border">반려됨</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 tracking-tight">결재 요청 내역</h2>
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full">
          총 {filteredRequests.length}건
        </span>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <AlertCircle className="h-5 w-5 opacity-40 text-slate-400" />
          신청된 결재 문서가 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto pr-1">
          {filteredRequests.map((req) => (
            <div key={req.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    {LEAVE_TYPE_LABELS[req.leaveType]}
                    {req.leaveType === LeaveType.HALF && ` (${req.halfType === "AM" ? "오전" : "오후"})`}
                    {req.leaveType === LeaveType.QUARTER && ` (시간: ${req.quarterHours || ""})`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{req.createdAt.split("T")[0]}</span>
                  {getStatusBadge(req.status)}
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  {req.startDate}
                  {req.leaveType !== LeaveType.HALF && req.leaveType !== LeaveType.QUARTER && req.leaveType !== LeaveType.REPLACEMENT && ` ~ ${req.endDate}`}
                  <span className="ml-1.5 text-[11px] font-black text-slate-400 font-mono">({req.duration}일)</span>
                </p>

                {/* 대기자 이름 (관장/과장이 볼 때 유용) */}
                {isApprover && (
                  <p className="text-[10px] font-bold text-slate-400">
                    기안자: {req.userName} ({req.userTitle})
                  </p>
                )}

                <p className="text-xs text-slate-400 line-clamp-1">{req.reason}</p>

                {/* 반려 사유 노출 */}
                {req.status === "REJECTED" && req.rejectionReason && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 text-[11px] text-red-600 font-semibold">
                    <span className="font-bold">[{req.rejectedByRole === Role.DIRECTOR ? "관장" : "과장"} 반려 사유]</span> {req.rejectionReason}
                  </div>
                )}
              </div>

              {/* 결재 기능 및 취소 */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* 인수인계서 프리뷰 출력 단독 */}
                {req.leaveType === LeaveType.ANNUAL && req.handoverItems && (
                  <HandoverPrint request={req} />
                )}

                {/* 인쇄 가능 버튼 — 승인 상태 무관하게 노출 */}
                <PrintForm request={req} />

                {canDelete(req) && (
                  <button
                    onClick={() => onDelete(req.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    title="신청 취소"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
