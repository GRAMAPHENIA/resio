import { Booking } from '../entities/Booking';
import { Property } from '../entities/Property';
import { ContactInfo } from '../value-objects/ContactInfo';
import { DateRange } from '../value-objects/DateRange';
import { BookingStatus } from '../value-objects/BookingStatus';

export class BookingDomainService {
  public static createBooking(
    id: string,
    property: Property,
    contactInfo: ContactInfo,
    dateRange: DateRange,
    userId?: string
  ): Booking {
    if (!property.isAvailable()) {
      throw new Error('Property is not available for booking');
    }

    const nights = dateRange.getNights();
    const amount = property.calculateTotalPrice(nights);

    return new Booking(
      id,
      property.id,
      contactInfo,
      dateRange,
      amount,
      BookingStatus.pending(),
      undefined,
      userId,
      new Date()
    );
  }

  public static validateBookingModification(booking: Booking): void {
    if (booking.isCancelled()) {
      throw new Error('Cannot modify a cancelled booking');
    }

    if (booking.dateRange.isInPast()) {
      throw new Error('Cannot modify a booking in the past');
    }
  }

  public static calculateRefundAmount(booking: Booking): number {
    if (!booking.isPaid()) {
      return 0;
    }

    const now = new Date();
    const startDate = booking.dateRange.startDate;
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Refund policy: 
    // - More than 7 days: 100% refund
    // - 3-7 days: 50% refund
    // - Less than 3 days: No refund
    if (daysUntilStart > 7) {
      return booking.amount;
    } else if (daysUntilStart >= 3) {
      return booking.amount * 0.5;
    } else {
      return 0;
    }
  }

  public static canModifyDates(booking: Booking): boolean {
    if (booking.isCancelled()) {
      return false;
    }

    const now = new Date();
    const startDate = booking.dateRange.startDate;
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Allow date modification up to 3 days before check-in
    return daysUntilStart >= 3;
  }
}