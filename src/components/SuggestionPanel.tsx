import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Sparkles, Clock, MapPin, AlertCircle, ChevronRight } from 'lucide-react';
import type { AnalysisResult, TimeSlot, Doctor } from '../types';

interface Props {
  analysis: AnalysisResult | null;
  slots: TimeSlot[];
  doctors: Doctor[];
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlotId: string | null;
  bookedSlotIds: Set<string>;
}

const URGENCY_CONFIG = {
  low: { label: '일반 진료', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: '✅' },
  medium: { label: '빠른 진료 권장', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: '⚡' },
  high: { label: '긴급 진료 필요', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: '🚨' },
};

export default function SuggestionPanel({
  analysis,
  slots,
  doctors,
  onSelectSlot,
  selectedSlotId,
  bookedSlotIds,
}: Props) {
  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-3">
          <Sparkles className="w-7 h-7 text-purple-500" />
        </div>
        <p className="text-gray-600 font-semibold text-sm">AI 예약 제안</p>
        <p className="text-gray-400 text-xs mt-1">
          증상을 입력하면 AI가<br />최적의 진료 시간을 제안해드려요
        </p>
      </div>
    );
  }

  const urgency = URGENCY_CONFIG[analysis.urgency];
  const suggestedSlots = analysis.suggestedSlots
    .map((id) => slots.find((s) => s.id === id))
    .filter(Boolean) as TimeSlot[];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="font-bold text-gray-900 text-sm">AI 예약 제안</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
        {/* Urgency banner */}
        <div className={`rounded-xl px-3 py-2.5 border ${urgency.bg}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{urgency.icon}</span>
            <div>
              <p className={`text-xs font-bold ${urgency.color}`}>{urgency.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{analysis.summary}</p>
            </div>
          </div>
        </div>

        {/* High urgency warning */}
        {analysis.urgency === 'high' && (
          <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">
              응급 상황일 수 있습니다. 즉시 응급실을 방문하거나 119에 연락하세요.
            </p>
          </div>
        )}

        {/* Symptoms */}
        {analysis.symptoms.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">인식된 증상</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.symptoms.map((s) => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Departments */}
        {analysis.departments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">추천 진료과</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.departments.map((d) => (
                <span key={d} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested slots */}
        {suggestedSlots.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">추천 예약 시간</p>
            <div className="space-y-2">
              {suggestedSlots.map((slot, idx) => {
                const doctor = doctors.find((d) => d.id === slot.doctorId);
                const isSelected = selectedSlotId === slot.id;
                const isBooked = bookedSlotIds.has(slot.id) || slot.status === 'booked';

                return (
                  <button
                    key={slot.id}
                    onClick={() => !isBooked && onSelectSlot(slot)}
                    disabled={isBooked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isBooked
                        ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isSelected ? 'bg-blue-500' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isSelected ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {doctor?.avatar} {doctor?.name} ({doctor?.department})
                      </p>
                      <div className={`flex items-center gap-2 mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        <span className="text-[10px] flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(slot.date), 'M/d(E)', { locale: ko })} {slot.time}
                        </span>
                      </div>
                    </div>
                    {!isBooked && <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />}
                    {isBooked && <span className="text-[10px] text-gray-400 flex-shrink-0">마감</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
