import { CreateBookingUseCase, CreateBookingRequest } from '../../../application/booking/CreateBookingUseCase'
import { BookingRepository } from '../../../domain/repositories/BookingRepository'
import { PropertyRepository } from '../../../domain/repositories/PropertyRepository'
import { AvailabilityService } from '../../../domain/services/AvailabilityService'
import { Property } from '../../../domain/entities/Property'
import { Booking } from '../../../domain/entities/Booking'
import { BookingStatus } from '../../../domain/value-objects/BookingStatus'
import { DateRange } from '../../../domain/value-objects/DateRange'
import { ContactInfo } from '../../../domain/value-objects/ContactInfo'

// Mock repositories and services
const mockBookingRepository: jest.Mocked<BookingRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUserId: jest.fn(),
  findByPropertyId: jest.fn(),
  findByStatus: jest.fn(),
  findConflicting: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  cleanupExpired: jest.fn(),
}

const mockPropertyRepository: jest.Mocked<PropertyRepository> = {
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  findByOwnerId: jest.fn(),
  findAvailable: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
}

const mockAvailabilityService: jest.Mocked<AvailabilityService> = {
  isPropertyAvailable: jest.fn(),
  hasRecentPendingBookings: jest.fn(),
  getUnavailableDates: jest.fn(),
  cleanupExpiredPendingBookings: jest.fn(),
}

describe('CreateBookingUseCase', () => {
  let useCase: CreateBookingUseCase
  let validRequest: CreateBookingRequest
  let mockProperty: Property

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    useCase = new CreateBookingUseCase(
      mockBookingRepository,
      mockPropertyRepository,
      mockAvailabilityService
    )

    validRequest = {
      propertyId: 'property-123',
      contactInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      dateRange: {
        startDate: '2024-12-01',
        endDate: '2024-12-05'
      },
      userId: 'user-456'
    }

    mockProperty = new Property(
      'property-123',
      'Test Property',
      'A nice property for testing',
      'Test Location',
      100,
      [],
      'owner-123',
      true,
      2,
      1,
      50
    )
  })

  describe('successful booking creation', () => {
    it('should create a booking successfully', async () => {
      // Arrange
      const expectedBooking = new Booking(
        'booking-123',
        'property-123',
        ContactInfo.create('John Doe', 'john@example.com', '+1234567890'),
        DateRange.fromStrings('2024-12-01', '2024-12-05'),
        400, // 4 nights * 100 per night
        BookingStatus.pending()
      )

      mockAvailabilityService.cleanupExpiredPendingBookings.mockResolvedValue(0)
      mockPropertyRepository.findById.mockResolvedValue(mockProperty)
      mockAvailabilityService.isPropertyAvailable.mockResolvedValue(true)
      mockAvailabilityService.hasRecentPendingBookings.mockResolvedValue(false)
      mockBookingRepository.save.mockResolvedValue(expectedBooking)

      // Act
      const result = await useCase.execute(validRequest)

      // Assert
      expect(result.booking).toBeDefined()
      expect(result.property).toBe(mockProperty)
      expect(result.booking.amount).toBe(400)
      expect(result.booking.isPending()).toBe(true)

      // Verify interactions
      expect(mockAvailabilityService.cleanupExpiredPendingBookings).toHaveBeenCalled()
      expect(mockPropertyRepository.findById).toHaveBeenCalledWith('property-123')
      expect(mockAvailabilityService.isPropertyAvailable).toHaveBeenCalled()
      expect(mockAvailabilityService.hasRecentPendingBookings).toHaveBeenCalled()
      expect(mockBookingRepository.save).toHaveBeenCalled()
    })
  })

  describe('validation errors', () => {
    it('should throw error for missing property ID', async () => {
      const invalidRequest = { ...validRequest, propertyId: '' }

      await expect(useCase.execute(invalidRequest)).rejects.toThrow('Property ID is required')
    })

    it('should throw error for missing contact name', async () => {
      const invalidRequest = { 
        ...validRequest, 
        contactInfo: { ...validRequest.contactInfo, name: '' }
      }

      await expect(useCase.execute(invalidRequest)).rejects.toThrow('Contact name is required')
    })

    it('should throw error for missing contact email', async () => {
      const invalidRequest = { 
        ...validRequest, 
        contactInfo: { ...validRequest.contactInfo, email: '' }
      }

      await expect(useCase.execute(invalidRequest)).rejects.toThrow('Contact email is required')
    })

    it('should throw error for missing start date', async () => {
      const invalidRequest = { 
        ...validRequest, 
        dateRange: { ...validRequest.dateRange, startDate: '' }
      }

      await expect(useCase.execute(invalidRequest)).rejects.toThrow('Start date is required')
    })

    it('should throw error for missing end date', async () => {
      const invalidRequest = { 
        ...validRequest, 
        dateRange: { ...validRequest.dateRange, endDate: '' }
      }

      await expect(useCase.execute(invalidRequest)).rejects.toThrow('End date is required')
    })
  })

  describe('business rule violations', () => {
    beforeEach(() => {
      mockAvailabilityService.cleanupExpiredPendingBookings.mockResolvedValue(0)
    })

    it('should throw error when property is not found', async () => {
      mockPropertyRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute(validRequest)).rejects.toThrow('Property not found')
    })

    it('should throw error when property is not available', async () => {
      mockPropertyRepository.findById.mockResolvedValue(mockProperty)
      mockAvailabilityService.isPropertyAvailable.mockResolvedValue(false)

      await expect(useCase.execute(validRequest)).rejects.toThrow('Property is not available for the selected dates')
    })

    it('should throw error when there are recent pending bookings', async () => {
      mockPropertyRepository.findById.mockResolvedValue(mockProperty)
      mockAvailabilityService.isPropertyAvailable.mockResolvedValue(true)
      mockAvailabilityService.hasRecentPendingBookings.mockResolvedValue(true)

      await expect(useCase.execute(validRequest)).rejects.toThrow('There is a recent pending booking for these dates')
    })
  })

  describe('repository errors', () => {
    beforeEach(() => {
      mockAvailabilityService.cleanupExpiredPendingBookings.mockResolvedValue(0)
      mockPropertyRepository.findById.mockResolvedValue(mockProperty)
      mockAvailabilityService.isPropertyAvailable.mockResolvedValue(true)
      mockAvailabilityService.hasRecentPendingBookings.mockResolvedValue(false)
    })

    it('should propagate repository save errors', async () => {
      mockBookingRepository.save.mockRejectedValue(new Error('Database error'))

      await expect(useCase.execute(validRequest)).rejects.toThrow('Database error')
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      mockAvailabilityService.cleanupExpiredPendingBookings.mockResolvedValue(0)
      mockPropertyRepository.findById.mockResolvedValue(mockProperty)
      mockAvailabilityService.isPropertyAvailable.mockResolvedValue(true)
      mockAvailabilityService.hasRecentPendingBookings.mockResolvedValue(false)
    })

    it('should handle booking without user ID', async () => {
      const requestWithoutUserId = { ...validRequest, userId: undefined }
      
      const expectedBooking = new Booking(
        'booking-123',
        'property-123',
        ContactInfo.create('John Doe', 'john@example.com', '+1234567890'),
        DateRange.fromStrings('2024-12-01', '2024-12-05'),
        400,
        BookingStatus.pending()
      )

      mockBookingRepository.save.mockResolvedValue(expectedBooking)

      const result = await useCase.execute(requestWithoutUserId)

      expect(result.booking).toBeDefined()
      expect(mockBookingRepository.save).toHaveBeenCalled()
    })

    it('should handle booking without phone number', async () => {
      const requestWithoutPhone = { 
        ...validRequest, 
        contactInfo: { ...validRequest.contactInfo, phone: undefined }
      }
      
      const expectedBooking = new Booking(
        'booking-123',
        'property-123',
        ContactInfo.create('John Doe', 'john@example.com'),
        DateRange.fromStrings('2024-12-01', '2024-12-05'),
        400,
        BookingStatus.pending()
      )

      mockBookingRepository.save.mockResolvedValue(expectedBooking)

      const result = await useCase.execute(requestWithoutPhone)

      expect(result.booking).toBeDefined()
      expect(mockBookingRepository.save).toHaveBeenCalled()
    })
  })
})