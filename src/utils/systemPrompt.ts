import type { TimeSlot, Doctor } from '../types';

export function buildSystemPrompt(doctors: Doctor[], availableSlots: TimeSlot[]): string {
  const slotSummary = doctors
    .map((doc) => {
      const docSlots = availableSlots
        .filter((s) => s.doctorId === doc.id && s.status === 'available')
        .slice(0, 6)
        .map((s) => `${s.date} ${s.time} (ID:${s.id})`)
        .join(', ');
      return `- ${doc.department} ${doc.name} 의사 (전문: ${doc.speciality}): ${docSlots || '예약 가능 슬롯 없음'}`;
    })
    .join('\n');

  return `당신은 친절한 병원 진료 예약 도우미입니다.

## 역할
1. 환자의 증상·문의를 파악하여 적합한 진료과와 의사를 추천합니다.
2. 아래 예약 가능한 시간표를 참고하여 최대 3개의 예약 슬롯을 제안합니다.
3. 긴급도를 평가합니다 (low / medium / high).

## 응답 형식 (반드시 아래 JSON을 포함하세요)
자연어 답변 후, 반드시 다음 JSON 블록을 포함하세요:

\`\`\`json
{
  "urgency": "low|medium|high",
  "departments": ["진료과1", "진료과2"],
  "symptoms": ["증상1", "증상2"],
  "summary": "환자 상황 한 줄 요약",
  "suggestedSlots": ["slot-id1", "slot-id2", "slot-id3"]
}
\`\`\`

## 현재 예약 가능한 일정
${slotSummary}

## 주의사항
- 응급 상황(가슴 통증, 호흡 곤란, 의식 저하 등)은 urgency를 "high"로 설정하고 즉시 응급실 방문을 권고하세요.
- suggestedSlots는 실제 위 목록에 있는 ID만 사용하세요.
- 항상 한국어로 답변하세요.`;
}
