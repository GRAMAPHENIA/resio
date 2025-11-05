import { createClient } from '@/lib/supabase/client';
import { Booking } from '../../domain/entities/Booking';
import { BookingRepository } from '../../domain/repositories/BookingRepository';
import { BookingStatus } from '../../domain/value-objects/BookingStatus';
import { DateRange } from '../../domain/value-objects/DateRange';
import { ContactInfo } from '../../domain/value-objects/ContactInfo';


interface BookingRow {
  id: string;
  property_id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_id?: string;
  amount: number;
  user_id?: string;
  created_at: string;
  updated_at?: string;
}

export class SupabaseBookingRepository implements BookingRepository {
  private readonly supabase = createClient();

  public async findById(id: string): Promise<Booking | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToEntity(data);
  }

  public async findByEmail(email: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async findByUserId(userId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async findByPropertyId(propertyId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async findByStatus(status: BookingStatus): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('status', status.toString())
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async findConflicting(
    propertyId: string, 
    dateRange: DateRange, 
    excludeId?: string
  ): Promise<Booking[]> {
    const { startDate, endDate } = dateRange.toISOStrings();

    let query = this.supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .neq('status', 'cancelled')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async save(booking: Booking): Promise<Booking> {
    const row = this.mapEntityToRow(booking);

    const { data, error } = await this.supabase
      .from('bookings')
      .insert([row])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save booking: ${error.message}`);
    }

    return this.mapRowToEntity(data);
  }

  public async update(booking: Booking): Promise<Booking> {
    const row = this.mapEntityToRow(booking);

    const { data, error } = await this.supabase
      .from('bookings')
      .update(row)
      .eq('id', booking.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }

    return this.mapRowToEntity(data);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete booking: ${error.message}`);
    }
  }

  public async cleanupExpired(): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data, error } = await this.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lt('created_at', fifteenMinutesAgo)
      .select('id');

    if (error) {
      throw new Error(`Failed to cleanup expired bookings: ${error.message}`);
    }

    return data?.length || 0;
  }

  private mapRowToEntity(row: BookingRow): Booking {
    const contactInfo = ContactInfo.create(
      row.user_name,
      row.user_email,
      row.user_phone
    );

    const dateRange = DateRange.fromStrings(row.start_date, row.end_date);
    const status = BookingStatus.fromString(row.status);

    return new Booking(
      row.id,
      row.property_id,
      contactInfo,
      dateRange,
      row.amount,
      status,
      row.payment_id,
      row.user_id,
      new Date(row.created_at),
      row.updated_at ? new Date(row.updated_at) : undefined
    );
  }

  private mapEntityToRow(booking: Booking): Partial<BookingRow> {
    const { startDate, endDate } = booking.dateRange.toISOStrings();

    return {
      id: booking.id,
      property_id: booking.propertyId,
      user_name: booking.contactInfo.name,
      user_email: booking.contactInfo.getEmailAddress(),
      user_phone: booking.contactInfo.phone,
      start_date: startDate,
      end_date: endDate,
      status: booking.status.toString(),
      payment_id: booking.paymentId,
      amount: booking.amount,
      user_id: booking.userId,
      created_at: booking.createdAt?.toISOString(),
      updated_at: booking.updatedAt?.toISOString()
    };
  }
}