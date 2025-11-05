import { Booking } from '../../domain/entities/Booking';
import { Property } from '../../domain/entities/Property';
import { BookingRepository } from '../../domain/repositories/BookingRepository';
import { PropertyRepository } from '../../domain/repositories/PropertyRepository';
import { AvailabilityService } from '../../domain/services/AvailabilityService';
import { BookingDomainService } from '../../domain/services/BookingDomainService';
import { ContactInfo } from '../../domain/value-objects/ContactInfo';
import { DateRange } from '../../domain/value-objects/DateRange';

export interface CreateBookingRequest {
  propertyId: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  userId?: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  property: Property;
}

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly availabilityService: AvailabilityService
  ) {}

  public async execute(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    // 1. Validate input
    this.validateRequest(request);

    // 2. Clean up expired bookings first
    await this.availabilityService.cleanupExpiredPendingBookings();

    // 3. Get property
    const property = await this.propertyRepository.findById(request.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // 4. Create value objects
    const contactInfo = ContactInfo.create(
      request.contactInfo.name,
      request.contactInfo.email,
      request.contactInfo.phone
    );

    const dateRange = DateRange.fromStrings(
      request.dateRange.startDate,
      request.dateRange.endDate
    );

    // 5. Check availability
    const isAvailable = await this.availabilityService.isPropertyAvailable(
      request.propertyId,
      dateRange
    );

    if (!isAvailable) {
      throw new Error('Property is not available for the selected dates');
    }

    // 6. Check for recent pending bookings
    const hasRecentPending = await this.availabilityService.hasRecentPendingBookings(
      request.propertyId,
      dateRange
    );

    if (hasRecentPending) {
      throw new Error('There is a recent pending booking for these dates. Please try again in a few minutes.');
    }

    // 7. Create booking using domain service
    const bookingId = this.generateBookingId();
    const booking = BookingDomainService.createBooking(
      bookingId,
      property,
      contactInfo,
      dateRange,
      request.userId
    );

    // 8. Save booking
    const savedBooking = await this.bookingRepository.save(booking);

    return {
      booking: savedBooking,
      property
    };
  }

  private validateRequest(request: CreateBookingRequest): void {
    if (!request.propertyId?.trim()) {
      throw new Error('Property ID is required');
    }

    if (!request.contactInfo?.name?.trim()) {
      throw new Error('Contact name is required');
    }

    if (!request.contactInfo?.email?.trim()) {
      throw new Error('Contact email is required');
    }

    if (!request.dateRange?.startDate?.trim()) {
      throw new Error('Start date is required');
    }

    if (!request.dateRange?.endDate?.trim()) {
      throw new Error('End date is required');
    }
  }

  private generateBookingId(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}