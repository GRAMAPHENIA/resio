export class Email {
  private constructor(private readonly value: string) {}

  public static create(email: string): Email {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    return new Email(trimmedEmail);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public getValue(): string {
    return this.value;
  }

  public getDomain(): string {
    return this.value.split('@')[1];
  }

  public getLocalPart(): string {
    return this.value.split('@')[0];
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}