export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  doctorName: string;
  specialty: string;
  status: 'Completada' | 'Urgente' | 'En espera' | 'Próxima';
  notes: string;
  calendarEventId?: string;
  userId: string;
  createdAt: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  photoUrl?: string;
  status: 'activo' | 'descanso' | 'fuera';
}

export interface ClinicNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  userId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}
