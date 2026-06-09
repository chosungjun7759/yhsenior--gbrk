/**
 * HandoverForm.tsx
 */
import { useState } from "react";
import { HandoverItem } from "../types";
import { Plus, Trash2 } from "lucide-react";

interface HandoverFormProps {
  userName: string;
  startDate: string;
  endDate: string;
  initialData?: {
    items: HandoverItem[];
    date: string;
    period: string;
    to: string;
    confirmer: string;
  };
  onChange: (data: {
    handoverItems: HandoverItem[];
    handoverDate: string;
    handoverPeriod: string;
    handoverFrom: string;
    handoverTo: string;
    handoverConfirmer: string;
  }) => void;
}

function newItem(): HandoverItem {
  return { id: Date.now().toString(), task: "", content: "", note: "" };
}

export default function HandoverForm({
  userName, startDate, endDate, initialData, onChange
}: HandoverFormProps) {
  const [items, setItems] = useState<HandoverItem[]>(
    initialData?.items?.length ? initialData.items : [newItem()]
  );
  const [date, setDate] = useState(initialData?.date ?? startDate ?? "");
  const [periodFrom, setPeriodFrom] = useState(
    initialData?.period?.split(" ~ ")[0] ?? startDate ?? ""
  );
  const [periodTo, setPeriodTo] = useState(
    initialData?.period?.split(" ~ ")[1] ?? endDate ?? ""
  );
  const [to, setTo] = useState(initialData?.to ?? "");
  const [confirmer, setConfirmer] = useState(initialData?.confirmer ?? "");

  const notify = (
    newItems = items,
    newDate = date,
    newFrom = periodFrom,
    newTo2 = periodTo,
    newTo = to,
    newConfirmer = confirmer
  ) => {
    onChange({
      handoverItems: newItems,
      handoverDate: newDate,
      handoverPeriod: newFrom && newTo2 ? `${newFrom} ~ ${newTo2}` : newFrom,
      handoverFrom: userName,
      handoverTo: newTo,
      handoverConfirmer: newConfirmer,
    });
  };

  const updateItem = (id: string, field: keyof HandoverItem, value: string) => {
    const updated = items.map(it => it.id === id ? { ...it, [field]: value } : it);
    setItems(updated);
    notify(updated, date, periodFrom, periodTo, to, confirmer);
  };

  const addItem = () => {
    const updated = [...items, newItem()];
    setItems(updated);
    notify(updated, date, periodFrom, periodTo, to, confirmer);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    notify(updated, date, periodFrom, periodTo, to, confirmer);
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">인수인계 날짜</label>
          <input type="date" value={date}
            onChange={e => { setDate(e.target.value); notify(items, e.target.value, periodFrom, periodTo, to, confirmer); }}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">인계 기간 (시작)</label>
          <input type="date" value={periodFrom}
            onChange={e => { setPeriodFrom(e.target.value); notify(items, date, e.target.value, periodTo, to, confirmer); }}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">인계 기간 (종료)</label>
          <input type="date" value={periodTo}
            onChange={e => { setPeriodTo(e.target.value); notify(items, date, periodFrom, e.target.value, to, confirmer); }}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">인계자</label>
          <input type="text" value={userName} readOnly
            className={`${inputCls} bg-slate-50 text-slate-400`} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">인수자 *</label>
          <input type="text" value={to}
            onChange={e => { setTo(e.target.value); notify(items, date, periodFrom, periodTo, e.target.value, confirmer); }}
            placeholder="인수자 성명" className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-1.5">확인자</label>
          <input type="text" value={confirmer}
            onChange={e => { setConfirmer(e.target.value); notify(items, date, periodFrom, periodTo, to, e.target.value); }}
            placeholder="확인자 성명 (예: 김효영 과장)" className={inputCls} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-500">업무 인수인계 내역</label>
          <button onClick={addItem}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer">
            <Plus size={12} /> 행 추가
          </button>
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_3fr_1.5fr_32px] bg-slate-50 border-b border-slate-200">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-500 border-r border-slate-200">업무명</div>
            <div className="px-3 py-2 text-[11px] font-bold text-slate-500 border-r border-slate-200">주요 내용</div>
            <div className="px-3 py-2 text-[11px] font-bold text-slate-500 border-r border-slate-200">비고</div>
            <div></div>
          </div>
          {items.map((item, idx) => (
            <div key={item.id} className={`grid grid-cols-[2fr_3fr_1.5fr_32px] border-b border-slate-100 last:border-0 ${idx%2===0?"bg-white":"bg-slate-50/30"}`}>
              <div className="border-r border-slate-100">
                <input type="text" value={item.task}
                  onChange={e => updateItem(item.id, "task", e.target.value)}
                  placeholder="업무명"
                  className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none focus:bg-blue-50/30" />
              </div>
              <div className="border-r border-slate-100">
                <textarea value={item.content}
                  onChange={e => updateItem(item.id, "content", e.target.value)}
                  placeholder="주요 내용을 입력하세요" rows={2}
                  className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none focus:bg-blue-50/30 resize-none" />
              </div>
              <div className="border-r border-slate-100">
                <input type="text" value={item.note}
                  onChange={e => updateItem(item.id, "note", e.target.value)}
                  placeholder="비고"
                  className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none focus:bg-blue-50/30" />
              </div>
              <div className="flex items-center justify-center">
                <button onClick={() => removeItem(item.id)} disabled={items.length === 1}
                  className="p-1 text-slate-300 hover:text-red-400 disabled:opacity-20 cursor-pointer transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-slate-400">※ 업무명과 주요 내용은 담당 업무에 맞게 직접 작성해 주세요.</p>
    </div>
  );
}
