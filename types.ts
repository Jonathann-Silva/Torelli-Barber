
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  emailVerified: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  icon: string;
}

export interface Barber {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  specialty?: string;
}

export enum AppointmentStatus {
  CONFIRMED = 'Confirmado',
  PENDING = 'Pendente',
  COMPLETED = 'Concluído',
  CANCELLED = 'Cancelado',
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO date string
  time: string;
  status: AppointmentStatus;
  price: number;
  clientAvatar?: string;
  barberAvatar?: string;
}

export interface Notification {
  id: string;
  recipientId: string; // 'admin' or specific userId
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}