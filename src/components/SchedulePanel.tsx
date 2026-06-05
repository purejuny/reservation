import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import type { Doctor, TimeSlot, AnalysisResult } from '../types';

interface Props {
  doctors: Doctor[];
  slots: TimeSlot[];
  analysis: AnalysisResult | null;
  suggestedSlotIds: Set<string>;
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlotId: string | null;
}

const DEPT_COLORS: Record<string, string> = {
  내과: 'bg-blue-100 text-blue-700',
  외과: 'bg-red-100 text-red-700',
  소아과: 'bg-yellow-100 text-yellow-700',
  정형외과: 'bg-purple-100 text-purple-700',
  피부과: 'bg-pink-100 text-pink-700',
  안과: 'bg-cyan-100 text-cyan-700',
  이비인후과: 'bg-green-100 text-green-700',
  신경과: 'bg-orange-100 text-orange-700',
  응급의학과: 'bg-red-200 text-red-800',
};

export default function SchedulePanel({
  doctors,
  slots,
  analysis,
  suggestedSlotIds,
  onSelectSlot,
  selectedSlotId,
}: Props) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id ?? '');
  const [dateOffset, setDateOffset] = useState(0);

  const availableDoctors = useMemo(() => {
    if (!analysis || analysis.departments.length === 0) return doctors;
    return doctors.filter((d) => analysis.departments.includes(d.department));
  }, [doctors, analysis]);

  const doctor = doctors.find((d) => d.id === selectedDoctorId) ?? doctors[0];

  const allDates = useMemo(() => {
    const dateSet = new Set(
      slots.filter((s) => s.doctorId === doctor?.id).map((s) => s.date),
    );
    return Array.from(dateSet).sort();
  }, [slots, doctor]);

  const visibleDates = allDates.slice(dateOffset, dateOffset + 5);

  const slotsByDate = useMemo(() => {
    const map: Record<string, TimeSlot[]> = {};
    visibleDates.forEach((d) => {
      map[d] = slots
        .filter((s) => s.doctorId === doctor?.id && s.date === d)
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [slots, doctor, visibleDates]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900 text-sm">예약 일정</h2>
          {analysis && (
            <span className="ml-auto text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              추천 진료과 필터 적용 중
            </span>
          )}
        </div>

        {/* Doctor selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {availableDoctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDoctorId(doc.id);
                setDateOffset(0);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedDoctorId === doc.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <span>{doc.avatar}</span>
              <span>{doc.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  selectedDoctorId === doc.id
                    ? 'bg-blue-500 text-white'
                    : DEPT_COLORS[doc.department] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {doc.department}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-50">
        <button
          onClick={() => setDateOffset(Math.max(0, dateOffset - 5))}
          disabled={dateOffset === 0}
          className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1 flex gap-1 overflow-hidden">
          {visibleDates.map((d) => (
            <div key={d} className="flex-1 text-center">
              <p className="text-[10px] text-gray-400">
                {format(parseISO(d), 'E', { locale: ko })}
              </p>
              <p className="text-xs font-semibold text-gray-700">
                {format(parseISO(d), 'M/d')}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setDateOffset(dateOffset + 5)}
          disabled={dateOffset + 5 >= allDates.length}
          className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Slots grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        {visibleDates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">예약 가능한 일정이 없습니다</p>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${visibleDates.length}, 1fr)` }}>
            {visibleDates.map((date) => (
              <div key={date} className="space-y-1.5">
                {(slotsByDate[date] ?? []).map((slot) => {
                  const isSuggested = suggestedSlotIds.has(slot.id);
                  const isSelected = selectedSlotId === slot.id;
                  const isBooked = slot.status === 'booked';

                  return (
                    <button
                      key={slot.id}
                      disabled={isBooked}
                      onClick={() => onSelectSlot(slot)}
                      className={`w-full flex flex-col items-center px-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all relative ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                          : isBooked
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                          : isSuggested
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {isSuggested && !isBooked && !isSelected && (
                        <Star className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                      )}
                      {isSelected && (
                        <CheckCircle2 className="w-2.5 h-2.5 absolute top-1 right-1" />
                      )}
                      <Clock className={`w-3 h-3 mb-0.5 ${isSelected ? 'text-white' : isBooked ? 'text-gray-300' : 'text-gray-400'}`} />
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block" />
          예약 가능
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" />
          AI 추천
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
          선택됨
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-gray-50 border border-gray-100 inline-block" />
          마감
        </div>
      </div>
    </div>
  );
}
