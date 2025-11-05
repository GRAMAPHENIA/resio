import { DateRange } from '../../../domain/value-objects/DateRange'

describe('DateRange Value Object', () => {
  describe('constructor', () => {
    it('should create a valid date range', () => {
      const startDate = new Date('2024-12-01')
      const endDate = new Date('2024-12-05')
      
      const dateRange = new DateRange(startDate, endDate)
      
      expect(dateRange.startDate).toEqual(startDate)
      expect(dateRange.endDate).toEqual(endDate)
    })

    it('should throw error if end date is before start date', () => {
      const startDate = new Date('2024-12-05')
      const endDate = new Date('2024-12-01')
      
      expect(() => {
        new DateRange(startDate, endDate)
      }).toThrow('End date must be after start date')
    })

    it('should throw error if start and end dates are the same', () => {
      const date = new Date('2024-12-01')
      
      expect(() => {
        new DateRange(date, date)
      }).toThrow('End date must be after start date')
    })
  })

  describe('fromStrings', () => {
    it('should create date range from valid string dates', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      
      expect(dateRange.startDate).toEqual(new Date('2024-12-01'))
      expect(dateRange.endDate).toEqual(new Date('2024-12-05'))
    })

    it('should throw error for invalid date strings', () => {
      expect(() => {
        DateRange.fromStrings('invalid-date', '2024-12-05')
      }).toThrow('Invalid date format')
    })
  })

  describe('getNights', () => {
    it('should calculate nights correctly for same month', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      
      expect(dateRange.getNights()).toBe(4)
    })

    it('should calculate nights correctly across months', () => {
      const dateRange = DateRange.fromStrings('2024-11-30', '2024-12-03')
      
      expect(dateRange.getNights()).toBe(3)
    })

    it('should calculate nights correctly for one night', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-02')
      
      expect(dateRange.getNights()).toBe(1)
    })
  })

  describe('time-based methods', () => {
    it('should identify future date ranges', () => {
      const futureStart = new Date()
      futureStart.setDate(futureStart.getDate() + 10)
      const futureEnd = new Date()
      futureEnd.setDate(futureEnd.getDate() + 15)
      
      const dateRange = new DateRange(futureStart, futureEnd)
      
      expect(dateRange.isInFuture()).toBe(true)
      expect(dateRange.isInPast()).toBe(false)
    })

    it('should identify past date ranges', () => {
      const pastStart = new Date()
      pastStart.setDate(pastStart.getDate() - 15)
      const pastEnd = new Date()
      pastEnd.setDate(pastEnd.getDate() - 10)
      
      const dateRange = new DateRange(pastStart, pastEnd)
      
      expect(dateRange.isInPast()).toBe(true)
      expect(dateRange.isInFuture()).toBe(false)
    })

    it('should identify current date ranges', () => {
      const pastStart = new Date()
      pastStart.setDate(pastStart.getDate() - 2)
      const futureEnd = new Date()
      futureEnd.setDate(futureEnd.getDate() + 2)
      
      const dateRange = new DateRange(pastStart, futureEnd)
      
      expect(dateRange.isCurrent()).toBe(true)
    })
  })

  describe('overlaps', () => {
    it('should detect overlapping ranges', () => {
      const range1 = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const range2 = DateRange.fromStrings('2024-12-03', '2024-12-07')
      
      expect(range1.overlaps(range2)).toBe(true)
      expect(range2.overlaps(range1)).toBe(true)
    })

    it('should detect non-overlapping ranges', () => {
      const range1 = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const range2 = DateRange.fromStrings('2024-12-06', '2024-12-10')
      
      expect(range1.overlaps(range2)).toBe(false)
      expect(range2.overlaps(range1)).toBe(false)
    })

    it('should detect adjacent ranges as non-overlapping', () => {
      const range1 = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const range2 = DateRange.fromStrings('2024-12-05', '2024-12-10')
      
      expect(range1.overlaps(range2)).toBe(false)
      expect(range2.overlaps(range1)).toBe(false)
    })
  })

  describe('contains', () => {
    it('should detect if date is within range', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const dateInRange = new Date('2024-12-03')
      
      expect(dateRange.contains(dateInRange)).toBe(true)
    })

    it('should detect if date is outside range', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const dateOutsideRange = new Date('2024-12-10')
      
      expect(dateRange.contains(dateOutsideRange)).toBe(false)
    })

    it('should include start and end dates', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      
      expect(dateRange.contains(new Date('2024-12-01'))).toBe(true)
      expect(dateRange.contains(new Date('2024-12-05'))).toBe(true)
    })
  })

  describe('formatting', () => {
    it('should format date range correctly', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const formatted = dateRange.getFormattedRange()
      
      expect(formatted).toContain('dic')
      expect(formatted).toContain('2024')
    })

    it('should convert to ISO strings correctly', () => {
      const dateRange = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const isoStrings = dateRange.toISOStrings()
      
      expect(isoStrings.startDate).toBe('2024-12-01')
      expect(isoStrings.endDate).toBe('2024-12-05')
    })
  })

  describe('equals', () => {
    it('should return true for identical date ranges', () => {
      const range1 = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const range2 = DateRange.fromStrings('2024-12-01', '2024-12-05')
      
      expect(range1.equals(range2)).toBe(true)
    })

    it('should return false for different date ranges', () => {
      const range1 = DateRange.fromStrings('2024-12-01', '2024-12-05')
      const range2 = DateRange.fromStrings('2024-12-02', '2024-12-06')
      
      expect(range1.equals(range2)).toBe(false)
    })
  })
})