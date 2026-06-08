import React from "react";
import { LeaveRequest, LeaveType } from "../types";
import { X, Printer } from "lucide-react";

interface PrintFormProps {
  request: LeaveRequest;
  onClose: () => void;
}

const LEAVE_TITLES: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]:      "휴 가 신 청 서",
  [LeaveType.HALF]:        "반 일  휴 가  신 청 서",
  [LeaveType.QUARTER]:     "1 / 4  휴 가  신 청 서",
  [LeaveType.REPLACEMENT]: "대 체 휴 무  신 청 서",
  [LeaveType.SPECIAL]:     "특 별 휴 가  신 청 서",
  [LeaveType.CHILD_CARE]:  "자 녀 돌 봄  휴 가  신 청 서",
  [LeaveType.SICK]:        "병 가  신 청 서",
};

const WEEKDAYS = ["일","월","화","수","목","금","토"];

function formatDate(d?: string) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${y}년 ${m}월 ${dd}일`;
}
function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${String(d.getMonth()+1).padStart(2,"0")}월 ${String(d.getDate()).padStart(2,"0")}일`;
}
function weekday(d?: string) {
  if (!d) return "";
  return WEEKDAYS[new Date(d).getDay()];
}
function calcDays(s?: string, e?: string) {
  if (!s || !e) return 0;
  return Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1;
}

export default function PrintForm({ request, onClose }: PrintFormProps) {
  const title = LEAVE_TITLES[request.leaveType] ?? "휴 가 신 청 서";

  const handlePrint = () => {
    // 새 탭에 순수 HTML로 열어서 인쇄
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) { alert("팝업이 차단되었습니다. 팝업을 허용한 후 다시 시도해주세요."); return; }
    w.document.write(buildHTML());
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
    // onload가 이미 fired된 경우 대비
    setTimeout(() => { try { w.focus(); w.print(); } catch(e) {} }, 800);
  };

  const stampCellHTML = (stamp?: string, name?: string) => {
    if (stamp) return `<td class="sc"><img src="${stamp}" style="width:42px;height:42px;object-fit:contain;opacity:.85"></td>`;
    if (name) return `<td class="sc"><span style="font-size:8pt;color:#333">${name}</span></td>`;
    return `<td class="sc"></td>`;
  };

  const periodHTML = () => {
    switch (request.leaveType) {
      case LeaveType.ANNUAL: case LeaveType.SPECIAL:
      case LeaveType.CHILD_CARE: case LeaveType.SICK: {
        const days = calcDays(request.startDate, request.endDate);
        return `<p class="ind">${formatDate(request.startDate)} 부터&nbsp;&nbsp;${formatDate(request.endDate)} 까지&nbsp;&nbsp;<b>(총 ${days}일)</b></p>`;
      }
      case LeaveType.HALF: {
        const am = request.halfType === "AM";
        return `<table class="it"><tr><td class="th" style="width:72px">기&nbsp;&nbsp;&nbsp;간</td><td colspan="2">${formatDate(request.startDate)}&nbsp;(${weekday(request.startDate)}요일)</td></tr><tr><td class="th" rowspan="2">시&nbsp;&nbsp;&nbsp;간</td><td style="width:110px">${am?"■":"□"}&nbsp;오전</td><td>09:00 ~ 14:00</td></tr><tr><td>${!am?"■":"□"}&nbsp;오후</td><td>14:00 ~ 18:00</td></tr></table>`;
      }
      case LeaveType.QUARTER: {
        const h = (request.quarterHours ?? "—").replace(/\n/g,"<br>");
        return `<table class="it"><tr><td class="th" style="width:72px">기&nbsp;&nbsp;&nbsp;간</td><td>${formatDate(request.startDate)}&nbsp;(${weekday(request.startDate)}요일)</td></tr><tr><td class="th">휴가시간</td><td>${h}</td></tr></table>`;
      }
      case LeaveType.REPLACEMENT:
        return `<table class="it" style="margin-bottom:10px"><tr><td class="th">근무일자</td><td class="th">근무시간</td><td class="th">업무내용</td><td class="th">확인자서명</td></tr><tr><td>${request.replacementDate??""}</td><td>${request.replacementHours??""}</td><td>${request.replacementTask??""}</td><td style="height:36px"></td></tr></table><table class="it"><tr><td class="th" style="width:72px">기&nbsp;&nbsp;&nbsp;간</td><td>${formatDate(request.startDate)}&nbsp;(${weekday(request.startDate)}요일)</td></tr><tr><td class="th">시&nbsp;&nbsp;&nbsp;간</td><td>${request.halfType==="AM"?"■":"□"}&nbsp;오전&nbsp;&nbsp;&nbsp;${request.halfType==="PM"?"■":"□"}&nbsp;오후</td></tr></table>`;
      default:
        return `<p class="ind">${formatDate(request.startDate)} ~ ${formatDate(request.endDate)}</p>`;
    }
  };

  const buildHTML = () => `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>휴가신청서</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;background:#fff;font-family:'바탕체','Batang',serif;font-size:13pt;color:#000}
.page{width:210mm;min-height:297mm;padding:25mm 30mm 25mm 30mm}
.tit{text-align:center;font-size:22pt;font-weight:700;letter-spacing:.18em;border-bottom:2.5px solid #000;padding-bottom:8px;margin-bottom:10px}
.aw{display:flex;justify-content:flex-end;margin-bottom:10px}
.at{border-collapse:collapse;font-size:10pt;text-align:center}
.at td{border:1px solid #000;padding:3px 6px;vertical-align:middle}
.sc{width:56px;height:56px;text-align:center;vertical-align:middle}
.sec{margin-top:28px}
.st{font-size:13pt;font-weight:700;margin-bottom:10px}
.ind{padding-left:16px;font-size:12pt;line-height:2.3}
.it{border-collapse:collapse;width:calc(100% - 16px);margin-left:16px;font-size:11pt}
.it td{border:1px solid #000;padding:7px 12px;vertical-align:middle;line-height:1.8}
.th{background:#f5f5f5;font-weight:700;text-align:center;white-space:nowrap}
.ft{margin-top:36px;font-size:12pt;line-height:2.0;text-indent:1em}
.sb{margin-top:32px;text-align:right;font-size:12pt;line-height:2.6}
.si{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:1.5px solid #b00;color:#b00;font-size:9pt;vertical-align:middle;margin-left:8px}
.inst{margin-top:52px;text-align:center;font-size:16pt;font-weight:700;letter-spacing:.15em}
@page{size:A4 portrait;margin:0}
@media print{html,body{width:210mm}button{display:none}}
</style></head><body>
<div class="page">
<div class="tit">${title}</div>
<div class="aw"><table class="at">
<tr><td style="width:34px;height:20px;font-size:8pt">결재</td><td style="width:50px;height:20px">과장</td><td style="width:50px;height:20px">관장</td></tr>
<tr><td style="font-size:8pt">재</td>${stampCellHTML(request.managerStamp,request.managerSign)}${stampCellHTML(request.directorStamp,request.directorSign)}</tr>
</table></div>
<div class="sec"><div class="st">1. 신청인 인적사항</div>
<p class="ind">소속 : 연희노인복지관&nbsp;&nbsp;&nbsp;&nbsp;직위 : ${request.userTitle}&nbsp;&nbsp;&nbsp;&nbsp;성명 : ${request.userName}</p></div>
<div class="sec"><div class="st">2. 신청기간</div>${periodHTML()}</div>
<div class="sec"><div class="st">3. 신청사유</div>
<p class="ind">${request.reason||"개인사유"}</p></div>
<p class="ft">상기와 같이 휴가 신청서를 제출하오니 허락하여 주시기 바랍니다.</p>
<div class="sb">
<div>${formatCreatedAt(request.createdAt)}</div>
<div style="display:flex;align-items:center;justify-content:flex-end;gap:6px">
신청인 : ${request.userName}
${request.applicantStamp
  ? `<img src="${request.applicantStamp}" style="width:32px;height:32px;object-fit:contain;opacity:.85;vertical-align:middle">`
  : `<span class="si">인</span>`}
</div></div>
<div class="inst">연 희 노 인 복 지 관 장 &nbsp;&nbsp; 귀 하</div>
</div>
</body></html>`;

  // ── JSX 미리보기용 스타일 ──
  const S = {
    td: { border:"1px solid #000", padding:"5px 10px", verticalAlign:"middle" as const, lineHeight:1.6 },
    th: { border:"1px solid #000", padding:"5px 10px", verticalAlign:"middle" as const, background:"#f5f5f5", fontWeight:700, textAlign:"center" as const, whiteSpace:"nowrap" as const },
  };

  const PeriodJSX = () => {
    switch (request.leaveType) {
      case LeaveType.ANNUAL: case LeaveType.SPECIAL:
      case LeaveType.CHILD_CARE: case LeaveType.SICK: {
        const days = calcDays(request.startDate, request.endDate);
        return <p style={{paddingLeft:14,fontSize:13,lineHeight:2.1,margin:0}}>{formatDate(request.startDate)} 부터&nbsp;&nbsp;{formatDate(request.endDate)} 까지&nbsp;&nbsp;<b>(총 {days}일)</b></p>;
      }
      case LeaveType.HALF: {
        const am = request.halfType === "AM";
        return <table style={{borderCollapse:"collapse",width:"100%",fontSize:12,marginLeft:14}}><tbody>
          <tr><td style={{...S.th,width:72}}>기&nbsp;&nbsp;&nbsp;간</td><td style={S.td} colSpan={2}>{formatDate(request.startDate)}&nbsp;({weekday(request.startDate)}요일)</td></tr>
          <tr><td style={S.th} rowSpan={2}>시&nbsp;&nbsp;&nbsp;간</td><td style={{...S.td,width:110}}>{am?"■":"□"}&nbsp;오전</td><td style={S.td}>09:00 ~ 14:00</td></tr>
          <tr><td style={S.td}>{!am?"■":"□"}&nbsp;오후</td><td style={S.td}>14:00 ~ 18:00</td></tr>
        </tbody></table>;
      }
      case LeaveType.QUARTER:
        return <table style={{borderCollapse:"collapse",width:"100%",fontSize:12,marginLeft:14}}><tbody>
          <tr><td style={{...S.th,width:72}}>기&nbsp;&nbsp;&nbsp;간</td><td style={S.td}>{formatDate(request.startDate)}&nbsp;({weekday(request.startDate)}요일)</td></tr>
          <tr><td style={S.th}>휴가시간</td><td style={S.td}>{(request.quarterHours??"—").split("\n").map((t,i)=><div key={i}>{t}</div>)}</td></tr>
        </tbody></table>;
      case LeaveType.REPLACEMENT:
        return <><table style={{borderCollapse:"collapse",width:"100%",fontSize:12,marginLeft:14,marginBottom:10}}><thead>
          <tr><td style={S.th}>근무일자</td><td style={S.th}>근무시간</td><td style={S.th}>업무내용</td><td style={{...S.th,minWidth:64}}>확인자서명</td></tr>
          </thead><tbody><tr><td style={S.td}>{request.replacementDate??""}</td><td style={S.td}>{request.replacementHours??""}</td><td style={S.td}>{request.replacementTask??""}</td><td style={{...S.td,height:36}}></td></tr></tbody></table>
          <table style={{borderCollapse:"collapse",width:"100%",fontSize:12,marginLeft:14}}><tbody>
            <tr><td style={{...S.th,width:72}}>기&nbsp;&nbsp;&nbsp;간</td><td style={S.td}>{formatDate(request.startDate)}&nbsp;({weekday(request.startDate)}요일)</td></tr>
            <tr><td style={S.th}>시&nbsp;&nbsp;&nbsp;간</td><td style={S.td}>{request.halfType==="AM"?"■":"□"}&nbsp;오전&nbsp;&nbsp;&nbsp;{request.halfType==="PM"?"■":"□"}&nbsp;오후</td></tr>
          </tbody></table></>;
      default:
        return <p style={{paddingLeft:14,fontSize:13}}>{formatDate(request.startDate)} ~ {formatDate(request.endDate)}</p>;
    }
  };

  const SC = ({stamp,name}:{stamp?:string;name?:string}) => (
    <td style={{border:"1px solid #000",width:50,height:50,textAlign:"center",verticalAlign:"middle"}}>
      {stamp?<img src={stamp} style={{width:42,height:42,objectFit:"contain",opacity:.85}}/>:name?<span style={{fontSize:10,color:"#333"}}>{name}</span>:null}
    </td>
  );

  return (
    <>
      <style>{`
        .pf-bg{position:fixed;inset:0;z-index:9000;background:rgba(10,15,30,.85);display:flex;flex-direction:column;align-items:center;padding:20px 16px 40px;overflow-y:auto;}
        .pf-bar{width:100%;max-width:660px;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;color:#fff;flex-shrink:0;}
        .pf-bar-title{font-size:13px;font-weight:700;opacity:.9;}
        .pf-btns{display:flex;gap:8px;}
        .pf-btn{display:flex;align-items:center;gap:6px;padding:8px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:none;}
        .pf-btn-p{background:#1d4ed8;color:#fff;}
        .pf-btn-c{background:rgba(255,255,255,.15);color:#fff;}
        /* A4 비율 미리보기: 660px × 934px (660*1.4142) */
        .pf-sheet{
          width:660px;height:934px;background:#fff;flex-shrink:0;overflow:hidden;
          box-shadow:0 8px 40px rgba(0,0,0,.5);
          font-family:'바탕체','Batang',serif;color:#000;
          padding:88px 96px 80px 96px;box-sizing:border-box;
        }
        .pf-tit{text-align:center;font-size:26px;font-weight:700;letter-spacing:.18em;border-bottom:2.5px solid #000;padding-bottom:7px;margin-bottom:10px;}
        .pf-aw{display:flex;justify-content:flex-end;margin-bottom:8px;}
        .pf-at{border-collapse:collapse;font-size:11px;text-align:center;}
        .pf-at td{border:1px solid #000;padding:3px 5px;vertical-align:middle;}
        .pf-sec{margin-top:22px;}
        .pf-st{font-size:14px;font-weight:700;margin-bottom:8px;}
        .pf-ft{margin-top:28px;font-size:13px;line-height:2.0;text-indent:1em;}
        .pf-sb{margin-top:26px;text-align:right;font-size:13px;line-height:2.4;}
        .pf-inst{margin-top:42px;text-align:center;font-size:17px;font-weight:700;letter-spacing:.15em;}
      `}</style>

      <div className="pf-bg">
        <div className="pf-bar">
          <span className="pf-bar-title">📄 휴가신청서 미리보기</span>
          <div className="pf-btns">
            <button className="pf-btn pf-btn-p" onClick={handlePrint}><Printer size={13}/>인쇄하기</button>
            <button className="pf-btn pf-btn-c" onClick={onClose}><X size={13}/>닫기</button>
          </div>
        </div>

        <div className="pf-sheet">
          <div className="pf-tit">{title}</div>
          <div className="pf-aw">
            <table className="pf-at"><tbody>
              <tr>
                <td style={{width:32,height:18,fontSize:8}}>결재</td>
                <td style={{width:48,height:18}}>과장</td>
                <td style={{width:48,height:18}}>관장</td>
              </tr>
              <tr>
                <td style={{fontSize:8}}>재</td>
                <SC stamp={request.managerStamp} name={request.managerSign}/>
                <SC stamp={request.directorStamp} name={request.directorSign}/>
              </tr>
            </tbody></table>
          </div>

          <div className="pf-sec">
            <div className="pf-st">1. 신청인 인적사항</div>
            <p style={{paddingLeft:14,fontSize:13,lineHeight:2.2,margin:0}}>
              소속 : 연희노인복지관&nbsp;&nbsp;&nbsp;&nbsp;직위 : {request.userTitle}&nbsp;&nbsp;&nbsp;&nbsp;성명 : {request.userName}
            </p>
          </div>

          <div className="pf-sec">
            <div className="pf-st">2. 신청기간</div>
            <PeriodJSX/>
          </div>

          <div className="pf-sec">
            <div className="pf-st">3. 신청사유</div>
            <p style={{paddingLeft:14,fontSize:13,lineHeight:2.2,margin:0}}>{request.reason||"개인사유"}</p>
          </div>

          <p className="pf-ft">상기와 같이 휴가 신청서를 제출하오니 허락하여 주시기 바랍니다.</p>

          <div className="pf-sb">
            <div>{formatCreatedAt(request.createdAt)}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
              <span>신청인 : {request.userName}</span>
              {request.applicantStamp
                ? <img src={request.applicantStamp} style={{width:30,height:30,objectFit:"contain",opacity:.85,verticalAlign:"middle"}}/>
                : <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:"50%",border:"1.5px solid #b00",color:"#b00",fontSize:9}}>인</span>}
            </div>
          </div>

          <div className="pf-inst">연 희 노 인 복 지 관 장 &nbsp;&nbsp; 귀 하</div>
        </div>
      </div>
    </>
  );
}
