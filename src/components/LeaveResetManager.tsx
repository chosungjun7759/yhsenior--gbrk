/**
 * LeaveResetManager.tsx
 */
import { User, Role } from "../types";
import { RefreshCw, Play } from "lucide-react";

interface LeaveResetManagerProps {
  currentUser: User;
  onReset: () => void;
}

export default function LeaveResetManager({ currentUser, onReset }: LeaveResetManagerProps) {
  if (currentUser.role !== Role.DIRECTOR) return null;

  const handleResetClick = () => {
    if (confirm("⚠️ 정말 연희노인복지관 휴가 결재 관리 DB를 전체 초기화하시겠습니까?\n모든 휴가 신청내역 전체가 삭제되고 직원이 복구됩니다.")) {
      onReset();
    }
  };

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h4 className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
          <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
          마스터 DB 종합 초기화
        </h4>
        <p className="text-[11px] text-rose-600 font-semibold leading-relaxed">
          클릭 한 번으로 Firestore에 보관된 역사 데이터(결재 신청, 이력) 전체가 자동 영구 파쇄되고,<br className="hidden sm:inline" />
          복지관 8인 기본 직원 목록과 부여 연차가 재생성됩니다.
        </p>
      </div>

      <button
        onClick={handleResetClick}
        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center cursor-pointer"
      >
        <Play className="h-3.5 w-3.5" />
        DB 초기화 실행하기
      </button>
    </div>
  );
}
