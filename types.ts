export interface Customer {
  id?: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  cnic_id: string;
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
  id?: number;
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
  id?: number;
  customer_id: number;
  room_id: number;
  customer_name?: string; // For display
  room_number?: string; // For display
  room_type?: string; // For display
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
  id?: number;
  booking_id: number;
  customer_name?: string; // For display
  amount: number;
  payment_date: string;
  payment_status: PaymentStatus;
}

export interface Employee {
  id: number;
  employee_name: string;
  department_name: string;
  position: string;
  phone: string;
  email: string;
  salary: number;
  hire_date: string;
  employee_status: 'Active' | 'Inactive';
}

export interface Stats {
  totalCustomers: number;
  totalRooms: number;
  availableRooms: number;
  totalBookings: number;
  totalEmployees: number;
  totalRevenue: number;
}
