import { User, Role, LeaveRequest } from "./types";

export const INITIAL_USERS: User[] = [
  { id: "user_1", name: "김효영", role: Role.MANAGER,  title: "과장",         initialLeave: 15.75,  email: "young800408@yhsenior.or.kr" },
  { id: "user_2", name: "최지선", role: Role.STAFF,    title: "사회복지사",   initialLeave: 14.75,  email: "jsc09@yhsenior.or.kr" },
  { id: "user_3", name: "김윤희", role: Role.STAFF,    title: "사회복지사",   initialLeave: 5.0,    email: "ehddp12@yhsenior.or.kr" },
  { id: "user_4", name: "홍진우", role: Role.STAFF,    title: "사회복지사",   initialLeave: 9.5,    email: "" },
  { id: "user_5", name: "조성준", role: Role.DIRECTOR, title: "관장",         initialLeave: 15.125, email: "chosungjun@yhsenior.or.kr" },
  { id: "user_6", name: "허진수", role: Role.STAFF,    title: "스마트매니저", initialLeave: 0.25,   email: "jinsu9161@yhsenior.or.kr" },
  { id: "user_7", name: "안석우", role: Role.STAFF,    title: "안전관리인",   initialLeave: 11.25,  email: "asw4902@yhsenior.or.kr" },
  { id: "user_8", name: "김태경", role: Role.STAFF,    title: "조리사",       initialLeave: 9.5,    email: "" },
];

export const INITIAL_REQUESTS: LeaveRequest[] = [];
