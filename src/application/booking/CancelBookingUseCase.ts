import { Booking } from '../../domain/entities/Booking';
import { BookingRepository } from '../../domain/repositories/BookingRepository';
import { BookingDomainService } from '../../domain/services/BookingDomainService';

export interface CancelBookingRequest {
  bookingId: string;
  reason?: string;
}

export interface CancelBookingResponse {
  booking: Booking;
  refundAmount: number;
}

export class CancelBookingUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  public async execute(request: CancelBookingRequest): Promise<CancelBookingResponse> {
    if (!request.bookingId?.trim()) {
      throw new Error('Booking ID is required');
    }

    const booking = await this.bookingRepository.findById(request.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.canBeCancelled()) {
      throw new Error('Booking cannot be cancelled');
    }

    // Calculate refund amount before cancellation
    const refundAmount = BookingDomainService.calculateRefundAmount(booking);

    // Cancel the booking
    const cancelledBooking = booking.cancel();
    const updatedBooking = await this.bookingRepository.update(cancelledBooking);

    return {
      booking: updatedBooking,
      refundAmount
    };
  }
}