import { useRef, useState, useEffect } from "react";
import { User } from "../types";
import { dbService } from "../databaseService";
import { Upload, CheckCircle, X, Stamp } from "lucide-react";

interface StampUploaderProps {
  currentUser: User;
  onClose: () => void;
  onSaved: () => void;
}

export default function StampUploader({ currentUser, onClose, onSaved }: StampUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);

  useEffect(() => {
    dbService.getUserStamp(currentUser.id).then(s => setPreview(s));
  }, [currentUser.id]);
  const [saved, setSaved] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {  return; }
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    await dbService.saveUserStamp(currentUser.id, preview);
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 800);
  };

  const handleDelete = async () => {
    await dbService.saveUserStamp(currentUser.id, "");
    setPreview(undefined);
    setSaved(false);
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:8000,
      background:"rgba(10,15,30,.75)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"24px"
    }}>
      <div style={{
        background:"#fff", borderRadius:"20px", padding:"32px",
        width:"100%", maxWidth:"400px", boxShadow:"0 20px 60px rgba(0,0,0,.3)"
      }}>
        {/* 헤더 */}
        <div style={{ display:"flex", alignItems:"center", justifyBetween:"space-between", marginBottom:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <Stamp size={20} color="#1d4ed8" />
            <span style={{ fontSize:"15px", fontWeight:800, color:"#0f172a" }}>
              {currentUser.name} 도장 등록
            </span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
            <X size={18} />
          </button>
        </div>

        {/* 업로드 영역 */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          style={{
            border:"2px dashed #cbd5e1", borderRadius:"14px",
            padding:"24px", textAlign:"center", cursor:"pointer",
            background:"#f8fafc", marginBottom:"16px",
            transition:"border-color .15s",
          }}
        >
          {preview ? (
            <img src={preview} alt="미리보기" style={{ maxWidth:"120px", maxHeight:"120px", objectFit:"contain", margin:"0 auto", display:"block" }} />
          ) : (
            <>
              <Upload size={32} color="#94a3b8" style={{ margin:"0 auto 8px" }} />
              <p style={{ fontSize:"13px", color:"#64748b", fontWeight:600 }}>클릭 또는 드래그로 도장 이미지 업로드</p>
              <p style={{ fontSize:"11px", color:"#94a3b8", marginTop:"4px" }}>PNG, JPG 권장 (배경 투명 PNG 최적)</p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display:"none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {/* 버튼 */}
        <div style={{ display:"flex", gap:"10px" }}>
          {preview && (
            <button
              onClick={handleDelete}
              style={{
                flex:1, padding:"10px", border:"1px solid #fecaca",
                borderRadius:"12px", background:"#fff5f5", color:"#ef4444",
                fontSize:"13px", fontWeight:700, cursor:"pointer"
              }}
            >
              삭제
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!preview}
            style={{
              flex:2, padding:"10px", border:"none",
              borderRadius:"12px",
              background: saved ? "#10b981" : preview ? "#1d4ed8" : "#e2e8f0",
              color: preview ? "#fff" : "#94a3b8",
              fontSize:"13px", fontWeight:700,
              cursor: preview ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"6px"
            }}
          >
            {saved ? <><CheckCircle size={14} /> 저장됨!</> : "도장 저장"}
          </button>
        </div>

        <p style={{ fontSize:"11px", color:"#94a3b8", marginTop:"12px", textAlign:"center", lineHeight:1.6 }}>
          저장된 도장은 휴가 신청서 인쇄 시 자동으로 반영됩니다.
        </p>
      </div>
    </div>
  );
}
