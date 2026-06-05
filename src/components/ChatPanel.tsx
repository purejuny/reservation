import { useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, AlertTriangle } from 'lucide-react';
import type { Message, AnalysisResult } from '../types';

interface Props {
  messages: Message[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  error: string | null;
  analysis: AnalysisResult | null;
}

const QUICK_PROMPTS = [
  '머리가 너무 아프고 어지럼증이 있어요',
  '기침과 콧물이 3일째 지속됩니다',
  '허리 통증이 심하고 다리까지 저려요',
  '아이가 열이 나고 식욕이 없어요',
];

function urgencyLabel(u: AnalysisResult['urgency']) {
  if (u === 'high') return { text: '긴급', cls: 'bg-red-100 text-red-700 border-red-200' };
  if (u === 'medium') return { text: '중등도', cls: 'bg-orange-100 text-orange-700 border-orange-200' };
  return { text: '일반', cls: 'bg-green-100 text-green-700 border-green-200' };
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';

  // Strip JSON block from assistant messages for display
  const displayContent = isUser
    ? msg.content
    : msg.content.replace(/```json[\s\S]*?```/g, '').trim();

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-600' : 'bg-white border-2 border-blue-200'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-blue-600" />
        )}
      </div>
      <div
        className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
        }`}
      >
        {displayContent}
      </div>
    </div>
  );
}

export default function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading,
  error,
  analysis,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">AI 예약 도우미</h2>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              온라인
            </p>
          </div>
          {analysis && (
            <div className="ml-auto">
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${urgencyLabel(analysis.urgency).cls}`}
              >
                {urgencyLabel(analysis.urgency).text}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
        {visibleMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">안녕하세요!</p>
            <p className="text-gray-500 text-sm mb-6">증상이나 불편하신 점을 말씀해 주시면<br />적합한 진료 예약을 도와드릴게요.</p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onInputChange(p);
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }}
                  className="text-left text-xs bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-3 py-2.5 rounded-xl text-gray-600 transition-colors"
                >
                  💬 {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="증상을 입력하세요... (Enter로 전송)"
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 scrollbar-thin"
          />
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">Shift+Enter로 줄 바꿈</p>
      </div>
    </div>
  );
}
