export class Property {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly location: string,
    public readonly pricePerNight: number,
    public readonly images: string[],
    public readonly ownerId: string,
    public readonly available: boolean,
    public readonly bedrooms: number,
    public readonly bathrooms: number,
    public readonly area: number,
    public readonly slug?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validateProperty();
  }

  private validateProperty(): void {
    if (!this.name.trim()) {
      throw new Error('Property name is required');
    }
    if (!this.description.trim()) {
      throw new Error('Property description is required');
    }
    if (!this.location.trim()) {
      throw new Error('Property location is required');
    }
    if (this.pricePerNight <= 0) {
      throw new Error('Price per night must be greater than 0');
    }
    if (this.bedrooms < 1) {
      throw new Error('Property must have at least 1 bedroom');
    }
    if (this.bathrooms < 1) {
      throw new Error('Property must have at least 1 bathroom');
    }
    if (this.area <= 0) {
      throw new Error('Property area must be greater than 0');
    }
  }

  public isAvailable(): boolean {
    return this.available;
  }

  public calculateTotalPrice(nights: number): number {
    if (nights <= 0) {
      throw new Error('Number of nights must be greater than 0');
    }
    return this.pricePerNight * nights;
  }

  public getDisplayName(): string {
    return `${this.name} - ${this.location}`;
  }
}