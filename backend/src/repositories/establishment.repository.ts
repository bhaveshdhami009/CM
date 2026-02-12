import { AppDataSource } from '../data-source.js';
import { Establishment } from '../entities/Establishment.js';

export class EstablishmentRepository {
  private repo = AppDataSource.getRepository(Establishment);

  async findByDistrict(districtId: number) {
    return this.repo.find({
      where: { district_id: districtId },
      order: { name: 'ASC' }
    });
  }

  async findAll() {
    return this.repo.find({ relations: { district: true }, order: { name: 'ASC' } });
  }

  async save(data: Partial<Establishment>) {
    return this.repo.save(data);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}