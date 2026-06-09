/**
 * PrintForm.tsx
 */
import React, { useState } from "react";
import { LeaveRequest, LEAVE_TYPE_LABELS, LeaveType } from "../types";
import { Printer, FileText, X } from "lucide-react";

interface PrintFormProps {
  request: LeaveRequest;
}

function fmtDate(d?: string) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${y}년 ${m}월 ${dd}일`;
}

export default function PrintForm({ request }: PrintFormProps) {
  const [show, setShow] = useState(false);

  const getSubTitleText = () => {
    if (request.leaveType === LeaveType.HALF) {
      return `【 반일휴가 (차감: 0.5일) / 구분: ${request.halfType === "AM" ? "오전 (09:00~14:00)" : "오후 (14:00~18:00)"} 】`;
    }
    if (request.leaveType === LeaveType.QUARTER) {
      return `【 1/4휴가 (차감: ${request.quarterType ?? 0.25}일) / 시간대: ${request.quarterHours ?? ""} 】`;
    }
    if (request.leaveType === LeaveType.REPLACEMENT) {
      return `【 대체휴무 / 확인자: ${request.replacementVerifier || ""} (근무일: ${request.replacementDate || ""} / 시간: ${request.replacementHours || ""} / 업무: ${request.replacementTask || ""}) 】`;
    }
    return "";
  };

  // ── 인쇄용 HTML 빌드 ─────────────────────────────────────────
  const buildPrintHTML = () => {
    // 결재 증인 도장 렌더링
    const makeStamp = (stamp?: string, name?: string) => {
      if (stamp) return `<img src="${stamp}" style="width:36px;height:36px;object-fit:contain;opacity:.85">`;
      if (name) return `<span style="font-size:9pt;font-weight:700">${name}</span>`;
      return `<span style="color:#aaa;font-size:8pt;font-weight:normal">(인)</span>`;
    };

    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>휴가원 인쇄</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;font-family:'바탕체','Batang',serif;font-size:13pt;color:#000;background:#fff}
.page{width:210mm;min-height:297mm;padding:25mm 28mm 20mm}
@page{size:A4 portrait;margin:0}
@media print{html,body{width:210mm}button{display:none}}
</style></head><body>
<div class="page">

  <!-- 관인/제목 박스 -->
  <div style="border:3px double #000;padding:24px;text-align:center;margin-bottom:24px;position:relative">
    <div style="font-size:24pt;font-weight:700;letter-spacing:.25em">휴 가 원</div>
    <div style="font-size:10pt;font-weight:700;margin-top:6px">${getSubTitleText()}</div>
  </div>

  <!-- 결재란 -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:22px">
    <table style="border-collapse:collapse;font-size:10pt;text-align:center">
      <tr>
        <td style="border:1px solid #000;width:34px;height:22px;padding:2px 4px;font-size:8pt">결재</td>
        <td style="border:1px solid #000;width:54px;height:22px;padding:2px 4px">과장</td>
        <td style="border:1px solid #000;width:54px;height:22px;padding:2px 4px">관장</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;font-size:8pt;height:54px;vertical-align:middle">재</td>
        <td style="border:1px solid #000;height:54px;text-align:center;vertical-align:middle">
          ${makeStamp(request.managerStamp, request.managerSign)}
        </td>
        <td style="border:1px solid #000;height:54px;text-align:center;vertical-align:middle">
          ${makeStamp(request.directorStamp, request.directorSign)}
        </td>
      </tr>
    </table>
  </div>

  <!-- 기본 내용 표 -->
  <table style="border-collapse:collapse;width:100%;margin-bottom:28px">
    <tr>
      <td style="border:1px solid #000;background:#f8f9fa;font-weight:700;padding:12px 14px;text-align:center;width:86px;white-space:nowrap">소 속</td>
      <td style="border:1px solid #000;padding:12px 16px" colspan="3">연희노인복지관</td>
    </tr>
    <tr>
      <td style="border:1px solid #000;background:#f8f9fa;font-weight:700;padding:12px 14px;text-align:center;width:86px;white-space:nowrap">직 위</td>
      <td style="border:1px solid #000;padding:12px 16px;width:37%">${request.userTitle}</td>
      <td style="border:1px solid #000;background:#f8f9fa;font-weight:700;padding:12px 14px;text-align:center;width:86px;white-space:nowrap">성 명</td>
      <td style="border:1px solid #000;padding:12px 16px">${request.userName}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000;background:#f8f9fa;font-weight:700;padding:12px 14px;text-align:center;white-space:nowrap">휴가 종류</td>
      <td style="border:1px solid #000;padding:12px 16px" colspan="3">${LEAVE_TYPE_LABELS[request.leaveType]}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000;background:#f8f9fa;font-weight:700;padding:12px 14px;text-align:center;white-space:nowrap">휴가 기간</td>
      <td style="border:1px solid #000;padding:12px 16px;line-height:1.4" colspan="3">
        ${fmtDate(request.startDate)} ${request.leaveType === LeaveType.HALF || request.leaveType === LeaveType.QUARTER ? "" : `부터 &nbsp; ${fmtDate(request.endDate)} 까지`}
        <br>
        <span style="font-size:11pt;color:#333">(총 ${request.duration}일간)</span>
      </td>
    </tr>
    <tr>
      <td style="border:1px solid #000;background:#f8f9fa;font-weight:700;padding:14px;text-align:center;height:120px;vertical-align:top;white-space:nowrap">사 유</td>
      <td style="border:1px solid #000;padding:16px;vertical-align:top;line-height:1.6;white-space:pre-wrap" colspan="3">${request.reason}</td>
    </tr>
  </table>

  <!-- 안내 문구 -->
  <div style="font-size:11pt;line-height:1.8;margin-bottom:48px;padding-left:4px">
    위와 같이 가사(기타) 등의 사유로 인하여 휴가를 신청하오니 허락하여 주시기 바랍니다.
  </div>

  <!-- 신청 일자 -->
  <div style="text-align:center;font-size:13pt;font-weight:700;margin-bottom:34px">
    ${fmtDate(request.createdAt?.split("T")[0])}
  </div>

  <!-- 신청자 최종 서명란 -->
  <div style="display:flex;justify-content:flex-end;align-items:center;padding-right:24px;margin-bottom:52px;font-size:13pt">
    <span style="font-weight:700">신청인 :</span>
    <span style="margin:0 10px;font-weight:700">${request.userName}</span>
    <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;vertical-align:middle">
      ${request.applicantStamp
        ? `<img src="${request.applicantStamp}" style="width:38px;height:38px;object-fit:contain;opacity:.85">`
        : `<span style="font-size:9pt;color:#999;border:1px solid #ccc;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center">(인)</span>`}
    </div>
  </div>

  <!-- 종결 귀하 -->
  <div style="text-align:center;font-size:16pt;font-weight:700;letter-spacing:.2em;margin-top:20px">
    연 희 노 인 복 지 관 장 &nbsp;&nbsp; 귀 하
  </div>

</div>
</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=850,height=1100");
    if (!w) {  return; }
    w.document.write(buildPrintHTML());
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch(e) {} }, 800);
  };

  const td: React.CSSProperties = { border: "1px solid #000", padding: "10px 14px", verticalAlign: "middle" };
  const thTd: React.CSSProperties = { ...td, background: "#f8f9fa", fontWeight: 700, textAlign: "center" as const, whiteSpace: "nowrap" as const };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
      >
        <Printer size={13} /> 인쇄
      </button>

      {show && (
        <>
          {/* 간이 팝업 & 인쇄 미리보기 */}
          <style>{`
            .po-bg{position:fixed;inset:0;z-index:9000;background:rgba(10,15,30,.80);display:flex;flex-direction:column;align-items:center;padding:24px 16px 40px;overflow-y:auto;}
            .po-bar{width:100%;max-width:620px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;color:#fff;flex-shrink:0;}
            .po-title{font-size:14px;font-weight:900;opacity:.95;}
            .po-btns{display:flex;gap:8px;}
            .po-btn{display:flex;align-items:center;gap:6px;padding:8px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:none;}
            .po-btn-p{background:#2563eb;color:#fff;}
            .po-btn-c{background:rgba(255,255,255,.15);color:#fff;}
            .po-sheet{width:620px;background:#fff;flex-shrink:0;box-shadow:0 10px 40px rgba(0,0,0,.45);font-family:'바탕체','Batang',serif;color:#000;padding:60px 64px;}
          `}</style>

          <div className="po-bg">
            <div className="po-bar">
              <span className="po-title">📄 휴가원 인쇄 미리보기</span>
              <div className="po-btns">
                <button className="po-btn po-btn-p" onClick={handlePrint}><Printer size={13} /> 인쇄하기</button>
                <button className="po-btn po-btn-c" onClick={() => setShow(false)}><X size={13} /> 닫기</button>
              </div>
            </div>

            {/* A4 용지 비율 시트 */}
            <div className="po-sheet">
              {/* 관인 및 제목 박스 */}
              <div style={{ border: "2px double #000", padding: "16px", textAlign: "center", marginBottom: "18px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: ".25em" }}>휴 가 원</span>
                <p style={{ fontSize: "10px", color: "#555", marginTop: "3px" }}>{getSubTitleText()}</p>
              </div>

              {/* 결재란 */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 10, textAlign: "center" }}>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", width: 28, height: 18, fontSize: 8 }}>결재</td>
                      <td style={{ border: "1px solid #000", width: 46, height: 18 }}>과장</td>
                      <td style={{ border: "1px solid #000", width: 46, height: 18 }}>관장</td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", fontSize: 8, height: 44, verticalAlign: "middle" }}>재</td>
                      <td style={{ border: "1px solid #000", height: 44, textAlign: "center", verticalAlign: "middle" }}>
                        {request.managerStamp
                          ? <img src={request.managerStamp} style={{ width: 34, height: 34, objectFit: "contain", opacity: .85 }} />
                          : request.managerSign ? <span style={{ fontSize: 9, fontWeight: "bold" }}>{request.managerSign}</span> : null}
                      </td>
                      <td style={{ border: "1px solid #000", height: 44, textAlign: "center", verticalAlign: "middle" }}>
                        {request.directorStamp
                          ? <img src={request.directorStamp} style={{ width: 34, height: 34, objectFit: "contain", opacity: .85 }} />
                          : request.directorSign ? <span style={{ fontSize: 9, fontWeight: "bold" }}>{request.directorSign}</span> : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 입력 표 */}
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px", marginBottom: "20px" }}>
                <tbody>
                  <tr>
                    <td style={{ ...thTd, width: 72 }}>소 속</td>
                    <td style={td} colSpan={3}>연희노인복지관</td>
                  </tr>
                  <tr>
                    <td style={{ ...thTd, width: 72 }}>직 위</td>
                    <td style={{ ...td, width: "38%" }}>{request.userTitle}</td>
                    <td style={{ ...thTd, width: 72 }}>성 명</td>
                    <td style={td}>{request.userName}</td>
                  </tr>
                  <tr>
                    <td style={thTd}>휴가 종류</td>
                    <td style={td} colSpan={3}>{LEAVE_TYPE_LABELS[request.leaveType]}</td>
                  </tr>
                  <tr>
                    <td style={thTd}>휴가 기간</td>
                    <td style={{ ...td, lineHeight: 1.4 }} colSpan={3}>
                      {fmtDate(request.startDate)} {request.leaveType === LeaveType.HALF || request.leaveType === LeaveType.QUARTER ? "" : `부터  ${fmtDate(request.endDate)} 까지`}
                      <br />
                      <span style={{ fontSize: "10px", color: "#666" }}>(총 {request.duration}일간)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...thTd, height: 90, verticalAlign: "top" }}>사 유</td>
                    <td style={{ ...td, verticalAlign: "top", whiteSpace: "pre-wrap", lineHeight: 1.5 }} colSpan={3}>{request.reason}</td>
                  </tr>
                </tbody>
              </table>

              <p style={{ fontSize: "11px", lineHeight: "1.7", marginBottom: "36px" }}>
                위와 같이 가사(기타) 등의 사유로 인하여 휴가를 신청하오니 허락하여 주시기 바랍니다.
              </p>

              <div style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold", marginBottom: "24px" }}>
                {fmtDate(request.createdAt?.split("T")[0])}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: "12px", paddingRight: "10px", marginBottom: "36px" }}>
                <span style={{ fontWeight: "bold" }}>신청인:</span>
                <span style={{ margin: "0 8px", fontWeight: "bold" }}>{request.userName}</span>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, verticalAlign: "middle" }}>
                  {request.applicantStamp
                    ? <img src={request.applicantStamp} style={{ width: 32, height: 32, objectFit: "contain", opacity: .85 }} />
                    : <span style={{ fontSize: "9px", color: "#aaa" }}>(인)</span>}
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", letterSpacing: ".2em" }}>
                연 희 노 인 복 지 관 장   귀 하
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
