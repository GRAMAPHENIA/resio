export class BookingStatus {
  private constructor(private readonly value: 'pending' | 'paid' | 'cancelled') {}

  public static pending(): BookingStatus {
    return new BookingStatus('pending');
  }

  public static paid(): BookingStatus {
    return new BookingStatus('paid');
  }

  public static cancelled(): BookingStatus {
    return new BookingStatus('cancelled');
  }

  public static fromString(status: string): BookingStatus {
    switch (status) {
      case 'pending':
        return BookingStatus.pending();
      case 'paid':
        return BookingStatus.paid();
      case 'cancelled':
        return BookingStatus.cancelled();
      default:
        throw new Error(`Invalid booking status: ${status}`);
    }
  }

  public isPending(): boolean {
    return this.value === 'pending';
  }

  public isPaid(): boolean {
    return this.value === 'paid';
  }

  public isCancelled(): boolean {
    return this.value === 'cancelled';
  }

  public canBeCancelled(): boolean {
    return this.value === 'pending' || this.value === 'paid';
  }

  public toString(): string {
    return this.value;
  }

  public getDisplayName(): string {
    switch (this.value) {
      case 'pending':
        return 'Pendiente';
      case 'paid':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
    }
  }

  public getColor(): string {
    switch (this.value) {
      case 'pending':
        return 'yellow';
      case 'paid':
        return 'green';
      case 'cancelled':
        return 'red';
    }
  }

  public equals(other: BookingStatus): boolean {
    return this.value === other.value;
  }
}