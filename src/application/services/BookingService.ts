import { CreateBookingUseCase, CreateBookingRequest, CreateBookingResponse } from '../booking/CreateBookingUseCase';
import { GetBookingUseCase, GetBookingRequest, GetBookingResponse } from '../booking/GetBookingUseCase';
import { GetUserBookingsUseCase, GetUserBookingsRequest, GetUserBookingsResponse } from '../booking/GetUserBookingsUseCase';
import { CompletePaymentUseCase, CompletePaymentRequest, CompletePaymentResponse } from '../booking/CompletePaymentUseCase';
import { CancelBookingUseCase, CancelBookingRequest, CancelBookingResponse } from '../booking/CancelBookingUseCase';
import { BookingRepository } from '../../domain/repositories/BookingRepository';
import { PropertyRepository } from '../../domain/repositories/PropertyRepository';
import { AvailabilityService } from '../../domain/services/AvailabilityService';

export class BookingService {
  private readonly createBookingUseCase: CreateBookingUseCase;
  private readonly getBookingUseCase: GetBookingUseCase;
  private readonly getUserBookingsUseCase: GetUserBookingsUseCase;
  private readonly completePaymentUseCase: CompletePaymentUseCase;
  private readonly cancelBookingUseCase: CancelBookingUseCase;

  constructor(
    bookingRepository: BookingRepository,
    propertyRepository: PropertyRepository,
    availabilityService: AvailabilityService
  ) {
    this.createBookingUseCase = new CreateBookingUseCase(
      bookingRepository,
      propertyRepository,
      availabilityService
    );
    this.getBookingUseCase = new GetBookingUseCase(
      bookingRepository,
      propertyRepository
    );
    this.getUserBookingsUseCase = new GetUserBookingsUseCase(bookingRepository);
    this.completePaymentUseCase = new CompletePaymentUseCase(bookingRepository);
    this.cancelBookingUseCase = new CancelBookingUseCase(bookingRepository);
  }

  public async createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    return await this.createBookingUseCase.execute(request);
  }

  public async getBooking(request: GetBookingRequest): Promise<GetBookingResponse> {
    return await this.getBookingUseCase.execute(request);
  }

  public async getUserBookings(request: GetUserBookingsRequest): Promise<GetUserBookingsResponse> {
    return await this.getUserBookingsUseCase.execute(request);
  }

  public async completePayment(request: CompletePaymentRequest): Promise<CompletePaymentResponse> {
    return await this.completePaymentUseCase.execute(request);
  }

  public async cancelBooking(request: CancelBookingRequest): Promise<CancelBookingResponse> {
    return await this.cancelBookingUseCase.execute(request);
  }
}