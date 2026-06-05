import { useState, useCallback } from 'react';
import type { Message, AnalysisResult } from '../types';

interface UseOpenRouterOptions {
  apiKey: string;
  systemPrompt: string;
}

function parseAnalysis(content: string): AnalysisResult | null {
  try {
    const match = content.match(/```json\s*([\s\S]*?)```/);
    if (!match) return null;
    const parsed = JSON.parse(match[1]);
    if (parsed.urgency && parsed.departments && parsed.suggestedSlots) {
      return parsed as AnalysisResult;
    }
    return null;
  } catch {
    return null;
  }
}

export function useOpenRouter({ apiKey, systemPrompt }: UseOpenRouterOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      messages: Message[],
      onAnalysis: (result: AnalysisResult) => void,
    ): Promise<string> => {
      if (!apiKey) {
        throw new Error('OpenRouter API 키를 입력해주세요.');
      }

      setIsLoading(true);
      setError(null);

      const payload = {
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: false,
      };

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Medical Reservation System',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData?.error?.message ?? `API 오류 (${response.status})`,
          );
        }

        const data = await response.json();
        const content: string = data.choices?.[0]?.message?.content ?? '';

        const analysis = parseAnalysis(content);
        if (analysis) onAnalysis(analysis);

        return content;
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, systemPrompt],
  );

  return { sendMessage, isLoading, error };
}
