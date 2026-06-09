import { useState, useEffect } from "react";
import { User, LeaveRequest, Role } from "./types";
import { dbService } from "./databaseService";
import Header from "./components/Header";
import LeaveRequestForm from "./components/LeaveRequestForm";
import RequestHistory from "./components/RequestHistory";
import ApprovalBox from "./components/ApprovalBox";
import DirectorDashboard from "./components/DirectorDashboard";
import PrintForm from "./components/PrintForm";
import StampUploader from "./components/StampUploader";
import LeaveResetManager from "./components/LeaveResetManager";
import LeaveEditModal from "./components/LeaveEditModal";
import StaffManager from "./components/StaffManager";
import {
  Heart, Plus, CheckSquare, Users,
  RefreshCw, BadgeCheck, ArrowLeft
} from "lucide-react";

type AdminTab = "APPLY" | "APPROVAL" | "STATUS" | "HISTORY";

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>("APPROVAL");
  const [isApplyingFormOpen, setIsApplyingFormOpen] = useState(false);
  const [activePrintRequest, setActivePrintRequest] = useState<LeaveRequest | null>(null);
  const [showStampUploader, setShowStampUploader] = useState(false);
  const [showLeaveReset, setShowLeaveReset] = useState(false);
  const [editTarget, setEditTarget] = useState<LeaveRequest | null>(null);
  const [showStaffManager, setShowStaffManager] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [myRemainingLeave, setMyRemainingLeave] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Firestore 실시간 구독
  useEffect(() => {
    const unsubUsers = dbService.subscribeUsers(u => {
      setUsers(u);
      setLoading(false);
    });
    const unsubReqs = dbService.subscribeRequests(r => {
      setRequests(r);
    });
    return () => { unsubUsers(); unsubReqs(); };
  }, []);

  // 잔여연차 실시간 계산
  useEffect(() => {
    if (!currentUser) return;
    dbService.getRemainingLeave(currentUser.id).then(setMyRemainingLeave);
  }, [currentUser, requests]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 font-bold mt-4">연희노인복지관 시스템 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-blue-600 text-white rounded-2xl p-3.5 inline-block shadow-md">
              <Heart className="h-8 w-8 fill-current" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">연희노인복지관</h1>
            <p className="text-xs bg-slate-100 text-slate-500 font-semibold py-1.5 px-3 rounded-lg inline-block">
              전자결재 휴가관리 시스템
            </p>
            <p className="text-xs text-slate-400 pt-1">로그인할 계정을 선택하세요.</p>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {users.map(user => {
              const badge =
                user.role === Role.DIRECTOR
                  ? { label: "관장 👑", cls: "bg-indigo-100 text-indigo-800 border-indigo-200" }
                  : user.role === Role.MANAGER
                  ? { label: "과장 ★", cls: "bg-amber-100 text-amber-800 border-amber-200" }
                  : { label: "직원", cls: "bg-slate-100 text-slate-600 border-slate-200" };
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setIsApplyingFormOpen(false);
                    if (user.role === Role.DIRECTOR || user.role === Role.MANAGER) {
                      setAdminTab("APPROVAL");
                    }
                    showToast(`${user.name}님으로 로그인했습니다.`, "info");
                  }}
                  className="w-full text-left p-3.5 border border-slate-150 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {user.name} ({user.title})
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">초기 연차: {user.initialLeave}일</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.cls}`}>
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-4 text-center">
            <button
              onClick={handleResetDatabase}
              className="text-slate-400 hover:text-amber-600 font-bold text-xs flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              데이터베이스 초기화
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 핸들러 ───────────────────────────────────────────────

  const handleLeaveSubmit = async (formData: Omit<LeaveRequest, "id" | "createdAt" | "status">) => {
    try {
      await dbService.addRequest(formData);
      showToast(
        currentUser.role === Role.MANAGER
          ? "기안이 상신되어 관장 결재 단계로 이첩되었습니다."
          : "휴가 신청이 완료되었습니다. 과장 결재를 기다려주세요.",
        "success"
      );
    } catch { showToast("신청에 실패했습니다.", "error"); }
  };

  const handleApprove = async (requestId: string) => {
    try {
      if (currentUser.role === Role.MANAGER) {
        await dbService.approveByManager(requestId, currentUser.name);
        showToast("1차 승인 완료. 관장 최종 결재로 상신되었습니다.", "success");
      } else if (currentUser.role === Role.DIRECTOR) {
        await dbService.approveByDirector(requestId, currentUser.name);
        showToast("최종 승인 처리가 완료되었습니다.", "success");
      }
    } catch { showToast("승인 처리에 실패했습니다.", "error"); }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      if (currentUser.role === Role.MANAGER) await dbService.rejectByManager(requestId, currentUser.name, reason);
      else if (currentUser.role === Role.DIRECTOR) await dbService.rejectByDirector(requestId, currentUser.name, reason);
      showToast("반려 처리되었습니다.", "info");
    } catch { showToast("반려 처리에 실패했습니다.", "error"); }
  };

  const handleDeleteRequest = async (requestId: string) => {
    const target = requests.find(r => r.id === requestId);
    if (!target) return;
    if (target.status !== "PENDING") {
      showToast("이미 결재가 진행 중인 문서는 취소할 수 없습니다.", "error");
      return;
    }
    await dbService.deleteRequest(requestId);
    showToast("신청이 취소되었습니다.", "info");
  };

  const handleDeleteByDirector = async (requestId: string) => {
    await dbService.deleteRequest(requestId);
    setEditTarget(null);
    showToast("휴가 신청이 삭제되었습니다.", "info");
  };

  async function handleResetDatabase() {
    await dbService.resetDatabase();
    setCurrentUser(null);
    setAdminTab("APPROVAL");
    showToast("초기화되었습니다.", "success");
  }

  const isAdmin = currentUser.role === Role.DIRECTOR || currentUser.role === Role.MANAGER;
  const pendingCount = (() => {
    if (currentUser.role === Role.MANAGER)
      return requests.filter(r => r.status === "PENDING" && r.userId !== currentUser.id).length;
    if (currentUser.role === Role.DIRECTOR)
      return requests.filter(r => r.status === "MANAGER_APPROVED").length;
    return 0;
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 print:bg-white print:p-0">
      <Header
        currentUser={currentUser}
        onLogout={() => { setCurrentUser(null); showToast("로그아웃 되었습니다.", "info"); }}
        onStampOpen={() => setShowStampUploader(true)}
        onStaffManage={() => setShowStaffManager(true)}
      />

      {activePrintRequest && (
        <PrintForm request={activePrintRequest} onClose={() => setActivePrintRequest(null)} />
      )}

      {showStaffManager && currentUser?.role === Role.DIRECTOR && (
        <StaffManager
          users={users}
          onClose={() => setShowStaffManager(false)}
          onSaved={async (updatedUsers) => {
            await dbService.saveUsers(updatedUsers);
            showToast("직원 정보가 업데이트되었습니다.", "success");
          }}
        />
      )}

      {editTarget && currentUser?.role === Role.DIRECTOR && (
        <LeaveEditModal
          request={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={async (updated) => {
            await dbService.saveRequests([updated]);
            setEditTarget(null);
            showToast("휴가 내용이 수정되었습니다.", "success");
          }}
          onDelete={(id) => handleDeleteByDirector(id)}
        />
      )}

      {showLeaveReset && currentUser.role === Role.DIRECTOR && (
        <LeaveResetManager
          users={users}
          onClose={() => setShowLeaveReset(false)}
          onSaved={async (updatedUsers) => {
            await dbService.saveUsers(updatedUsers);
            showToast("연차가 업데이트되었습니다.", "success");
          }}
        />
      )}

      {showStampUploader && currentUser && (
        <StampUploader
          currentUser={currentUser}
          onClose={() => setShowStampUploader(false)}
          onSaved={() => showToast("도장이 저장되었습니다.", "success")}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 print:hidden">
        {toast && (
          <div className="fixed bottom-6 right-6 z-[5000] px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 bg-slate-900 border border-slate-700 text-white text-xs font-bold">
            <BadgeCheck className="h-4 w-4 text-blue-400 shrink-0" />
            <p>{toast.message}</p>
          </div>
        )}

        {isAdmin ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const menus = [
                  { key:"APPLY",    icon:<Plus        className={`h-7 w-7 ${adminTab==="APPLY"?"text-white":"text-blue-500"}`} />,    label:"휴가 신청", sub:"신청서 작성",   badge:undefined },
                  { key:"APPROVAL", icon:<CheckSquare className={`h-7 w-7 ${adminTab==="APPROVAL"?"text-white":"text-amber-500"}`} />, label:"결재 대기", sub:"승인 처리함", badge:pendingCount },
                ];
                return menus.map(({ key, icon, label, sub, badge }) => (
                  <button
                    key={key}
                    onClick={() => setAdminTab(key as AdminTab)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center gap-1.5 shadow-sm cursor-pointer ${
                      adminTab === key
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    {icon}
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      {label}
                      {badge && badge > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                          {badge}
                        </span>
                      )}
                    </span>
                    <span className={`text-[11px] ${adminTab===key?"text-blue-100":"text-slate-400"}`}>{sub}</span>
                  </button>
                ));
              })()}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              {adminTab === "APPLY" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-900 border-b pb-3">새로운 휴가 신청서 작성</h3>
                  <LeaveRequestForm
                    currentUser={currentUser}
                    remainingLeave={myRemainingLeave}
                    onSubmit={async fd => { await handleLeaveSubmit(fd); setAdminTab("APPROVAL"); }}
                  />
                </div>
              )}
              {adminTab === "APPROVAL" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-900 border-b pb-3">결재 대기 목록</h3>
                  <ApprovalBox currentUser={currentUser} requests={requests} onApprove={handleApprove} onReject={handleReject} />
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-500">내 잔여 연차</span>
              <div className="flex items-center gap-2">
                {currentUser.role === Role.DIRECTOR && (
                  <>
                    <button
                      onClick={() => setShowDashboard(d => !d)}
                      className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold ${showDashboard ? "bg-emerald-600 border-emerald-600 text-white" : "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"}`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      {showDashboard ? "현황 닫기" : "연차 현황"}
                    </button>
                    <button
                      onClick={() => setShowLeaveReset(true)}
                      className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      연차 초기화
                    </button>
                  </>
                )}
                <span className="text-xl font-black text-blue-600 font-mono">{myRemainingLeave}일</span>
              </div>
            </div>

            {showDashboard && currentUser.role === Role.DIRECTOR && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                  {(["STATUS","HISTORY"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAdminTab(tab)}
                      className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${adminTab===tab?"bg-blue-600 text-white":"bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tab==="STATUS" ? "📊 연차 현황" : "📋 사용 내역 / 결재 내역"}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  {adminTab === "STATUS" && (
                    <DirectorDashboard users={users} requests={requests} onlyStatus />
                  )}
                  {adminTab === "HISTORY" && (
                    <div className="space-y-8">
                      <DirectorDashboard users={users} requests={requests} onlyMonthly />
                      <div className="border-t pt-6 space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">전체 결재 내역 / 인쇄</h3>
                        <RequestHistory
                          currentUser={currentUser} requests={requests}
                          onPrintSelect={req => setActivePrintRequest(req)}
                          onDeleteRequest={currentUser.role === Role.DIRECTOR ? handleDeleteByDirector : handleDeleteRequest}
                          onEditRequest={req => setEditTarget(req)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">나의 잔여 연차</span>
              <div className="text-5xl font-black font-mono text-blue-600">
                {myRemainingLeave}
                <span className="text-lg font-bold text-slate-400 ml-2">/ {currentUser.initialLeave}일</span>
              </div>
              <p className="text-xs text-slate-400">최종 승인 시 자동 차감됩니다.</p>
            </div>

            {!isApplyingFormOpen ? (
              <button
                onClick={() => setIsApplyingFormOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" />
                새로운 휴가 신청서 작성하기
              </button>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-base font-black text-slate-800">휴가 신청서 작성</h3>
                  <button
                    onClick={() => setIsApplyingFormOpen(false)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    돌아가기
                  </button>
                </div>
                <LeaveRequestForm
                  currentUser={currentUser}
                  remainingLeave={myRemainingLeave}
                  onSubmit={async fd => { await handleLeaveSubmit(fd); setIsApplyingFormOpen(false); }}
                />
              </div>
            )}

            {!isApplyingFormOpen && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-700 border-l-4 border-blue-600 pl-3">최근 신청 내역</h3>
                <RequestHistory
                  currentUser={currentUser} requests={requests}
                  onPrintSelect={req => setActivePrintRequest(req)}
                  onDeleteRequest={currentUser.role === Role.DIRECTOR ? handleDeleteByDirector : handleDeleteRequest}
                  onEditRequest={req => setEditTarget(req)}
                  limit={3}
                />
              </div>
            )}
          </div>
        )}

        <footer className="mt-16 flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-200 pt-5">
          <p>© 연희노인복지관. All Rights Reserved.</p>
          <button onClick={handleResetDatabase} className="hover:text-slate-600 underline cursor-pointer">DB 초기화</button>
        </footer>
      </main>
    </div>
  );
}
