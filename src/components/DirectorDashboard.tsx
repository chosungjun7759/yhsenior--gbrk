import { useState } from "react";
import ExportLeaveExcel from "./ExportLeaveExcel";
import { User, LeaveRequest, LEAVE_TYPE_LABELS } from "../types";

interface DirectorDashboardProps {
  users: User[];
  requests: LeaveRequest[];
  onlyStatus?: boolean;
  onlyMonthly?: boolean;
}

function getRemainingLeave(user: User, requests: LeaveRequest[]): number {
  const approved = requests.filter(
    r => r.userId === user.id && r.status === "FINAL_APPROVED" &&
    (r.leaveType === "ANNUAL" || r.leaveType === "HALF" || r.leaveType === "QUARTER")
  );
  const used = approved.reduce((s, r) => s + r.duration, 0);
  return Math.max(0, parseFloat((user.initialLeave - used).toFixed(3)));
}

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${y}.${m}.${dd}`;
}

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export default function DirectorDashboard({ users, requests, onlyStatus, onlyMonthly }: DirectorDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 연차 현황 탭
  const StatusTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-black text-slate-900">전체 직원 연차 현황</h3>
        <ExportLeaveExcel users={users} requests={requests} year={new Date().getFullYear()} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600">직원명</td>
              <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600">직위</td>
              <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600 text-right">총 연차</td>
              <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600 text-right">사용</td>
              <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600 text-right">잔여</td>
              <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600">소진율</td>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const remaining = getRemainingLeave(user, requests);
              const used = parseFloat((user.initialLeave - remaining).toFixed(3));
              const rate = user.initialLeave > 0 ? Math.round((used / user.initialLeave) * 100) : 0;
              return (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-slate-200 px-3 py-2.5 font-bold text-slate-800">{user.name}</td>
                  <td className="border border-slate-200 px-3 py-2.5 text-slate-500">{user.title}</td>
                  <td className="border border-slate-200 px-3 py-2.5 text-right font-mono text-slate-700">{user.initialLeave}</td>
                  <td className="border border-slate-200 px-3 py-2.5 text-right font-mono text-red-500 font-bold">{used}</td>
                  <td className="border border-slate-200 px-3 py-2.5 text-right font-mono text-blue-600 font-black">{remaining}</td>
                  <td className="border border-slate-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${rate > 80 ? "bg-red-400" : rate > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 월별 사용 내역 탭
  const MonthlyTab = () => {
    const monthlyReqs = requests.filter(r => {
      if (!r.startDate) return false;
      const m = parseInt(r.startDate.split("-")[1]);
      return m === selectedMonth && r.status === "FINAL_APPROVED";
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">월별 사용 내역</h3>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>

        {monthlyReqs.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm font-bold">{selectedMonth}월 승인된 휴가 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600">직원명</td>
                  <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600">종류</td>
                  <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600">기간</td>
                  <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600 text-right">차감</td>
                  <td className="border border-slate-200 px-3 py-2 font-bold text-slate-600">사유</td>
                </tr>
              </thead>
              <tbody>
                {monthlyReqs.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="border border-slate-200 px-3 py-2.5 font-bold text-slate-800">{req.userName}</td>
                    <td className="border border-slate-200 px-3 py-2.5">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {LEAVE_TYPE_LABELS[req.leaveType]}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 text-slate-600">
                      {formatDate(req.startDate)}{req.startDate !== req.endDate ? ` ~ ${formatDate(req.endDate)}` : ""}
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 text-right font-mono font-bold text-red-500">
                      {req.duration > 0 ? `-${req.duration}` : "-"}
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 text-slate-500 max-w-[120px] truncate">{req.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (onlyStatus) return <StatusTab />;
  if (onlyMonthly) return <MonthlyTab />;

  return (
    <div className="space-y-8">
      <StatusTab />
      <MonthlyTab />
    </div>
  );
}
