import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { X, CalendarCheck, User, Phone, FileText } from 'lucide-react';
import type { TimeSlot, Doctor } from '../types';

interface Props {
  slot: TimeSlot;
  doctor: Doctor;
  onConfirm: (name: string, phone: string, memo: string) => void;
  onClose: () => void;
}

export default function BookingModal({ slot, doctor, onConfirm, onClose }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');

  const formatted = format(parseISO(slot.date), 'yyyy년 M월 d일 (E)', { locale: ko });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">예약 확정</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Appointment summary */}
        <div className="mx-6 my-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{doctor.avatar}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {doctor.department} {doctor.name} 의사
              </p>
              <p className="text-xs text-gray-500">{doctor.speciality}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-sm font-medium text-blue-800">{formatted}</p>
            <p className="text-lg font-bold text-blue-700">{slot.time}</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
              <User className="w-3.5 h-3.5" /> 환자 이름 <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
              <Phone className="w-3.5 h-3.5" /> 연락처 <span className="text-red-500">*</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
              <FileText className="w-3.5 h-3.5" /> 증상 메모 (선택)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="방문 이유나 증상을 간단히 적어주세요"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => name.trim() && phone.trim() && onConfirm(name, phone, memo)}
              disabled={!name.trim() || !phone.trim()}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              예약 확정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
