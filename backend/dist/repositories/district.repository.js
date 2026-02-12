import { AppDataSource } from '../data-source.js';
import { District } from '../entities/District.js';
export class DistrictRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(District);
    }
    async findAll() {
        return this.repo.find({ order: { name: 'ASC' } });
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    // Handles both Create (no ID) and Update (with ID)
    async save(district) {
        return this.repo.save(district);
    }
    async delete(id) {
        return this.repo.delete(id);
    }
}
//# sourceMappingURL=district.repository.js.map