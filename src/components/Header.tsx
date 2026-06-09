import { User, Role } from "../types";
import { LogOut, Heart, Stamp, Users, Lock } from "lucide-react";

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onStampOpen: () => void;
  onStaffManage: () => void;
  onChangePassword: () => void;
}

export default function Header({ currentUser, onLogout, onStampOpen, onStaffManage, onChangePassword }: HeaderProps) {
  const roleBadge =
    currentUser.role === Role.DIRECTOR
      ? { label: "관장 👑", cls: "bg-indigo-100 text-indigo-800 border-indigo-200" }
      : currentUser.role === Role.MANAGER
      ? { label: "과장 ★", cls: "bg-amber-100 text-amber-800 border-amber-200" }
      : { label: "직원", cls: "bg-slate-100 text-slate-600 border-slate-200" };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 text-white rounded-lg p-1.5">
            <Heart className="h-4 w-4 fill-current" />
          </div>
          <div>
            <span className="font-black text-slate-900 text-sm tracking-tight">연희노인복지관</span>
            <span className="ml-2 text-[10px] text-slate-400 font-semibold hidden sm:inline">전자결재 시스템</span>
          </div>
        </div>

        {/* 우측 */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-800">{currentUser.name} ({currentUser.title})</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadge.cls}`}>
            {roleBadge.label}
          </span>
          {/* 직원 관리 버튼 — 관장만 */}
          {currentUser.role === Role.DIRECTOR && (
            <button
              onClick={onStaffManage}
              title="직원 관리"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">직원 관리</span>
            </button>
          )}
          {/* 비밀번호 변경 버튼 */}
          {currentUser.role === Role.DIRECTOR && (
            <button
              onClick={onChangePassword}
              title="비밀번호 변경"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-600 border border-slate-200 hover:border-purple-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">비밀번호</span>
            </button>
          )}
          {/* 도장 등록 버튼 */}
          <button
            onClick={onStampOpen}
            title="내 도장 등록"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Stamp className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">도장 등록</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
}
