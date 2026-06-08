/**
 * ExportLeaveExcel.tsx
 * 전자결재 앱 → 출퇴근정리기 연동용 연차현황 엑셀 내보내기
 * 출퇴근정리기가 읽는 시트 구조와 동일하게 생성
 * 필요 라이브러리: xlsx (SheetJS) — CDN 또는 npm
 */
import { User, LeaveRequest, LeaveType } from "../types";
import { Download } from "lucide-react";

interface ExportLeaveExcelProps {
  users: User[];
  requests: LeaveRequest[];
  year: number;
}

// 날짜 → "M월 D일" 형식
function toKorDate(dateStr: string): string {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}월 ${parseInt(d)}일`;
}

// 날짜 범위 → "M월 D일~E일" 형식
function toKorDateRange(start: string, end: string): string {
  if (!start) return "";
  const [, sm, sd] = start.split("-");
  const [, em, ed] = end.split("-");
  if (sm === em && sd === ed) return `${parseInt(sm)}월 ${parseInt(sd)}일`;
  if (sm === em) return `${parseInt(sm)}월 ${parseInt(sd)}일~${parseInt(ed)}일`;
  return `${parseInt(sm)}월 ${parseInt(sd)}일~${parseInt(em)}월 ${parseInt(ed)}일`;
}

export default function ExportLeaveExcel({ users, requests, year }: ExportLeaveExcelProps) {

  const handleExport = async () => {
    // SheetJS 동적 로드
    let XLSX: any;
    try {
      // @ts-ignore
      XLSX = (window as any).XLSX;
      if (!XLSX) throw new Error("no XLSX");
    } catch {
      // CDN에서 로드
      await new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s.onload = () => res();
        s.onerror = () => rej(new Error("SheetJS 로드 실패"));
        document.head.appendChild(s);
      });
      // @ts-ignore
      XLSX = (window as any).XLSX;
    }

    const wb = XLSX.utils.book_new();

    // 시트 구성 정보
    const sheetConfigs = [
      { sheetName: "연가사용현황",          leaveTypes: [LeaveType.ANNUAL] },
      { sheetName: "반차사용현황",           leaveTypes: [LeaveType.HALF] },
      { sheetName: "사분의일휴가사용현황",   leaveTypes: [LeaveType.QUARTER] },
      { sheetName: "병가사용현황",           leaveTypes: [LeaveType.SICK] },
      { sheetName: "대체휴무사용현황",       leaveTypes: [LeaveType.REPLACEMENT] },
      { sheetName: "특별휴가사용현황",       leaveTypes: [LeaveType.SPECIAL, LeaveType.CHILD_CARE] },
    ];

    sheetConfigs.forEach(({ sheetName, leaveTypes }) => {
      const rows: any[][] = [];

      // 헤더행 (출퇴근정리기 parseLeaveSheet가 '성' 포함 행을 헤더로 인식)
      rows.push(["번호", "성명", "직위", "초기부여", "잔여", "사용내역(날짜)"]);

      users.forEach((user, idx) => {
        // 해당 직원의 해당 휴가 타입 최종 승인 건
        const approved = requests.filter(r =>
          r.userId === user.id &&
          r.status === "FINAL_APPROVED" &&
          leaveTypes.includes(r.leaveType) &&
          r.startDate?.startsWith(String(year))
        );

        // 사용 날짜 목록 (출퇴근정리기 파서가 "M월 D일" 형태로 읽음)
        const dateEntries = approved.map(r => toKorDateRange(r.startDate, r.endDate));

        // 데이터행: [번호, 이름, 직위, 초기, 잔여, 날짜1, 날짜2, ...]
        const dataRow: any[] = [
          idx + 1,
          user.name,
          user.title,
          user.initialLeave,
          "", // 잔여 — 출퇴근정리기에서는 미사용
          ...dateEntries,
        ];
        rows.push(dataRow);

        // 합계행 (출퇴근정리기가 nextIsAmt 패턴으로 인식 — 번호/이름 없는 행)
        const amtRow: any[] = [
          null, null, null, null, null,
          ...approved.map(r => r.duration),
        ];
        rows.push(amtRow);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // 다운로드
    XLSX.writeFile(wb, `${year}년_연차사용현황.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
      title="출퇴근정리기 연동용 연차현황 엑셀 내보내기"
    >
      <Download size={14} />
      연차현황 엑셀 내보내기
    </button>
  );
}
