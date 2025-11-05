import { BookingRepository } from '../repositories/BookingRepository';
import { DateRange } from '../value-objects/DateRange';


export class AvailabilityService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  public async isPropertyAvailable(
    propertyId: string, 
    dateRange: DateRange, 
    excludeBookingId?: string
  ): Promise<boolean> {
    const conflictingBookings = await this.bookingRepository.findConflicting(
      propertyId, 
      dateRange, 
      excludeBookingId
    );

    // Only consider paid bookings as conflicts
    const paidConflicts = conflictingBookings.filter(booking => booking.isPaid());
    
    return paidConflicts.length === 0;
  }

  public async hasRecentPendingBookings(
    propertyId: string, 
    dateRange: DateRange, 
    minutesThreshold: number = 15
  ): Promise<boolean> {
    const conflictingBookings = await this.bookingRepository.findConflicting(
      propertyId, 
      dateRange
    );

    const now = new Date();
    const thresholdTime = new Date(now.getTime() - minutesThreshold * 60 * 1000);

    const recentPendingBookings = conflictingBookings.filter(booking => 
      booking.isPending() && 
      booking.createdAt && 
      booking.createdAt >= thresholdTime
    );

    return recentPendingBookings.length > 0;
  }

  public async getUnavailableDates(propertyId: string): Promise<DateRange[]> {
    const bookings = await this.bookingRepository.findByPropertyId(propertyId);
    
    return bookings
      .filter(booking => booking.isPaid())
      .map(booking => booking.dateRange);
  }

  public async cleanupExpiredPendingBookings(): Promise<number> {
    return await this.bookingRepository.cleanupExpired();
  }
}