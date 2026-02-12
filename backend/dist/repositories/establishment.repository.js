import { AppDataSource } from '../data-source.js';
import { Establishment } from '../entities/Establishment.js';
export class EstablishmentRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Establishment);
    }
    async findByDistrict(districtId) {
        return this.repo.find({
            where: { district_id: districtId },
            order: { name: 'ASC' }
        });
    }
    async findAll() {
        return this.repo.find({ relations: { district: true }, order: { name: 'ASC' } });
    }
    async save(data) {
        return this.repo.save(data);
    }
    async delete(id) {
        return this.repo.delete(id);
    }
}
//# sourceMappingURL=establishment.repository.js.map