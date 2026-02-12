import { AppDataSource } from '../data-source.js';
import { Court } from '../entities/Court.js';
export class CourtRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Court);
    }
    // Used by Case Form (Filtered)
    async findByDistrict(districtId) {
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
    async findById(id) {
        return this.repo.findOne({
            where: { id },
            relations: { district: true }
        });
    }
    async save(court) {
        return this.repo.save(court);
    }
    async delete(id) {
        return this.repo.delete(id);
    }
}
//# sourceMappingURL=court.repository.js.map