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
import LoginScreen from "./components/LoginScreen";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  Heart, Plus, CheckSquare, Users,
  RefreshCw, BadgeCheck, PencilLine
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [remainingLeave, setRemainingLeave] = useState<number>(0);

  // 모달 제어
  const [isStampOpen, setIsStampOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isChangePwOpen, setIsChangePwOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // 1. Firebase Auth 감시
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 이미 로드된 users가 없을 수도 있으므로, Firestore에서 최신 목록 가져옴
        const allUsers = await dbService.getUsers();
        setUsers(allUsers);
        // 이메일로 매칭되는 사용자 정보 탐색
        const matched = allUsers.find(u => u.email === firebaseUser.email);
        if (matched) {
          setCurrentUser(matched);
        } else {
          // 일치하는 이메일이 없는 최초 진입자나 구글 로그인의 경우, 임시 유저 설정 또는 자동 로그아웃
          alert("복지관 직원 데이터베이스에 등록되지 않은 이메일입니다.\n관리자에게 문의해주세요.");
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  // 2. 실시간 데이터베이스 구독 (로그인 완료된 경우)
  useEffect(() => {
    if (!currentUser) return;

    const unsubUsers = dbService.subscribeUsers((allUsers) => {
      setUsers(allUsers);
      // 실시간으로 내 정보 동기화
      const matched = allUsers.find(u => u.id === currentUser.id);
      if (matched) setCurrentUser(matched);
    });

    const unsubRequests = dbService.subscribeRequests((allReqs) => {
      setRequests(allReqs);
    });

    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, [currentUser?.id]);

  // 3. 내 잔여 연차 실시간 동적 계산
  useEffect(() => {
    if (!currentUser) return;
    dbService.getRemainingLeave(currentUser.id).then(setRemainingLeave);
  }, [currentUser?.id, requests]);

  // 이메일 비밀번호 로그인 완료 콜백
  const handleLoginSuccess = async () => {
    // Auth 감시자에서 처리하므로 여기선 로딩 해제 정도만 처리
    setLoading(true);
  };

  // 로그아웃
  const handleLogout = async () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      await signOut(auth);
      setCurrentUser(null);
    }
  };

  // ── 비즈니스 액션들 ────────────────────────────────────────

  // 결재 상신
  const handleRequestSubmit = async (formData: Omit<LeaveRequest, "id" | "createdAt" | "status">) => {
    try {
      await dbService.addRequest(formData);
    } catch {
      alert("휴가 신청 전송에 실패했습니다. 입력값을 확인해 주세요.");
    }
  };

  // 결재선 삭제 (신청 취소)
  const handleRequestDelete = async (id: string) => {
    if (confirm("정말 이 휴가신청을 취소하고 회수하시겠습니까?")) {
      await dbService.deleteRequest(id);
    }
  };

  // 도장 이미지 저장
  const handleStampSave = async (base64: string) => {
    if (!currentUser) return;
    await dbService.saveUserStamp(currentUser.id, base64);
  };

  // 1급 결재선 관리자(과장) 승인/반려
  const handleManagerApprove = async (id: string) => {
    if (!currentUser) return;
    await dbService.approveByManager(id, currentUser.name);
  };
  const handleManagerReject = async (id: string, reason: string) => {
    if (!currentUser) return;
    await dbService.rejectByManager(id, currentUser.name, reason);
  };

  // 최종 전결권자(관장) 승인/반려
  const handleDirectorApprove = async (id: string) => {
    if (!currentUser) return;
    await dbService.approveByDirector(id, currentUser.name);
  };
  const handleDirectorReject = async (id: string, reason: string) => {
    if (!currentUser) return;
    await dbService.rejectByDirector(id, currentUser.name, reason);
  };

  // 임직원 목록 전체 수정 (관장)
  const handleStaffSave = async (updatedUsers: User[]) => {
    await dbService.saveUsers(updatedUsers);
  };

  // 마스터 DB 완전 무차별 초기화 (관장)
  const handleDatabaseReset = async () => {
    await dbService.resetDatabase();
    alert("데이터베이스가 깔끔하게 초기화되었습니다.\n초기 직원 데이터와 연차가 정상 복구되었습니다.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-bold text-slate-500">정보 동기화 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      
      {/* 글로벌 상단 헤더 */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onStampOpen={() => setIsStampOpen(true)}
        onStaffManage={() => setIsStaffOpen(true)}
        onChangePassword={() => setIsChangePwOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 print:p-0">

        {/* 관장인 경우 헤드 대시보드 */}
        {currentUser.role === Role.DIRECTOR && (
          <section className="space-y-3">
            <h3 className="text-xs font-black text-indigo-700 tracking-wider flex items-center gap-1.5 uppercase">
              <BadgeCheck className="h-4 w-4" />
              관장 결재 지원 대시보드
            </h3>
            <DirectorDashboard users={users} requests={requests} />
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* 좌측: 휴가 상신 폼 */}
          <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5 print:hidden">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <PencilLine className="h-4 w-4" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">전자결재 휴가계 작성</h2>
            </div>
            
            <LeaveRequestForm
              currentUser={currentUser}
              remainingLeave={remainingLeave}
              onSubmit={handleRequestSubmit}
            />
          </div>

          {/* 우측 결재 관리 박스 및 문서 조회 목록 */}
          <div className="md:col-span-7 space-y-6">
            
            {/* 결재 대기 분석함 */}
            <ApprovalBox
              currentUserRole={currentUser.role}
              currentUserId={currentUser.id}
              requests={requests}
              onApprove={currentUser.role === Role.DIRECTOR ? handleDirectorApprove : handleManagerApprove}
              onReject={currentUser.role === Role.DIRECTOR ? handleDirectorReject : handleManagerReject}
            />

            {/* 신청 서류 역사 목록 */}
            <RequestHistory
              currentUser={currentUser}
              requests={requests}
              onDelete={handleRequestDelete}
            />

            {/* 연차 수동 강제 수선용 어드민 테이블 (관장 단독) */}
            {currentUser.role === Role.DIRECTOR && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="h-4 w-4" />
                    직원 잔여/기본 연차 직접 조정
                  </h3>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400">
                        <th className="px-3.5 py-2">성명</th>
                        <th className="px-3.5 py-2">직위</th>
                        <th className="px-3.5 py-2">기본 연차</th>
                        <th className="px-3.5 py-2 text-right">조작</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="px-3.5 py-2.5">{u.name}</td>
                          <td className="px-3.5 py-2.5 text-slate-400 text-[11px]">{u.title}</td>
                          <td className="px-3.5 py-2.5 font-mono">{u.initialLeave}일</td>
                          <td className="px-3.5 py-2.5 text-right">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              수정
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 마스터 초기화 매니저 */}
            <LeaveResetManager
              currentUser={currentUser}
              onReset={handleDatabaseReset}
            />

          </div>

        </div>
      </main>

      {/* ── 각종 제어 모달 및 레이어 ──────────────────────────── */}

      {/* 도장 업로더 */}
      {isStampOpen && (
        <StampUploader
          currentUser={currentUser}
          onClose={() => setIsStampOpen(false)}
          onSaved={handleStampSave}
        />
      )}

      {/* 직원 대장 관리 모달 (관장) */}
      {isStaffOpen && (
        <StaffManager
          users={users}
          onClose={() => setIsStaffOpen(false)}
          onSaved={handleStaffSave}
        />
      )}

      {/* 연차 조정 모달 */}
      {editingUser && (
        <LeaveEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={async (u) => {
            const up = users.map(us => us.id === u.id ? u : us);
            await handleStaffSave(up);
          }}
        />
      )}

      {/* 비밀번호 변경 모달 */}
      {isChangePwOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePwOpen(false)}
        />
      )}

    </div>
  );
}
