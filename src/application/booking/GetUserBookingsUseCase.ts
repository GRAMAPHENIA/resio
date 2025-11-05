import { Booking } from '../../domain/entities/Booking';
import { BookingRepository } from '../../domain/repositories/BookingRepository';
import { Email } from '../../domain/value-objects/Email';

export interface GetUserBookingsRequest {
  email?: string;
  userId?: string;
}

export interface GetUserBookingsResponse {
  bookings: Booking[];
}

export class GetUserBookingsUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  public async execute(request: GetUserBookingsRequest): Promise<GetUserBookingsResponse> {
    if (!request.email && !request.userId) {
      throw new Error('Either email or user ID is required');
    }

    let bookings: Booking[];

    if (request.userId) {
      bookings = await this.bookingRepository.findByUserId(request.userId);
    } else if (request.email) {
      const email = Email.create(request.email);
      bookings = await this.bookingRepository.findByEmail(email.getValue());
    } else {
      bookings = [];
    }

    return { bookings };
  }
}