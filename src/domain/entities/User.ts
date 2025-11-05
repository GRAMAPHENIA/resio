import { Email } from '../value-objects/Email';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly fullName: string,
    public readonly avatarUrl?: string,
    public readonly phone?: string,
    public readonly createdAt?: Date
  ) {
    this.validateUser();
  }

  private validateUser(): void {
    if (!this.fullName.trim()) {
      throw new Error('Full name is required');
    }
    if (this.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }
    if (this.fullName.trim().length > 100) {
      throw new Error('Full name cannot exceed 100 characters');
    }
  }

  public getDisplayName(): string {
    return this.fullName;
  }

  public getInitials(): string {
    return this.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  public hasPhone(): boolean {
    return !!this.phone?.trim();
  }

  public hasAvatar(): boolean {
    return !!this.avatarUrl?.trim();
  }
}