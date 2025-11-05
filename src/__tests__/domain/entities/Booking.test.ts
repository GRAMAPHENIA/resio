import { Booking } from '../../../domain/entities/Booking'
import { BookingStatus } from '../../../domain/value-objects/BookingStatus'
import { DateRange } from '../../../domain/value-objects/DateRange'
import { ContactInfo } from '../../../domain/value-objects/ContactInfo'

describe('Booking Entity', () => {
  const createValidBooking = () => {
    const contactInfo = ContactInfo.create('John Doe', 'john@example.com', '+1234567890')
    const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
    
    return new Booking(
      'booking-123',
      'property-456',
      contactInfo,
      dateRange,
      1000,
      BookingStatus.pending(),
      undefined,
      'user-789',
      new Date()
    )
  }

  describe('constructor', () => {
    it('should create a valid booking', () => {
      const booking = createValidBooking()
      
      expect(booking.id).toBe('booking-123')
      expect(booking.propertyId).toBe('property-456')
      expect(booking.amount).toBe(1000)
      expect(booking.status.isPending()).toBe(true)
    })

    it('should throw error for empty property ID', () => {
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      
      expect(() => {
        new Booking(
          'booking-123',
          '', // Empty property ID
          contactInfo,
          dateRange,
          1000,
          BookingStatus.pending()
        )
      }).toThrow('Property ID is required')
    })

    it('should throw error for negative amount', () => {
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      
      expect(() => {
        new Booking(
          'booking-123',
          'property-456',
          contactInfo,
          dateRange,
          -100, // Negative amount
          BookingStatus.pending()
        )
      }).toThrow('Booking amount must be greater than 0')
    })
  })

  describe('status methods', () => {
    it('should correctly identify paid status', () => {
      const booking = createValidBooking()
      const paidBooking = booking.markAsPaid('payment-123')
      
      expect(paidBooking.isPaid()).toBe(true)
      expect(paidBooking.isPending()).toBe(false)
      expect(paidBooking.isCancelled()).toBe(false)
    })

    it('should correctly identify cancelled status', () => {
      // Create a future booking that can be cancelled
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = new DateRange(futureDate, new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000))
      
      const booking = new Booking(
        'booking-123',
        'property-456',
        contactInfo,
        dateRange,
        1000,
        BookingStatus.pending()
      )
      
      const cancelledBooking = booking.cancel()
      
      expect(cancelledBooking.isCancelled()).toBe(true)
      expect(cancelledBooking.isPaid()).toBe(false)
      expect(cancelledBooking.isPending()).toBe(false)
    })
  })

  describe('business logic', () => {
    it('should calculate nights correctly', () => {
      const booking = createValidBooking()
      
      expect(booking.getNights()).toBe(4) // Dec 1-5 = 4 nights
    })

    it('should generate booking code correctly', () => {
      const booking = createValidBooking()
      
      const code = booking.getBookingCode()
      expect(code.length).toBe(8)
      expect(code).toBe('BOOKING-') // Based on the ID 'booking-123'
    })

    it('should allow cancellation for future bookings', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = new DateRange(futureDate, new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000))
      
      const booking = new Booking(
        'booking-123',
        'property-456',
        contactInfo,
        dateRange,
        1000,
        BookingStatus.paid()
      )
      
      expect(booking.canBeCancelled()).toBe(true)
    })

    it('should not allow cancellation for past bookings', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30)
      
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = new DateRange(pastDate, new Date(pastDate.getTime() + 4 * 24 * 60 * 60 * 1000))
      
      const booking = new Booking(
        'booking-123',
        'property-456',
        contactInfo,
        dateRange,
        1000,
        BookingStatus.paid()
      )
      
      expect(booking.canBeCancelled()).toBe(false)
    })

    it('should allow payment completion for pending future bookings', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)
      
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = new DateRange(futureDate, new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000))
      
      const booking = new Booking(
        'booking-123',
        'property-456',
        contactInfo,
        dateRange,
        1000,
        BookingStatus.pending()
      )
      
      expect(booking.canCompletePayment()).toBe(true)
    })
  })

  describe('markAsPaid', () => {
    it('should update status and payment ID', () => {
      const booking = createValidBooking()
      const paidBooking = booking.markAsPaid('payment-123')
      
      expect(paidBooking.isPaid()).toBe(true)
      expect(paidBooking.paymentId).toBe('payment-123')
      expect(paidBooking.updatedAt).toBeDefined()
    })

    it('should preserve other properties', () => {
      const booking = createValidBooking()
      const paidBooking = booking.markAsPaid('payment-123')
      
      expect(paidBooking.id).toBe(booking.id)
      expect(paidBooking.propertyId).toBe(booking.propertyId)
      expect(paidBooking.amount).toBe(booking.amount)
      expect(paidBooking.contactInfo).toBe(booking.contactInfo)
      expect(paidBooking.dateRange).toBe(booking.dateRange)
    })
  })

  describe('cancel', () => {
    it('should update status to cancelled', () => {
      // Create a future booking that can be cancelled
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = new DateRange(futureDate, new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000))
      
      const booking = new Booking(
        'booking-123',
        'property-456',
        contactInfo,
        dateRange,
        1000,
        BookingStatus.pending()
      )
      
      const cancelledBooking = booking.cancel()
      
      expect(cancelledBooking.isCancelled()).toBe(true)
      expect(cancelledBooking.updatedAt).toBeDefined()
    })

    it('should throw error if booking cannot be cancelled', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30)
      
      const contactInfo = ContactInfo.create('John Doe', 'john@example.com')
      const dateRange = new DateRange(pastDate, new Date(pastDate.getTime() + 4 * 24 * 60 * 60 * 1000))
      
      const booking = new Booking(
        'booking-123',
        'property-456',
        contactInfo,
        dateRange,
        1000,
        BookingStatus.paid()
      )
      
      expect(() => booking.cancel()).toThrow('Booking cannot be cancelled')
    })
  })
})