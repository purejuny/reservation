import { useState } from 'react';
import { KeyRound, ExternalLink } from 'lucide-react';

interface Props {
  onSubmit: (key: string) => void;
}

export default function ApiKeyModal({ onSubmit }: Props) {
  const [key, setKey] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">OpenRouter API 키</h2>
            <p className="text-sm text-gray-500">시작하려면 API 키를 입력하세요</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          API 키는 브라우저 세션에만 저장되며 서버로 전송되지 않습니다.
        </p>

        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && key.trim() && onSubmit(key.trim())}
          placeholder="sk-or-..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        <button
          onClick={() => key.trim() && onSubmit(key.trim())}
          disabled={!key.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          시작하기
        </button>

        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 mt-4 text-xs text-blue-500 hover:text-blue-700"
        >
          OpenRouter에서 API 키 발급받기
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
