import { BookingRepository } from '../../domain/repositories/BookingRepository';
import { PropertyRepository } from '../../domain/repositories/PropertyRepository';
import { AvailabilityService } from '../../domain/services/AvailabilityService';
import { BookingService } from '../../application/services/BookingService';
import { SupabaseBookingRepository } from '../repositories/SupabaseBookingRepository';
import { SupabasePropertyRepository } from '../repositories/SupabasePropertyRepository';

export class Container {
  private static instance: Container;
  private services: Map<string, unknown> = new Map();

  private constructor() {
    this.registerServices();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerServices(): void {
    // Repositories
    this.services.set('BookingRepository', new SupabaseBookingRepository());
    this.services.set('PropertyRepository', new SupabasePropertyRepository());

    // Domain Services
    this.services.set('AvailabilityService', new AvailabilityService(
      this.get<BookingRepository>('BookingRepository')
    ));

    // Application Services
    this.services.set('BookingService', new BookingService(
      this.get<BookingRepository>('BookingRepository'),
      this.get<PropertyRepository>('PropertyRepository'),
      this.get<AvailabilityService>('AvailabilityService')
    ));
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  // Convenience methods for commonly used services
  public getBookingService(): BookingService {
    return this.get<BookingService>('BookingService');
  }

  public getBookingRepository(): BookingRepository {
    return this.get<BookingRepository>('BookingRepository');
  }

  public getPropertyRepository(): PropertyRepository {
    return this.get<PropertyRepository>('PropertyRepository');
  }

  public getAvailabilityService(): AvailabilityService {
    return this.get<AvailabilityService>('AvailabilityService');
  }
}