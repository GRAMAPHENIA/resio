import { Booking } from '../../domain/entities/Booking';
import { BookingRepository } from '../../domain/repositories/BookingRepository';

export interface CompletePaymentRequest {
  bookingId: string;
  paymentId: string;
}

export interface CompletePaymentResponse {
  booking: Booking;
}

export class CompletePaymentUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  public async execute(request: CompletePaymentRequest): Promise<CompletePaymentResponse> {
    if (!request.bookingId?.trim()) {
      throw new Error('Booking ID is required');
    }

    if (!request.paymentId?.trim()) {
      throw new Error('Payment ID is required');
    }

    const booking = await this.bookingRepository.findById(request.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.canCompletePayment()) {
      throw new Error('Payment cannot be completed for this booking');
    }

    const paidBooking = booking.markAsPaid(request.paymentId);
    const updatedBooking = await this.bookingRepository.update(paidBooking);

    return { booking: updatedBooking };
  }
}