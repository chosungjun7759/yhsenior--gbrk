export enum Role {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
  DIRECTOR = "DIRECTOR"
}

export interface User {
  id: string;
  name: string;
  role: Role;
  title: string;
  initialLeave: number;
  stampImage?: string; // base64 도장 이미지
  password?: string;   // 비밀번호 (기본값: "0000")
}

export enum LeaveType {
  ANNUAL = "ANNUAL",
  HALF = "HALF",
  QUARTER = "QUARTER",
  REPLACEMENT = "REPLACEMENT",
  SPECIAL = "SPECIAL",
  CHILD_CARE = "CHILD_CARE",
  SICK = "SICK"
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: "연가",
  [LeaveType.HALF]: "반일휴가",
  [LeaveType.QUARTER]: "1/4휴가",
  [LeaveType.REPLACEMENT]: "대체휴무",
  [LeaveType.SPECIAL]: "특별휴가",
  [LeaveType.CHILD_CARE]: "자녀돌봄휴가",
  [LeaveType.SICK]: "병가",
};

export type ApprovalStatus = "PENDING" | "MANAGER_APPROVED" | "FINAL_APPROVED" | "REJECTED";

// 업무 인수인계 항목
export interface HandoverItem {
  id: string;
  task: string;       // 업무명
  content: string;    // 주요 내용
  note: string;       // 비고
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userTitle: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  createdAt: string;
  status: ApprovalStatus;

  rejectedByRole?: Role;
  rejectedByName?: string;
  rejectionReason?: string;

  managerApprovalDate?: string;
  managerSign?: string;
  managerStamp?: string; // base64 과장 도장
  directorApprovalDate?: string;
  directorSign?: string;
  directorStamp?: string; // base64 관장 도장

  applicantStamp?: string; // base64 신청인 도장

  halfType?: "AM" | "PM";
  quarterType?: 0.25 | 0.125;
  quarterHours?: string;

  replacementDate?: string;
  replacementHours?: string;
  replacementTask?: string;
  replacementVerifier?: string;

  // 업무 인수인계서 (연가 전용)
  handoverItems?: HandoverItem[];      // 업무 항목 목록
  handoverDate?: string;               // 인수인계 날짜
  handoverPeriod?: string;             // 인계 기간 (startDate ~ endDate)
  handoverFrom?: string;               // 인계자 (본인 자동)
  handoverTo?: string;                 // 인수자
  handoverConfirmer?: string;          // 확인자
  // 인수인계서 승인은 휴가신청서 승인과 연동 (별도 결재 불필요)
  handoverApprovedAt?: string;         // 최종 승인 시각 (directorApprovalDate 복사)
  handoverApprovedBy?: string;         // 승인자 (directorSign 복사)
}
