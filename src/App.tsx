import { useState, useMemo, useCallback } from 'react';
import { Hospital, Settings, RotateCcw } from 'lucide-react';
import type { Message, AnalysisResult, TimeSlot } from './types';
import { DOCTORS, INITIAL_SLOTS } from './utils/scheduleData';
import { buildSystemPrompt } from './utils/systemPrompt';
import { useOpenRouter } from './hooks/useOpenRouter';
import ApiKeyModal from './components/ApiKeyModal';
import ChatPanel from './components/ChatPanel';
import SchedulePanel from './components/SchedulePanel';
import SuggestionPanel from './components/SuggestionPanel';
import BookingModal from './components/BookingModal';
import BookingSuccessToast from './components/BookingSuccessToast';

export default function App() {
  const [apiKey, setApiKey] = useState<string>(
    () => sessionStorage.getItem('or_key') ?? import.meta.env.VITE_OPENROUTER_API_KEY ?? '',
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>(INITIAL_SLOTS);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<TimeSlot | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ slot: TimeSlot; patientName: string } | null>(null);
  const [bookedSlotIds] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);

  const availableSlots = useMemo(
    () => slots.filter((s) => s.status === 'available'),
    [slots],
  );

  const systemPrompt = useMemo(
    () => buildSystemPrompt(DOCTORS, availableSlots),
    [availableSlots],
  );

  const { sendMessage, isLoading, error } = useOpenRouter({ apiKey, systemPrompt });

  const suggestedSlotIds = useMemo(
    () => new Set(analysis?.suggestedSlots ?? []),
    [analysis],
  );

  const handleApiKey = (key: string) => {
    sessionStorage.setItem('or_key', key);
    setApiKey(key);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    try {
      const reply = await sendMessage(nextMessages, (result) => {
        setAnalysis(result);
      });

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // error shown via hook
    }
  }, [input, isLoading, messages, sendMessage]);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlotId(slot.id);
    setBookingSlot(slot);
  };

  const handleBookingConfirm = (name: string, _phone: string, _memo: string) => {
    if (!bookingSlot) return;

    setSlots((prev) =>
      prev.map((s) => (s.id === bookingSlot.id ? { ...s, status: 'booked' } : s)),
    );
    bookedSlotIds.add(bookingSlot.id);
    setSuccessInfo({ slot: bookingSlot, patientName: name });
    setBookingSlot(null);
    setSelectedSlotId(null);
  };

  const handleReset = () => {
    setMessages([]);
    setAnalysis(null);
    setSelectedSlotId(null);
    setInput('');
  };

  const selectedDoctor = bookingSlot
    ? DOCTORS.find((d) => d.id === bookingSlot.doctorId) ?? DOCTORS[0]
    : DOCTORS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow">
              <Hospital className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight">진료 예약 관리 시스템</h1>
              <p className="text-[10px] text-gray-400 leading-tight">AI 기반 스마트 예약</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              API 키
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-4" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {/* Column 1: Chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <ChatPanel
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            error={error}
            analysis={analysis}
          />
        </div>

        {/* Column 2: Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <SchedulePanel
            doctors={DOCTORS}
            slots={slots}
            analysis={analysis}
            suggestedSlotIds={suggestedSlotIds}
            onSelectSlot={handleSelectSlot}
            selectedSlotId={selectedSlotId}
          />
        </div>

        {/* Column 3: AI Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <SuggestionPanel
            analysis={analysis}
            slots={slots}
            doctors={DOCTORS}
            onSelectSlot={handleSelectSlot}
            selectedSlotId={selectedSlotId}
            bookedSlotIds={bookedSlotIds}
          />
        </div>
      </main>

      {/* Modals & Toasts */}
      {(!apiKey || showSettings) && (
        <ApiKeyModal
          onSubmit={(k) => {
            handleApiKey(k);
            setShowSettings(false);
          }}
        />
      )}

      {bookingSlot && (
        <BookingModal
          slot={bookingSlot}
          doctor={selectedDoctor}
          onConfirm={handleBookingConfirm}
          onClose={() => {
            setBookingSlot(null);
            setSelectedSlotId(null);
          }}
        />
      )}

      {successInfo && (
        <BookingSuccessToast
          slot={successInfo.slot}
          doctor={DOCTORS.find((d) => d.id === successInfo.slot.doctorId) ?? DOCTORS[0]}
          patientName={successInfo.patientName}
          onClose={() => setSuccessInfo(null)}
        />
      )}
    </div>
  );
}
