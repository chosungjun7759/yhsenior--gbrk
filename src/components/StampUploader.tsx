/**
 * StampUploader.tsx
 */
import React, { useState, useRef } from "react";
import { User } from "../types";
import { X, Upload, Trash2, Camera } from "lucide-react";

interface StampUploaderProps {
  currentUser: User;
  onClose: () => void;
  onSaved: (base64: string) => void;
}

export default function StampUploader({ currentUser, onClose, onSaved }: StampUploaderProps) {
  const [stamp, setStamp] = useState<string | null>(currentUser.stampImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setStamp(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaved(stamp || "");
    onClose();
  };

  const handleRemove = () => {
    setStamp(null);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9500, background:"rgba(10,15,30,.80)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"380px", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-black text-slate-900 tracking-tight">{currentUser.name} {currentUser.title} 도장 설정</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 relative min-h-[160px]">
          {stamp ? (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 border border-red-200 rounded-full flex items-center justify-center bg-white p-2 mx-auto shadow-sm">
                <img src={stamp} alt=" stamp preview" className="max-w-full max-h-full object-contain" />
              </div>
              <button
                onClick={handleRemove}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto cursor-pointer"
              >
                <Trash2 size={12} /> 이미지 삭제
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group text-center space-y-3 cursor-pointer"
            >
              <div className="p-4 bg-white rounded-full inline-block shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                <Upload size={24} />
              </div>
              <div>
                <span className="block text-xs font-black text-slate-800">결재용 도장(사인) 이미지 첨부</span>
                <span className="block text-[10px] text-slate-400 font-bold mt-1">권장 사이즈: 150px * 150px (PNG 추천)</span>
              </div>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm transition-colors cursor-pointer"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
