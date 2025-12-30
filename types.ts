export interface Customer {
  customer_id?: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  id: string; // Corresponds to CNIC/National ID based on prompt
}

export enum RoomType {
  SINGLE = 'Single',
  DOUBLE = 'Double',
  DELUXE = 'Deluxe',
  SUITE = 'Suite',
  PRESIDENTIAL = 'Presidential Suite',
  FAMILY = 'Family Suite'
}

export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  MAINTENANCE = 'Maintenance'
}

export interface Room {
  room_id?: number;
  room_number: string;
  room_type: RoomType;
  floor_number: number;
  price_per_night: number;
  room_status: RoomStatus;
}

export enum BookingStatus {
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Booking {
  booking_id?: number;
  customer_id: number;
  room_id: number;
  // Optional display fields often joined by backend or mapped in frontend
  customer_name?: string; 
  room_number?: string;
  
  booking_date?: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_amount: number;
  booking_status: BookingStatus;
}

export enum PaymentStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  REFUNDED = 'Refunded'
}

export interface Payment {
  payment_id?: number;
  booking_id: number;
  customer_name?: string; // For display
  amount: number;
  payment_date: string;
  payment_status: PaymentStatus;
}

export interface Department {
  department_id: number;
  department_name: string;
}

export interface Employee {
  employee_id: number;
  employee_name: string;
  department_id: number;
  department_name?: string; // Optional if joined
  email: string;
  phone: string;
  position: string;
  salary: number;
  hire_date: string;
  employee_status: string;
}

export interface Stats {
  totalCustomers: number;
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  totalEmployees: number;
  totalRevenue: number;
}