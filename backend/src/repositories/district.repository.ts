import { AppDataSource } from '../data-source.js';
import { District } from '../entities/District.js';

export class DistrictRepository {
  private repo = AppDataSource.getRepository(District);

  async findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  // Handles both Create (no ID) and Update (with ID)
  async save(district: Partial<District>) {
    return this.repo.save(district);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}