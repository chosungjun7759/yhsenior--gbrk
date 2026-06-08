import { User, LeaveRequest, Role, LeaveType } from "./types";
import { INITIAL_USERS, INITIAL_REQUESTS } from "./data";

const STORAGE_KEYS = {
  USERS: "yeonhee_users_v1",
  REQUESTS: "yeonhee_requests_v1"
};

export const dbService = {
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  },

  getRequests(): LeaveRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  saveRequests(requests: LeaveRequest[]) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  // 도장 이미지 저장 (userId 기준)
  saveUserStamp(userId: string, base64: string) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;
    users[idx].stampImage = base64;
    this.saveUsers(users);
  },

  // 도장 이미지 조회
  getUserStamp(userId: string): string | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === userId)?.stampImage;
  },

  getRemainingLeave(userId: string): number {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return 0;
    const approvedRequests = this.getRequests().filter(
      req => req.userId === userId && req.status === "FINAL_APPROVED"
    );
    const deduction = approvedRequests.reduce((sum, req) => {
      if (
        req.leaveType === LeaveType.ANNUAL ||
        req.leaveType === LeaveType.HALF ||
        req.leaveType === LeaveType.QUARTER
      ) {
        return sum + req.duration;
      }
      return sum;
    }, 0);
    return Math.max(0, parseFloat((user.initialLeave - deduction).toFixed(3)));
  },

  addRequest(request: Omit<LeaveRequest, "id" | "createdAt" | "status">): LeaveRequest {
    const requests = this.getRequests();
    const isManagerApplying = request.userId === "user_1";
    const initialStatus = isManagerApplying ? "MANAGER_APPROVED" : "PENDING";

    // 신청인 도장 자동 첨부
    const applicantStamp = this.getUserStamp(request.userId);

    const newRequest: LeaveRequest = {
      ...request,
      id: "req_" + Date.now(),
      createdAt: new Date().toISOString(),
      status: initialStatus,
      applicantStamp,
      ...(isManagerApplying ? {
        managerApprovalDate: new Date().toISOString().split("T")[0],
        managerSign: "김효영",
        managerStamp: this.getUserStamp("user_1"),
      } : {})
    };
    requests.unshift(newRequest);
    this.saveRequests(requests);
    return newRequest;
  },

  approveByManager(requestId: string, managerName: string): LeaveRequest | null {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    const req = requests[index];
    req.status = "MANAGER_APPROVED";
    req.managerApprovalDate = new Date().toISOString().split("T")[0];
    req.managerSign = managerName;
    // 과장 도장 첨부 (user_1 고정)
    req.managerStamp = this.getUserStamp("user_1");
    delete req.rejectedByRole;
    delete req.rejectedByName;
    delete req.rejectionReason;
    requests[index] = req;
    this.saveRequests(requests);
    return req;
  },

  rejectByManager(requestId: string, managerName: string, reason: string): LeaveRequest | null {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    const req = requests[index];
    req.status = "REJECTED";
    req.rejectedByRole = Role.MANAGER;
    req.rejectedByName = managerName;
    req.rejectionReason = reason;
    requests[index] = req;
    this.saveRequests(requests);
    return req;
  },

  approveByDirector(requestId: string, directorName: string): LeaveRequest | null {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    const req = requests[index];
    req.status = "FINAL_APPROVED";
    req.directorApprovalDate = new Date().toISOString().split("T")[0];
    req.directorSign = directorName;
    req.directorStamp = this.getUserStamp("user_5");
    // 인수인계서도 함께 자동 승인
    if (req.handoverItems && req.handoverItems.length > 0) {
      req.handoverApprovedAt = new Date().toISOString().split("T")[0];
      req.handoverApprovedBy = directorName;
    }
    delete req.rejectedByRole;
    delete req.rejectedByName;
    delete req.rejectionReason;
    requests[index] = req;
    this.saveRequests(requests);
    return req;
  },

  rejectByDirector(requestId: string, directorName: string, reason: string): LeaveRequest | null {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    const req = requests[index];
    req.status = "REJECTED";
    req.rejectedByRole = Role.DIRECTOR;
    req.rejectedByName = directorName;
    req.rejectionReason = reason;
    requests[index] = req;
    this.saveRequests(requests);
    return req;
  },

  resetDatabase() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
  }
};
