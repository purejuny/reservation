import { addDays, format } from 'date-fns';
import type { Doctor, TimeSlot } from '../types';

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: '김민준', department: '내과', speciality: '소화기·호흡기', avatar: '👨‍⚕️' },
  { id: 'd2', name: '이서연', department: '외과', speciality: '복부·유방', avatar: '👩‍⚕️' },
  { id: 'd3', name: '박지호', department: '소아과', speciality: '소아 일반', avatar: '👨‍⚕️' },
  { id: 'd4', name: '최유나', department: '정형외과', speciality: '척추·관절', avatar: '👩‍⚕️' },
  { id: 'd5', name: '정우성', department: '피부과', speciality: '알레르기·피부염', avatar: '👨‍⚕️' },
  { id: 'd6', name: '한소희', department: '안과', speciality: '시력교정·망막', avatar: '👩‍⚕️' },
  { id: 'd7', name: '오준서', department: '이비인후과', speciality: '비염·인후염', avatar: '👨‍⚕️' },
  { id: 'd8', name: '윤아름', department: '신경과', speciality: '두통·어지럼증', avatar: '👩‍⚕️' },
];

const MORNING_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const AFTERNOON_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

let slotCounter = 0;

function generateSlotsForDoctor(doctor: Doctor, daysAhead: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();

  for (let d = 1; d <= daysAhead; d++) {
    const date = addDays(today, d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // 주말 제외

    const allTimes = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];
    allTimes.forEach((time) => {
      const isBooked = Math.random() < 0.45; // 45% 예약됨
      slots.push({
        id: `slot-${++slotCounter}`,
        doctorId: doctor.id,
        date: format(date, 'yyyy-MM-dd'),
        time,
        status: isBooked ? 'booked' : 'available',
      });
    });
  }
  return slots;
}

export function generateAllSlots(): TimeSlot[] {
  slotCounter = 0;
  return DOCTORS.flatMap((doc) => generateSlotsForDoctor(doc, 14));
}

export const INITIAL_SLOTS = generateAllSlots();
