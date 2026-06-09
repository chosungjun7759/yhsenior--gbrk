/**
 * HandoverPrint.tsx
 * 업무 인수인계서 미리보기 + 출력
 */
import React, { useState } from "react";
import { LeaveRequest } from "../types";
import { FileText, X, Printer } from "lucide-react";

interface HandoverPrintProps {
  request: LeaveRequest;
}

function fmtDate(d?: string) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${y}년 ${m}월 ${dd}일`;
}

export default function HandoverPrint({ request }: HandoverPrintProps) {
  const [show, setShow] = useState(false);
  if (!request.handoverItems?.length) return null;

  const items = request.handoverItems ?? [];
  const TOTAL_ROWS = 8;
  const blankCount = Math.max(0, TOTAL_ROWS - items.length);

  // ── 인쇄용 HTML ──────────────────────────────────────────
  const buildPrintHTML = () => {
    // 업무 항목 행
    const itemRows = items.map((item, i) => `
      <tr>
        <td style="text-align:center;background:#fafafa;width:40px;border:1px solid #000;padding:6px 8px">${i + 1}</td>
        <td style="width:22%;border:1px solid #000;padding:6px 10px">${item.task || ""}</td>
        <td style="border:1px solid #000;padding:6px 10px;white-space:pre-wrap;line-height:1.7">${item.content || ""}</td>
        <td style="width:18%;border:1px solid #000;padding:6px 10px">${item.note || ""}</td>
      </tr>`).join("");

    // 빈 행: "이하 여백" 텍스트로 병합
    const blankRow = blankCount > 0
      ? `<tr>
          <td colspan="4" style="border:1px solid #000;height:${blankCount * 36}px;vertical-align:middle;text-align:center;color:#aaa;font-size:10pt;letter-spacing:.1em">이 하 &nbsp; 여 백</td>
        </tr>`
      : "";

    // 도장 HTML
    const makeStamp = (stamp?: string, name?: string, emptyGray = false) => {
      if (stamp) return `<img src="${stamp}" style="width:34px;height:34px;object-fit:contain;opacity:.85;vertical-align:middle;margin-left:4px">`;
      if (emptyGray) return `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;border:1px solid #aaa;color:#aaa;font-size:8pt;vertical-align:middle;margin-left:4px">(인)</span>`;
      return `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;border:1.5px solid #b00;color:#b00;font-size:8pt;vertical-align:middle;margin-left:4px">(인)</span>`;
    };

    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>업무인수인계서</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;font-family:'바탕체','Batang',serif;font-size:13pt;color:#000;background:#fff}
.page{width:210mm;min-height:297mm;padding:22mm 26mm 20mm}
@page{size:A4 portrait;margin:0}
@media print{html,body{width:210mm}button{display:none}}
</style></head><body>
<div class="page">

  <!-- 제목 (단독 중앙) -->
  <div style="text-align:center;font-size:22pt;font-weight:700;letter-spacing:.15em;border-bottom:2.5px solid #000;padding-bottom:8px;margin-bottom:0">
    업 무 인 수 인 계 서
  </div>

  <!-- 결재란 (제목 아래 우측 독립) -->
  <div style="display:flex;justify-content:flex-end;margin-top:8px;margin-bottom:14px">
    <table style="border-collapse:collapse;font-size:10pt;text-align:center">
      <tr>
        <td style="border:1px solid #000;width:34px;height:20px;padding:2px 4px;font-size:8pt">결재</td>
        <td style="border:1px solid #000;width:52px;height:20px;padding:2px 4px">과장</td>
        <td style="border:1px solid #000;width:52px;height:20px;padding:2px 4px">관장</td>
      </tr>
      <tr>
        <td style="border:1px solid #000;font-size:8pt;height:52px;vertical-align:middle">재</td>
        <td style="border:1px solid #000;height:52px;text-align:center;vertical-align:middle">
          ${request.managerStamp
            ? `<img src="${request.managerStamp}" style="width:42px;height:42px;object-fit:contain;opacity:.85">`
            : request.managerSign ? `<span style="font-size:9pt">${request.managerSign}</span>` : ""}
        </td>
        <td style="border:1px solid #000;height:52px;text-align:center;vertical-align:middle">
          ${request.handoverApprovedBy
            ? request.directorStamp
              ? `<img src="${request.directorStamp}" style="width:42px;height:42px;object-fit:contain;opacity:.85">`
              : `<span style="font-size:9pt">${request.handoverApprovedBy}</span>`
            : ""}
        </td>
      </tr>
    </table>
  </div>

  <!-- 기본 정보 -->
  <table style="border-collapse:collapse;width:100%;margin-bottom:16px;font-size:12pt">
    <tr>
      <td style="border:1px solid #000;background:#f5f5f5;font-weight:700;text-align:center;padding:7px 12px;white-space:nowrap;width:84px">인수인계 날짜</td>
      <td style="border:1px solid #000;padding:7px 12px">${fmtDate(request.handoverDate)}</td>
      <td style="border:1px solid #000;background:#f5f5f5;font-weight:700;text-align:center;padding:7px 12px;white-space:nowrap;width:84px">인계 기간</td>
      <td style="border:1px solid #000;padding:7px 12px">${request.handoverPeriod ?? ""}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000;background:#f5f5f5;font-weight:700;text-align:center;padding:7px 12px">인계자</td>
      <td style="border:1px solid #000;padding:7px 12px">${request.handoverFrom ?? request.userName}</td>
      <td style="border:1px solid #000;background:#f5f5f5;font-weight:700;text-align:center;padding:7px 12px">인수자</td>
      <td style="border:1px solid #000;padding:7px 12px">${request.handoverTo ?? ""}</td>
    </tr>
  </table>

  <!-- 업무 항목 표 -->
  <table style="border-collapse:collapse;width:100%;font-size:11pt">
    <thead>
      <tr>
        <th style="border:1px solid #000;padding:7px 10px;background:#f5f5f5;font-weight:700;text-align:center;width:40px">번호</th>
        <th style="border:1px solid #000;padding:7px 10px;background:#f5f5f5;font-weight:700;text-align:center;width:22%">업무명</th>
        <th style="border:1px solid #000;padding:7px 10px;background:#f5f5f5;font-weight:700;text-align:center">주요 내용</th>
        <th style="border:1px solid #000;padding:7px 10px;background:#f5f5f5;font-weight:700;text-align:center;width:18%">비고</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      ${blankRow}
    </tbody>
  </table>

  <!-- 서명란 -->
  <table style="border-collapse:collapse;width:100%;font-size:12pt;margin-top:18px">
    <tr>
      <td style="border:1px solid #000;background:#f5f5f5;font-weight:700;text-align:center;padding:8px 14px;white-space:nowrap;width:68px">인계자</td>
      <td style="border:1px solid #000;padding:8px 14px;height:54px;text-align:center;vertical-align:middle">
        ${request.handoverFrom ?? request.userName}
        ${makeStamp(request.applicantStamp)}
      </td>
      <td style="border:1px solid #000;background:#f5f5f5;font-weight:700;text-align:center;padding:8px 14px;white-space:nowrap;width:68px">인수자</td>
      <td style="border:1px solid #000;padding:8px 14px;height:54px;text-align:center;vertical-align:middle">
        ${request.handoverTo ?? ""}
        ${makeStamp(undefined, undefined, true)}
      </td>
      <td style="border:1px solid #000;background:#f5f5f5;font-weight:700;text-align:center;padding:8px 14px;white-space:nowrap;width:68px">확인자</td>
      <td style="border:1px solid #000;padding:8px 14px;height:54px;text-align:center;vertical-align:middle">
        ${request.handoverConfirmer ?? ""}
        ${makeStamp(request.managerStamp)}
      </td>
    </tr>
  </table>

  <div style="margin-top:36px;text-align:center;font-size:14pt;font-weight:700;letter-spacing:.13em">
    연 희 노 인 복 지 관 장 &nbsp;&nbsp; 귀 하
  </div>
</div>
</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) {  return; }
    w.document.write(buildPrintHTML());
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch(e) {} }, 800);
  };

  // ── JSX 미리보기 스타일 ──
  const td: React.CSSProperties = { border:"1px solid #000", padding:"5px 9px", verticalAlign:"middle" as const };
  const thTd: React.CSSProperties = { ...td, background:"#f5f5f5", fontWeight:700, textAlign:"center" as const, whiteSpace:"nowrap" as const };

  const StampCircle = ({ stamp, empty = false }: { stamp?: string; empty?: boolean }) => (
    stamp
      ? <img src={stamp} style={{ width:30, height:30, objectFit:"contain", opacity:.85, verticalAlign:"middle", marginLeft:3 }} />
      : <span style={{
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          width:24, height:24, borderRadius:"50%", verticalAlign:"middle", marginLeft:3,
          border: empty ? "1px solid #aaa" : "1.5px solid #b00",
          color: empty ? "#aaa" : "#b00", fontSize:8
        }}>(인)</span>
  );

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
      >
        <FileText size={13} /> 인수인계서
      </button>

      {show && (
        <>
          <style>{`
            .hp-bg{position:fixed;inset:0;z-index:9100;background:rgba(10,15,30,.85);display:flex;flex-direction:column;align-items:center;padding:20px 16px 40px;overflow-y:auto;}
            .hp-bar{width:100%;max-width:660px;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;color:#fff;flex-shrink:0;}
            .hp-bar-title{font-size:13px;font-weight:700;opacity:.9;}
            .hp-btns{display:flex;gap:8px;}
            .hp-btn{display:flex;align-items:center;gap:6px;padding:8px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:none;}
            .hp-btn-p{background:#7c3aed;color:#fff;}
            .hp-btn-c{background:rgba(255,255,255,.15);color:#fff;}
            .hp-sheet{width:660px;background:#fff;flex-shrink:0;box-shadow:0 8px 40px rgba(0,0,0,.5);font-family:'바탕체','Batang',serif;color:#000;padding:72px 80px 60px;box-sizing:border-box;}
          `}</style>

          <div className="hp-bg">
            {/* 승인 배지 */}
            <div style={{ width:"100%", maxWidth:660, marginBottom:8, display:"flex", justifyContent:"flex-end" }}>
              {request.handoverApprovedAt
                ? <span style={{ background:"#dcfce7", color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:700 }}>✅ 승인완료 ({request.handoverApprovedAt})</span>
                : <span style={{ background:"#fef9c3", color:"#ca8a04", border:"1px solid #fde68a", borderRadius:8, padding:"4px 12px", fontSize:11, fontWeight:700 }}>⏳ 결재 대기 중</span>
              }
            </div>

            <div className="hp-bar">
              <span className="hp-bar-title">📋 업무 인수인계서 미리보기</span>
              <div className="hp-btns">
                <button className="hp-btn hp-btn-p" onClick={handlePrint}><Printer size={13}/> 인쇄하기</button>
                <button className="hp-btn hp-btn-c" onClick={() => setShow(false)}><X size={13}/> 닫기</button>
              </div>
            </div>

            <div className="hp-sheet">

              {/* 제목 단독 — 중앙 */}
              <div style={{ textAlign:"center", fontSize:24, fontWeight:700, letterSpacing:".15em", borderBottom:"2.5px solid #000", paddingBottom:6, marginBottom:0 }}>
                업 무 인 수 인 계 서
              </div>

              {/* 결재란 — 제목 아래 독립 우측 정렬 */}
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8, marginBottom:12 }}>
                <table style={{ borderCollapse:"collapse", fontSize:11, textAlign:"center" }}>
                  <tbody>
                    <tr>
                      <td style={{ ...td, width:32, height:18, fontSize:8 }}>결재</td>
                      <td style={{ ...td, width:50, height:18 }}>과장</td>
                      <td style={{ ...td, width:50, height:18 }}>관장</td>
                    </tr>
                    <tr>
                      <td style={{ ...td, fontSize:8, height:48, verticalAlign:"middle" }}>재</td>
                      <td style={{ ...td, width:50, height:48, textAlign:"center", verticalAlign:"middle" }}>
                        {request.managerStamp
                          ? <img src={request.managerStamp} style={{ width:40, height:40, objectFit:"contain", opacity:.85 }} />
                          : request.managerSign ? <span style={{ fontSize:9 }}>{request.managerSign}</span> : null}
                      </td>
                      <td style={{ ...td, width:50, height:48, textAlign:"center", verticalAlign:"middle" }}>
                        {request.handoverApprovedBy
                          ? request.directorStamp
                            ? <img src={request.directorStamp} style={{ width:40, height:40, objectFit:"contain", opacity:.85 }} />
                            : <span style={{ fontSize:9 }}>{request.handoverApprovedBy}</span>
                          : null}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 기본 정보 */}
              <table style={{ borderCollapse:"collapse", width:"100%", marginBottom:14, fontSize:12 }}>
                <tbody>
                  <tr>
                    <td style={thTd}>인수인계 날짜</td>
                    <td style={td}>{fmtDate(request.handoverDate)}</td>
                    <td style={thTd}>인계 기간</td>
                    <td style={td}>{request.handoverPeriod ?? ""}</td>
                  </tr>
                  <tr>
                    <td style={thTd}>인계자</td>
                    <td style={td}>{request.handoverFrom ?? request.userName}</td>
                    <td style={thTd}>인수자</td>
                    <td style={td}>{request.handoverTo ?? ""}</td>
                  </tr>
                </tbody>
              </table>

              {/* 업무 항목 표 */}
              <table style={{ borderCollapse:"collapse", width:"100%", fontSize:11 }}>
                <thead>
                  <tr>
                    <th style={{ ...thTd, width:32 }}>번호</th>
                    <th style={{ ...thTd, width:"22%" }}>업무명</th>
                    <th style={thTd}>주요 내용</th>
                    <th style={{ ...thTd, width:"17%" }}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id ?? i}>
                      <td style={{ ...td, textAlign:"center", background:"#fafafa" }}>{i + 1}</td>
                      <td style={td}>{item.task || ""}</td>
                      <td style={{ ...td, whiteSpace:"pre-wrap", lineHeight:1.6 }}>{item.content || ""}</td>
                      <td style={td}>{item.note || ""}</td>
                    </tr>
                  ))}
                  {/* 빈 행 — "이하 여백" */}
                  {blankCount > 0 && (
                    <tr>
                      <td colSpan={4} style={{ ...td, height: blankCount * 28, verticalAlign:"middle", textAlign:"center", color:"#aaa", fontSize:11, letterSpacing:".1em" }}>이 하 &nbsp; 여 백</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* 서명란 */}
              <table style={{ borderCollapse:"collapse", width:"100%", fontSize:12, marginTop:16 }}>
                <tbody>
                  <tr>
                    <td style={{ ...thTd, width:62 }}>인계자</td>
                    <td style={{ ...td, height:50, textAlign:"center" }}>
                      <span style={{ marginRight:3 }}>{request.handoverFrom ?? request.userName}</span>
                      <StampCircle stamp={request.applicantStamp} />
                    </td>
                    <td style={{ ...thTd, width:62 }}>인수자</td>
                    <td style={{ ...td, height:50, textAlign:"center" }}>
                      <span style={{ marginRight:3 }}>{request.handoverTo ?? ""}</span>
                      <StampCircle empty />
                    </td>
                    <td style={{ ...thTd, width:62 }}>확인자</td>
                    <td style={{ ...td, height:50, textAlign:"center" }}>
                      <span style={{ marginRight:3 }}>{request.handoverConfirmer ?? ""}</span>
                      <StampCircle stamp={request.managerStamp} />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop:30, textAlign:"center", fontSize:15, fontWeight:700, letterSpacing:".13em" }}>
                연 희 노 인 복 지 관 장 &nbsp;&nbsp; 귀 하
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
