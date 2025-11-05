import { Booking } from '../entities/Booking';
import { DateRange } from '../value-objects/DateRange';
import { BookingStatus } from '../value-objects/BookingStatus';

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByEmail(email: string): Promise<Booking[]>;
  findByUserId(userId: string): Promise<Booking[]>;
  findByPropertyId(propertyId: string): Promise<Booking[]>;
  findByStatus(status: BookingStatus): Promise<Booking[]>;
  findConflicting(propertyId: string, dateRange: DateRange, excludeId?: string): Promise<Booking[]>;
  save(booking: Booking): Promise<Booking>;
  update(booking: Booking): Promise<Booking>;
  delete(id: string): Promise<void>;
  cleanupExpired(): Promise<number>;
}