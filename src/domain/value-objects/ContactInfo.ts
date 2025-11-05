import { Email } from './Email';

export class ContactInfo {
  constructor(
    public readonly name: string,
    public readonly email: Email,
    public readonly phone?: string
  ) {
    this.validateContactInfo();
  }

  private validateContactInfo(): void {
    if (!this.name.trim()) {
      throw new Error('Name is required');
    }
    if (this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (this.name.trim().length > 100) {
      throw new Error('Name cannot exceed 100 characters');
    }
  }

  public static create(name: string, email: string, phone?: string): ContactInfo {
    return new ContactInfo(
      name.trim(),
      Email.create(email),
      phone?.trim()
    );
  }

  public getDisplayName(): string {
    return this.name;
  }

  public getEmailAddress(): string {
    return this.email.getValue();
  }

  public hasPhone(): boolean {
    return !!this.phone?.trim();
  }

  public getFormattedPhone(): string {
    if (!this.phone) return '';
    
    // Simple phone formatting for display
    const cleaned = this.phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    return this.phone;
  }

  public equals(other: ContactInfo): boolean {
    return this.name === other.name && 
           this.email.equals(other.email) && 
           this.phone === other.phone;
  }
}