import { AppDataSource } from '../data-source.js';
import { Organization } from '../entities/Organization.js';
import { ILike } from 'typeorm';
export class OrganizationRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Organization);
    }
    async findAll(filters) {
        const where = {};
        if (filters) {
            if (filters.name)
                where.name = ILike(`%${filters.name}%`);
            if (filters.address)
                where.address = ILike(`%${filters.address}%`);
            if (filters.contact_email)
                where.contact_email = ILike(`%${filters.contact_email}%`);
            if (filters.phone)
                where.phone = ILike(`%${filters.phone}%`);
        }
        return this.repo.find({
            where: where,
            order: { created_at: 'DESC' },
            relations: { users: true }
        });
    }
    async findByName(name) {
        return this.repo.findOne({ where: { name } });
    }
    // Save is handled inside transaction in Service usually, but good to have
    async save(org) {
        return this.repo.save(org);
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async delete(id) {
        return this.repo.delete(id);
    }
}
//# sourceMappingURL=organization.repository.js.map