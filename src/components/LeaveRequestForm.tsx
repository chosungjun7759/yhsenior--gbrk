import { useState } from "react";
import { User, LeaveRequest, LeaveType, LEAVE_TYPE_LABELS } from "../types";
import { dbService } from "../databaseService";
import { Send, ClipboardList } from "lucide-react";
import HandoverForm from "./HandoverForm";

interface LeaveRequestFormProps {
  currentUser: User;
  remainingLeave: number;
  onSubmit: (formData: Omit<LeaveRequest, "id" | "createdAt" | "status">) => void;
}

export default function LeaveRequestForm({ currentUser, remainingLeave, onSubmit }: LeaveRequestFormProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.ANNUAL);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // 반일휴가
  const [halfType, setHalfType] = useState<"AM" | "PM">("AM");

  // 1/4휴가
  const [quarterType, setQuarterType] = useState<0.25 | 0.125>(0.25);
  const [quarterHours, setQuarterHours] = useState("");

  // 인수인계서
  const [activeTab, setActiveTab] = useState<"leave"|"handover">("leave");
  const [handoverData, setHandoverData] = useState<{
    handoverItems: any[];
    handoverDate: string;
    handoverPeriod: string;
    handoverFrom: string;
    handoverTo: string;
    handoverConfirmer: string;
  } | null>(null);

  // 대체휴무
  const [replacementDate, setReplacementDate] = useState("");
  const [replacementHours, setReplacementHours] = useState("");
  const [replacementTask, setReplacementTask] = useState("");
  const [replacementVerifier, setReplacementVerifier] = useState("");

  // duration 계산
  const calcDuration = (): number => {
    if (leaveType === LeaveType.HALF) return 0.5;
    if (leaveType === LeaveType.QUARTER) return quarterType;
    if (leaveType === LeaveType.REPLACEMENT) return 0;
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleSubmit = () => {
    if (!startDate) { alert("시작일을 선택해주세요."); return; }
    if (
      leaveType !== LeaveType.HALF &&
      leaveType !== LeaveType.QUARTER &&
      leaveType !== LeaveType.REPLACEMENT &&
      !endDate
    ) { alert("종료일을 선택해주세요."); return; }

    // 연가 시 인수인계서 필수
    if (leaveType === LeaveType.ANNUAL && (!handoverData || !handoverData.handoverTo)) {
      alert("연가 신청 시 인수인계서의 인수자를 입력해주세요.");
      setActiveTab("handover");
      return;
    }

    const duration = calcDuration();
    if (
      (leaveType === LeaveType.ANNUAL || leaveType === LeaveType.HALF || leaveType === LeaveType.QUARTER) &&
      duration > remainingLeave
    ) {
      alert(`잔여 연차(${remainingLeave}일)가 부족합니다.`);
      return;
    }

    // 신청인 도장 직접 첨부
    const applicantStamp = dbService.getUserStamp(currentUser.id);

    const base = {
      userId: currentUser.id,
      userName: currentUser.name,
      userTitle: currentUser.title,
      leaveType,
      startDate,
      endDate: endDate || startDate,
      duration,
      reason: reason || "개인사유",
      applicantStamp,
    };

    const extra: Partial<LeaveRequest> = {};
    if (leaveType === LeaveType.HALF) extra.halfType = halfType;
    if (leaveType === LeaveType.QUARTER) {
      extra.quarterType = quarterType;
      extra.quarterHours = quarterHours;
    }
    if (leaveType === LeaveType.REPLACEMENT) {
      extra.replacementDate = replacementDate;
      extra.replacementHours = replacementHours;
      extra.replacementTask = replacementTask;
      extra.replacementVerifier = replacementVerifier;
    }

    const handoverExtra = leaveType === LeaveType.ANNUAL && handoverData ? {
      handoverItems: handoverData.handoverItems,
      handoverDate: handoverData.handoverDate,
      handoverPeriod: handoverData.handoverPeriod,
      handoverFrom: handoverData.handoverFrom,
      handoverTo: handoverData.handoverTo,
      handoverConfirmer: handoverData.handoverConfirmer,
    } : {};

    onSubmit({ ...base, ...extra, ...handoverExtra } as Omit<LeaveRequest, "id" | "createdAt" | "status">);

    // 폼 초기화
    setStartDate(""); setEndDate(""); setReason("");
    setQuarterHours(""); setReplacementDate("");
    setReplacementHours(""); setReplacementTask(""); setReplacementVerifier("");
    setHandoverData(null); setActiveTab("leave");
  };

  return (
    <div className="space-y-5">
      {/* 잔여 연차 표시 */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-blue-700 font-semibold">현재 잔여 연차</span>
        <span className="text-lg font-black font-mono text-blue-600">{remainingLeave}일</span>
      </div>

      {/* 휴가 종류 선택 */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">휴가 종류</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(LeaveType).map((type) => (
            <button
              key={type}
              onClick={() => setLeaveType(type)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                leaveType === type
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {LEAVE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* 연가 선택 시 탭 전환 */}
      {leaveType === LeaveType.ANNUAL && (
        <div className="flex border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setActiveTab("leave")}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${activeTab==="leave"?"bg-blue-600 text-white":"bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <Send size={12} /> 휴가 신청 내용
          </button>
          <button
            onClick={() => setActiveTab("handover")}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${activeTab==="handover"?"bg-blue-600 text-white":"bg-white text-slate-600 hover:bg-slate-50"} ${!handoverData?.handoverTo?"border-l border-slate-200":""}`}
          >
            <ClipboardList size={12} /> 인수인계서
            {leaveType === LeaveType.ANNUAL && !handoverData?.handoverTo && (
              <span className="bg-red-500 text-white text-[9px] px-1 rounded font-black">필수</span>
            )}
          </button>
        </div>
      )}

      {/* 인수인계서 탭 */}
      {leaveType === LeaveType.ANNUAL && activeTab === "handover" && (
        <HandoverForm
          userName={currentUser.name}
          startDate={startDate}
          endDate={endDate}
          initialData={handoverData ? {
            items: handoverData.handoverItems,
            date: handoverData.handoverDate,
            period: handoverData.handoverPeriod,
            to: handoverData.handoverTo,
            confirmer: handoverData.handoverConfirmer,
          } : undefined}
          onChange={setHandoverData}
        />
      )}

      {/* 휴가 신청 탭 (연가가 아니거나 leave 탭일 때) */}
      {(leaveType !== LeaveType.ANNUAL || activeTab === "leave") && <>

      {/* 날짜 입력 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">
            {leaveType === LeaveType.HALF || leaveType === LeaveType.QUARTER ? "날짜" : "시작일"}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
          />
        </div>
        {leaveType !== LeaveType.HALF && leaveType !== LeaveType.QUARTER && leaveType !== LeaveType.REPLACEMENT && (
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">종료일</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
            />
          </div>
        )}
      </div>

      {/* 반일휴가 — 오전/오후 선택 */}
      {leaveType === LeaveType.HALF && (
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">시간대 선택</label>
          <div className="grid grid-cols-2 gap-3">
            {(["AM", "PM"] as const).map(t => (
              <button
                key={t}
                onClick={() => setHalfType(t)}
                className={`py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  halfType === t ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
              >
                {t === "AM" ? "오전 (09:00~14:00)" : "오후 (14:00~18:00)"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1/4휴가 */}
      {leaveType === LeaveType.QUARTER && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">차감 단위</label>
            <div className="grid grid-cols-2 gap-3">
              {([0.25, 0.125] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setQuarterType(q)}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                    quarterType === q ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {q === 0.25 ? "1/4일 (2시간)" : "1/8일 (1시간)"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">휴가 시간대 (예: 09:00~11:00)</label>
            <input
              type="text"
              value={quarterHours}
              onChange={e => setQuarterHours(e.target.value)}
              placeholder="09:00~11:00"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
            />
          </div>
        </div>
      )}

      {/* 대체휴무 */}
      {leaveType === LeaveType.REPLACEMENT && (
        <div className="space-y-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-700">근무 내역 입력</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">근무일자</label>
              <input
                type="date"
                value={replacementDate}
                onChange={e => setReplacementDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">근무시간 (예: 08:00~12:00)</label>
              <input
                type="text"
                value={replacementHours}
                onChange={e => setReplacementHours(e.target.value)}
                placeholder="08:00~12:00"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">업무내용</label>
              <input
                type="text"
                value={replacementTask}
                onChange={e => setReplacementTask(e.target.value)}
                placeholder="바자회 업무 등"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">확인자</label>
              <input
                type="text"
                value={replacementVerifier}
                onChange={e => setReplacementVerifier(e.target.value)}
                placeholder="확인자 성명"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              />
            </div>
          </div>
          <p className="text-xs font-bold text-amber-700 mt-2">사용 일자 입력 (위 날짜란에 대체휴무 사용일 입력)</p>
        </div>
      )}

      {/* 신청 사유 */}
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1.5">신청 사유</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="개인사유 등 간략히 기재해 주세요."
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white resize-none"
        />
      </div>

      </> /* 휴가 신청 탭 끝 */}

      {/* 예상 차감 */}
      {calcDuration() > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-semibold">예상 차감 연차</span>
          <span className="text-sm font-black text-red-500">-{calcDuration()}일</span>
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm cursor-pointer"
      >
        <Send className="h-4 w-4" />
        전자결재 상신하기
      </button>
    </div>
  );
}
