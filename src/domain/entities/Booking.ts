import { BookingStatus } from '../value-objects/BookingStatus';
import { DateRange } from '../value-objects/DateRange';
import { ContactInfo } from '../value-objects/ContactInfo';

export class Booking {
  constructor(
    public readonly id: string,
    public readonly propertyId: string,
    public readonly contactInfo: ContactInfo,
    public readonly dateRange: DateRange,
    public readonly amount: number,
    public readonly status: BookingStatus,
    public readonly paymentId?: string,
    public readonly userId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateBooking();
  }

  private validateBooking(): void {
    if (!this.propertyId.trim()) {
      throw new Error('Property ID is required');
    }
    if (this.amount <= 0) {
      throw new Error('Booking amount must be greater than 0');
    }
  }

  public isPaid(): boolean {
    return this.status.isPaid();
  }

  public isPending(): boolean {
    return this.status.isPending();
  }

  public isCancelled(): boolean {
    return this.status.isCancelled();
  }

  public canBeCancelled(): boolean {
    return this.status.canBeCancelled() && this.dateRange.isInFuture();
  }

  public canCompletePayment(): boolean {
    return this.status.isPending() && this.dateRange.isInFuture();
  }

  public getNights(): number {
    return this.dateRange.getNights();
  }

  public getBookingCode(): string {
    return this.id.substring(0, 8).toUpperCase();
  }

  public markAsPaid(paymentId: string): Booking {
    return new Booking(
      this.id,
      this.propertyId,
      this.contactInfo,
      this.dateRange,
      this.amount,
      BookingStatus.paid(),
      paymentId,
      this.userId,
      this.createdAt,
      new Date()
    );
  }

  public cancel(): Booking {
    if (!this.canBeCancelled()) {
      throw new Error('Booking cannot be cancelled');
    }

    return new Booking(
      this.id,
      this.propertyId,
      this.contactInfo,
      this.dateRange,
      this.amount,
      BookingStatus.cancelled(),
      this.paymentId,
      this.userId,
      this.createdAt,
      new Date()
    );
  }
}