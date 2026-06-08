import { User, Role, LeaveRequest } from "./types";

export const INITIAL_USERS: User[] = [
  { id: "user_1", name: "김효영", role: Role.MANAGER,  title: "과장",         initialLeave: 15.75  },
  { id: "user_2", name: "최지선", role: Role.STAFF,    title: "사회복지사",   initialLeave: 14.75  },
  { id: "user_3", name: "김윤희", role: Role.STAFF,    title: "사회복지사",   initialLeave: 5.0    },
  { id: "user_4", name: "홍진우", role: Role.STAFF,    title: "사회복지사",   initialLeave: 9.5    },
  { id: "user_5", name: "조성준", role: Role.DIRECTOR, title: "관장",         initialLeave: 15.125 },
  { id: "user_6", name: "허진수", role: Role.STAFF,    title: "스마트매니저", initialLeave: 0.25   },
  { id: "user_7", name: "안석우", role: Role.STAFF,    title: "안전관리인",   initialLeave: 11.25  },
  { id: "user_8", name: "김태경", role: Role.STAFF,    title: "조리사",       initialLeave: 9.5    },
];

export const INITIAL_REQUESTS: LeaveRequest[] = [];
