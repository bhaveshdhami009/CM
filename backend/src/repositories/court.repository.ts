import { AppDataSource } from '../data-source.js';
import { Court } from '../entities/Court.js';

export class CourtRepository {
  private repo = AppDataSource.getRepository(Court);

  // Used by Case Form (Filtered)
  async findByDistrict(districtId: number) {
    return this.repo.find({
      where: { district_id: districtId },
      order: { name: 'ASC' }
    });
  }

  // Used by Master Data Manager (List all)
  async findAll() {
    return this.repo.find({
      relations: { district: true }, // Load district name for display
      order: { name: 'ASC' }
    });
  }

  async findById(id: number) {
    return this.repo.findOne({ 
      where: { id },
      relations: { district: true }
    });
  }

  async save(court: Partial<Court>) {
    return this.repo.save(court);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}