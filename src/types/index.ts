export type Department =
  | '내과'
  | '외과'
  | '소아과'
  | '정형외과'
  | '피부과'
  | '안과'
  | '이비인후과'
  | '신경과'
  | '응급의학과';

export type AppointmentStatus = 'available' | 'booked' | 'selected';

export interface Doctor {
  id: string;
  name: string;
  department: Department;
  speciality: string;
  avatar: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AnalysisResult {
  urgency: 'low' | 'medium' | 'high';
  departments: Department[];
  symptoms: string[];
  summary: string;
  suggestedSlots: string[]; // TimeSlot ids
}

export interface BookingInfo {
  slotId: string;
  patientName: string;
  phone: string;
  memo: string;
}
