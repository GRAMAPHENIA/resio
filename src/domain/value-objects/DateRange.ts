export class DateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    this.validateDateRange();
  }

  private validateDateRange(): void {
    if (this.startDate >= this.endDate) {
      throw new Error('End date must be after start date');
    }
  }

  public static fromStrings(startDate: string, endDate: string): DateRange {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }
    
    return new DateRange(start, end);
  }

  public getNights(): number {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  public isInFuture(): boolean {
    return this.startDate > new Date();
  }

  public isInPast(): boolean {
    return this.endDate < new Date();
  }

  public isCurrent(): boolean {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now;
  }

  public overlaps(other: DateRange): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  public contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  public getFormattedRange(): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return `${this.startDate.toLocaleDateString('es-ES', options)} - ${this.endDate.toLocaleDateString('es-ES', options)}`;
  }

  public toISOStrings(): { startDate: string; endDate: string } {
    return {
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0]
    };
  }

  public equals(other: DateRange): boolean {
    return this.startDate.getTime() === other.startDate.getTime() &&
           this.endDate.getTime() === other.endDate.getTime();
  }
}