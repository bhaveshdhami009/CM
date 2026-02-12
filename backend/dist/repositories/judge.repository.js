import { AppDataSource } from '../data-source.js';
import { Judge } from '../entities/Judge.js';
export class JudgeRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Judge);
    }
    async findAll() {
        return this.repo.find({ order: { name: 'ASC' } });
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    // Generalized 'create' to 'save' to handle updates too
    async save(judge) {
        return this.repo.save(judge);
    }
    async delete(id) {
        return this.repo.delete(id);
    }
    // Kept for backward compatibility if used explicitly elsewhere, 
    // but save() above covers this.
    async create(name) {
        const judge = this.repo.create({ name });
        return this.repo.save(judge);
    }
}
//# sourceMappingURL=judge.repository.js.map