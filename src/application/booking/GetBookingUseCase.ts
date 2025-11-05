import { Booking } from '../../domain/entities/Booking';
import { Property } from '../../domain/entities/Property';
import { BookingRepository } from '../../domain/repositories/BookingRepository';
import { PropertyRepository } from '../../domain/repositories/PropertyRepository';

export interface GetBookingRequest {
  bookingId: string;
}

export interface GetBookingResponse {
  booking: Booking;
  property: Property;
}

export class GetBookingUseCase {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  public async execute(request: GetBookingRequest): Promise<GetBookingResponse> {
    if (!request.bookingId?.trim()) {
      throw new Error('Booking ID is required');
    }

    const booking = await this.bookingRepository.findById(request.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const property = await this.propertyRepository.findById(booking.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    return {
      booking,
      property
    };
  }
}