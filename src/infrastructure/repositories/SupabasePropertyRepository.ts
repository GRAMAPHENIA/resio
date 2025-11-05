import { createClient } from '@/lib/supabase/client';
import { Property } from '../../domain/entities/Property';
import { PropertyRepository } from '../../domain/repositories/PropertyRepository';

interface PropertyRow {
  id: string;
  name: string;
  slug?: string;
  description: string;
  location: string;
  price_per_night: number;
  images: string[];
  owner_id: string;
  available: boolean;
  bedrooms: number;
  bathrooms: number;
  area: number;
  created_at: string;
  updated_at?: string;
}

export class SupabasePropertyRepository implements PropertyRepository {
  private readonly supabase = createClient();

  public async findById(id: string): Promise<Property | null> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToEntity(data);
  }

  public async findBySlug(slug: string): Promise<Property | null> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToEntity(data);
  }

  public async findAll(): Promise<Property[]> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async findByOwnerId(ownerId: string): Promise<Property[]> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async findAvailable(): Promise<Property[]> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  public async save(property: Property): Promise<Property> {
    const row = this.mapEntityToRow(property);

    const { data, error } = await this.supabase
      .from('properties')
      .insert([row])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save property: ${error.message}`);
    }

    return this.mapRowToEntity(data);
  }

  public async update(property: Property): Promise<Property> {
    const row = this.mapEntityToRow(property);

    const { data, error } = await this.supabase
      .from('properties')
      .update(row)
      .eq('id', property.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }

    return this.mapRowToEntity(data);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  public async exists(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('id')
      .eq('id', id)
      .single();

    return !error && !!data;
  }

  private mapRowToEntity(row: PropertyRow): Property {
    return new Property(
      row.id,
      row.name,
      row.description,
      row.location,
      row.price_per_night,
      row.images,
      row.owner_id,
      row.available,
      row.bedrooms,
      row.bathrooms,
      row.area,
      row.slug,
      new Date(row.created_at),
      row.updated_at ? new Date(row.updated_at) : undefined
    );
  }

  private mapEntityToRow(property: Property): Partial<PropertyRow> {
    return {
      id: property.id,
      name: property.name,
      slug: property.slug,
      description: property.description,
      location: property.location,
      price_per_night: property.pricePerNight,
      images: property.images,
      owner_id: property.ownerId,
      available: property.available,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      created_at: property.createdAt?.toISOString(),
      updated_at: property.updatedAt?.toISOString()
    };
  }
}