import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { TimeSlot, Doctor } from '../types';

interface Props {
  slot: TimeSlot;
  doctor: Doctor;
  patientName: string;
  onClose: () => void;
}

export default function BookingSuccessToast({ slot, doctor, patientName, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-white border border-green-200 rounded-2xl shadow-2xl p-4 w-80 flex gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">예약이 완료되었습니다!</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {patientName}님 / {doctor.name} {doctor.department}
          </p>
          <p className="text-xs text-blue-600 font-medium mt-1">
            {format(parseISO(slot.date), 'M월 d일 (E)', { locale: ko })} {slot.time}
          </p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg self-start">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
