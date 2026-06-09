import { useState } from "react";
import { User, LeaveRequest, Role, LEAVE_TYPE_LABELS } from "../types";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, FileText } from "lucide-react";
import HandoverPrint from "./HandoverPrint";

// 인수인계서 인라인 뷰어
function HandoverViewer({ request }: { request: LeaveRequest }) {
  const [open, setOpen] = useState(false);
  if (!request.handoverItems?.length) return null;
  return (
    <div className="border border-violet-200 rounded-xl overflow-hidden bg-violet-50/30">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-violet-700 cursor-pointer hover:bg-violet-50"
      >
        <span className="flex items-center gap-1.5">
          <FileText size={13} /> 업무 인수인계서 확인
          <span className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded text-[10px]">{request.handoverItems.length}건</span>
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-white rounded-lg p-2.5 border border-violet-100">
            <div><span className="text-slate-400">인계자</span> <span className="font-bold">{request.handoverFrom || request.userName}</span></div>
            <div><span className="text-slate-400">인수자</span> <span className="font-bold">{request.handoverTo || "-"}</span></div>
            <div><span className="text-slate-400">인계기간</span> <span className="font-bold">{request.handoverPeriod || "-"}</span></div>
            <div><span className="text-slate-400">확인자</span> <span className="font-bold">{request.handoverConfirmer || "-"}</span></div>
          </div>
          {/* 업무 목록 */}
          <div className="border border-violet-100 rounded-lg overflow-hidden text-xs">
            <div className="grid grid-cols-[2fr_3fr_1.5fr] bg-violet-100 text-violet-700 font-bold">
              <div className="px-2.5 py-1.5 border-r border-violet-200">업무명</div>
              <div className="px-2.5 py-1.5 border-r border-violet-200">주요 내용</div>
              <div className="px-2.5 py-1.5">비고</div>
            </div>
            {request.handoverItems.map((item, i) => (
              <div key={item.id ?? i} className={`grid grid-cols-[2fr_3fr_1.5fr] border-t border-violet-100 ${i%2===0?"bg-white":"bg-violet-50/30"}`}>
                <div className="px-2.5 py-2 border-r border-violet-100 font-semibold text-slate-700">{item.task || "-"}</div>
                <div className="px-2.5 py-2 border-r border-violet-100 text-slate-600 whitespace-pre-wrap">{item.content || "-"}</div>
                <div className="px-2.5 py-2 text-slate-500">{item.note || ""}</div>
              </div>
            ))}
          </div>
          {/* 인수인계서 출력 버튼 */}
          <div className="flex justify-end pt-1">
            <HandoverPrint request={request} />
          </div>
        </div>
      )}
    </div>
  );
}

interface ApprovalBoxProps {
  currentUser: User;
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${y}.${m}.${dd}`;
}

export default function ApprovalBox({ currentUser, requests, onApprove, onReject }: ApprovalBoxProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // 내 결재 대상 필터
  const pending = requests.filter(r => {
    if (currentUser.role === Role.MANAGER) return r.status === "PENDING" && r.userId !== currentUser.id;
    if (currentUser.role === Role.DIRECTOR) return r.status === "MANAGER_APPROVED";
    return false;
  });

  if (pending.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-bold">대기 중인 결재 건이 없습니다.</p>
      </div>
    );
  }

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {  return; }
    onReject(id, rejectReason);
    setRejectMode(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-3">
      {pending.map(req => (
        <div key={req.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          {/* 헤더 행 */}
          <div
            className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setExpanded(expanded === req.id ? null : req.id)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-black bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-center">
                {LEAVE_TYPE_LABELS[req.leaveType]}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">{req.userName} <span className="text-slate-400 font-normal">({req.userTitle})</span></p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(req.startDate)} ~ {formatDate(req.endDate)}
                  {req.duration > 0 && <span className="ml-1 text-red-400 font-semibold">({req.duration}일 차감)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 hidden sm:block">{req.createdAt.slice(0,10)}</span>
              {expanded === req.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </div>
          </div>

          {/* 상세 펼침 */}
          {expanded === req.id && (
            <div className="border-t border-slate-100 px-4 py-4 bg-slate-50 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-400">신청인</span><br /><span className="font-bold text-slate-700">{req.userName} ({req.userTitle})</span></div>
                <div><span className="text-slate-400">휴가 종류</span><br /><span className="font-bold text-slate-700">{LEAVE_TYPE_LABELS[req.leaveType]}</span></div>
                <div><span className="text-slate-400">신청 기간</span><br /><span className="font-bold text-slate-700">{formatDate(req.startDate)} ~ {formatDate(req.endDate)}</span></div>
                <div><span className="text-slate-400">차감 연차</span><br /><span className="font-bold text-red-500">{req.duration}일</span></div>
                <div className="col-span-2"><span className="text-slate-400">신청 사유</span><br /><span className="font-bold text-slate-700">{req.reason}</span></div>
              </div>

              {/* 연가일 경우 인수인계서 인라인 뷰어 노출 */}
              {req.leaveType === "ANNUAL" && req.handoverItems && req.handoverItems.length > 0 && (
                <HandoverViewer request={req} />
              )}

              {/* 반려 사유 입력 모드 */}
              {rejectMode === req.id ? (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력해주세요."
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-400 bg-white resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      반려 확정
                    </button>
                    <button
                      onClick={() => { setRejectMode(null); setRejectReason(""); }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onApprove(req.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {currentUser.role === Role.MANAGER ? "1차 승인" : "최종 승인"}
                  </button>
                  <button
                    onClick={() => setRejectMode(req.id)}
                    className="flex-1 bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    반려
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
