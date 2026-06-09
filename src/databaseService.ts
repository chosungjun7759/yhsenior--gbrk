/**
 * databaseService.ts
 * Firebase Firestore 버전
 * localStorage → Firestore 완전 교체
 */
import {
  collection, doc, getDocs, getDoc,
  setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { User, LeaveRequest, Role, LeaveType, ApprovalStatus } from "./types";
import { INITIAL_USERS } from "./data";

const USERS_COL = "users";
const REQUESTS_COL = "requests";

export const dbService = {

  // ── 사용자 ──────────────────────────────────────────────

  async getUsers(): Promise<User[]> {
    const snap = await getDocs(collection(db, USERS_COL));
    if (snap.empty) {
      // 초기 직원 데이터 자동 생성
      await this.initUsers();
      return INITIAL_USERS;
    }
    return snap.docs.map(d => d.data() as User);
  },

  async initUsers() {
    const batch = writeBatch(db);
    INITIAL_USERS.forEach(user => {
      batch.set(doc(db, USERS_COL, user.id), user);
    });
    await batch.commit();
  },

  async saveUsers(users: User[]) {
    const batch = writeBatch(db);
    users.forEach(user => {
      batch.set(doc(db, USERS_COL, user.id), user);
    });
    await batch.commit();
  },

  async saveUserStamp(userId: string, base64: string) {
    await updateDoc(doc(db, USERS_COL, userId), { stampImage: base64 });
  },

  async getUserStamp(userId: string): Promise<string | undefined> {
    const snap = await getDoc(doc(db, USERS_COL, userId));
    return snap.exists() ? (snap.data() as User).stampImage : undefined;
  },

  // ── 휴가 신청 ────────────────────────────────────────────

  async getRequests(): Promise<LeaveRequest[]> {
    const snap = await getDocs(
      query(collection(db, REQUESTS_COL), orderBy("createdAt", "desc"))
    );
    return snap.docs.map(d => d.data() as LeaveRequest);
  },

  async saveRequests(requests: LeaveRequest[]) {
    const batch = writeBatch(db);
    requests.forEach(req => {
      batch.set(doc(db, REQUESTS_COL, req.id), req);
    });
    await batch.commit();
  },

  async addRequest(request: Omit<LeaveRequest, "id" | "createdAt" | "status">): Promise<LeaveRequest> {
    const isManagerApplying = request.userId === "user_1";
    const initialStatus = isManagerApplying ? "MANAGER_APPROVED" : "PENDING";
    const stampSnap = await getDoc(doc(db, USERS_COL, request.userId));
    const applicantStamp = (stampSnap.data() as User)?.stampImage;

    const newRequest: LeaveRequest = {
      ...request,
      id: "req_" + Date.now(),
      createdAt: new Date().toISOString(),
      status: initialStatus,
      applicantStamp,
      ...(isManagerApplying ? {
        managerApprovalDate: new Date().toISOString().split("T")[0],
        managerSign: "김효영",
        managerStamp: applicantStamp,
      } : {})
    };
    await setDoc(doc(db, REQUESTS_COL, newRequest.id), newRequest);
    return newRequest;
  },

  async approveByManager(requestId: string, managerName: string): Promise<LeaveRequest | null> {
    const ref = doc(db, REQUESTS_COL, requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const managerStampSnap = await getDoc(doc(db, USERS_COL, "user_1"));
    const managerStamp = (managerStampSnap.data() as User)?.stampImage;
    const updates = {
      status: "MANAGER_APPROVED" as ApprovalStatus,
      managerApprovalDate: new Date().toISOString().split("T")[0],
      managerSign: managerName,
      managerStamp: managerStamp ?? null,
      rejectedByRole: null,
      rejectedByName: null,
      rejectionReason: null,
    };
    await updateDoc(ref, updates);
    return { ...snap.data() as LeaveRequest, ...updates };
  },

  async rejectByManager(requestId: string, managerName: string, reason: string): Promise<LeaveRequest | null> {
    const ref = doc(db, REQUESTS_COL, requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const updates = {
      status: "REJECTED" as ApprovalStatus,
      rejectedByRole: Role.MANAGER,
      rejectedByName: managerName,
      rejectionReason: reason,
    };
    await updateDoc(ref, updates);
    return { ...snap.data() as LeaveRequest, ...updates };
  },

  async approveByDirector(requestId: string, directorName: string): Promise<LeaveRequest | null> {
    const ref = doc(db, REQUESTS_COL, requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const directorStampSnap = await getDoc(doc(db, USERS_COL, "user_5"));
    const directorStamp = (directorStampSnap.data() as User)?.stampImage;
    const req = snap.data() as LeaveRequest;
    const updates: Partial<LeaveRequest> = {
      status: "FINAL_APPROVED",
      directorApprovalDate: new Date().toISOString().split("T")[0],
      directorSign: directorName,
      directorStamp: directorStamp ?? undefined,
      rejectedByRole: undefined,
      rejectedByName: undefined,
      rejectionReason: undefined,
    };
    if (req.handoverItems && req.handoverItems.length > 0) {
      updates.handoverApprovedAt = new Date().toISOString().split("T")[0];
      updates.handoverApprovedBy = directorName;
    }
    await updateDoc(ref, updates);
    return { ...req, ...updates };
  },

  async rejectByDirector(requestId: string, directorName: string, reason: string): Promise<LeaveRequest | null> {
    const ref = doc(db, REQUESTS_COL, requestId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const updates = {
      status: "REJECTED" as ApprovalStatus,
      rejectedByRole: Role.DIRECTOR,
      rejectedByName: directorName,
      rejectionReason: reason,
    };
    await updateDoc(ref, updates);
    return { ...snap.data() as LeaveRequest, ...updates };
  },

  async deleteRequest(requestId: string) {
    await deleteDoc(doc(db, REQUESTS_COL, requestId));
  },

  async getRemainingLeave(userId: string): Promise<number> {
    const userSnap = await getDoc(doc(db, USERS_COL, userId));
    if (!userSnap.exists()) return 0;
    const user = userSnap.data() as User;
    const reqSnap = await getDocs(collection(db, REQUESTS_COL));
    const approved = reqSnap.docs
      .map(d => d.data() as LeaveRequest)
      .filter(r =>
        r.userId === userId &&
        r.status === "FINAL_APPROVED" &&
        (r.leaveType === LeaveType.ANNUAL ||
         r.leaveType === LeaveType.HALF ||
         r.leaveType === LeaveType.QUARTER)
      );
    const deduction = approved.reduce((sum, r) => sum + r.duration, 0);
    return Math.max(0, parseFloat((user.initialLeave - deduction).toFixed(3)));
  },

  async resetDatabase() {
    // 모든 요청 삭제
    const reqSnap = await getDocs(collection(db, REQUESTS_COL));
    const batch = writeBatch(db);
    reqSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    // 사용자 초기화
    await this.initUsers();
  },

  // ── 실시간 구독 ──────────────────────────────────────────

  subscribeUsers(callback: (users: User[]) => void) {
    return onSnapshot(collection(db, USERS_COL), snap => {
      callback(snap.docs.map(d => d.data() as User));
    });
  },

  subscribeRequests(callback: (requests: LeaveRequest[]) => void) {
    return onSnapshot(
      query(collection(db, REQUESTS_COL), orderBy("createdAt", "desc")),
      snap => {
        callback(snap.docs.map(d => d.data() as LeaveRequest));
      }
    );
  },
};
