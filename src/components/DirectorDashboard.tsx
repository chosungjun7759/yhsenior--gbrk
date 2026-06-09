/**
 * DirectorDashboard.tsx
 */
import { User, LeaveRequest } from "../types";
import { Users, FileCheck, Calendar, ShieldAlert } from "lucide-react";

interface DirectorDashboardProps {
  users: User[];
  requests: LeaveRequest[];
}

export default function DirectorDashboard({ users, requests }: DirectorDashboardProps) {
  // 관장 대시보드에서 전직원 수, 결재 완료 건수 등 통계
  const totalStaff = users.length;
  const approvedCount = requests.filter(r => r.status === "FINAL_APPROVED").length;
  const pendingCount = requests.filter(r => r.status === "PENDING" || r.status === "MANAGER_APPROVED").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 카드 1 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400">전체 직원 수</span>
          <span className="font-extrabold text-base text-slate-900 font-mono">{totalStaff}명</span>
        </div>
      </div>

      {/* 카드 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <FileCheck className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400">결재 완료 문서</span>
          <span className="font-extrabold text-base text-slate-900 font-mono">{approvedCount}건</span>
        </div>
      </div>

      {/* 카드 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400">전결 대기 문서</span>
          <span className="font-extrabold text-base text-slate-900 font-mono">{pendingCount}건</span>
        </div>
      </div>

      {/* 카드 4 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
        <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400">인수인계 완료</span>
          <span className="font-extrabold text-base text-slate-900 font-mono">
            {requests.filter(r => r.handoverApprovedAt).length}건
          </span>
        </div>
      </div>
    </div>
  );
}
