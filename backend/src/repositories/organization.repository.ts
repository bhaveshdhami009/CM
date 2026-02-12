import { AppDataSource } from '../data-source.js';
import { Organization } from '../entities/Organization.js';
import { ILike } from 'typeorm';

export class OrganizationRepository {
  private repo = AppDataSource.getRepository(Organization);

  async findAll(filters?: any) {
    const where: any = {};

    if (filters) {
      if (filters.name) where.name = ILike(`%${filters.name}%`);
      if (filters.address) where.address = ILike(`%${filters.address}%`);
      if (filters.contact_email) where.contact_email = ILike(`%${filters.contact_email}%`);
      if (filters.phone) where.phone = ILike(`%${filters.phone}%`);
    }

    return this.repo.find({
      where: where,
      order: { created_at: 'DESC' },
      relations: { users: true } 
    });
  }

  async findByName(name: string) {
    return this.repo.findOne({ where: { name } });
  }

  // Save is handled inside transaction in Service usually, but good to have
  async save(org: Organization) {
    return this.repo.save(org);
  }
  
  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}