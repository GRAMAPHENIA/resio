import { Property } from '../entities/Property';

export interface PropertyRepository {
  findById(id: string): Promise<Property | null>;
  findBySlug(slug: string): Promise<Property | null>;
  findAll(): Promise<Property[]>;
  findByOwnerId(ownerId: string): Promise<Property[]>;
  findAvailable(): Promise<Property[]>;
  save(property: Property): Promise<Property>;
  update(property: Property): Promise<Property>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}