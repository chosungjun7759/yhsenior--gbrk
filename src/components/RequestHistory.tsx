import { useState } from "react";
import { User, LeaveRequest, Role, LEAVE_TYPE_LABELS, ApprovalStatus } from "../types";
import { Printer, Trash2, FileText, Pencil } from "lucide-react";
import HandoverPrint from "./HandoverPrint";

interface RequestHistoryProps {
  currentUser: User;
  requests: LeaveRequest[];
  onPrintSelect: (req: LeaveRequest) => void;
  onDeleteRequest: (id: string) => void;
  onEditRequest?: (req: LeaveRequest) => void;
  limit?: number;
}

const STATUS_LABELS: Record<ApprovalStatus, { label: string; cls: string }> = {
  PENDING:          { label: "과장 결재 대기",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
  MANAGER_APPROVED: { label: "관장 결재 대기",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
  FINAL_APPROVED:   { label: "최종 승인 완료",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED:         { label: "반려",            cls: "bg-red-50 text-red-600 border-red-200" },
};

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${y}.${m}.${dd}`;
}

export default function RequestHistory({
  currentUser,
  requests,
  onPrintSelect,
  onDeleteRequest,
  onEditRequest,
  limit,
}: RequestHistoryProps) {
  const isAdmin = currentUser.role === Role.DIRECTOR || currentUser.role === Role.MANAGER;
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 관장/과장은 전체, 직원은 본인 것만
  const filtered = isAdmin
    ? [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : requests.filter(r => r.userId === currentUser.id);

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  if (displayed.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm font-bold">신청 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {displayed.map(req => {
        const statusInfo = STATUS_LABELS[req.status];
        // 직원: PENDING 본인 것만 취소 / 관장: 모든 상태 삭제 가능
        const canDelete = currentUser.role === Role.DIRECTOR
          ? true
          : (req.status === "PENDING" && req.userId === currentUser.id);
        const canEdit = currentUser.role === Role.DIRECTOR;
        const canPrint = req.status === "FINAL_APPROVED";

        return (
          <div key={req.id} className="border border-slate-200 rounded-xl bg-white px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-xs font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    {LEAVE_TYPE_LABELS[req.leaveType]}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                  {isAdmin && (
                    <span className="text-xs text-slate-500 font-semibold">{req.userName}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {formatDate(req.startDate)} ~ {formatDate(req.endDate)}
                  {req.duration > 0 && (
                    <span className="ml-1.5 text-red-400 font-semibold font-mono">({req.duration}일)</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{req.reason}</p>
                {req.status === "REJECTED" && req.rejectionReason && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">
                    반려사유: {req.rejectionReason}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {canEdit && onEditRequest && (
                  <button
                    onClick={() => onEditRequest(req)}
                    title="내용 수정"
                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {canPrint && req.handoverItems && req.handoverItems.length > 0 && (
                  <HandoverPrint request={req} />
                )}
                {canPrint && (
                  <button
                    onClick={() => onPrintSelect(req)}
                    title="인쇄 미리보기"
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                )}
                {canDelete && (
                  deleteConfirmId === req.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-red-500 font-bold whitespace-nowrap">삭제?</span>
                      <button
                        onClick={() => { onDeleteRequest(req.id); setDeleteConfirmId(null); }}
                        className="text-[10px] bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg font-bold cursor-pointer transition-colors"
                      >확인</button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded-lg font-bold cursor-pointer transition-colors"
                      >취소</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(req.id)}
                      title={currentUser.role === Role.DIRECTOR ? "삭제" : "신청 취소"}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
