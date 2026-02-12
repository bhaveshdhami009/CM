import { AppDataSource } from '../data-source.js';
import { Party } from '../entities/Party.js';
import { ILike, Brackets } from 'typeorm';
export class PartyRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Party);
    }
    // Expanded findAll with Pagination and Search
    async findAll(organizationId, page = 1, limit = 20, search, filters) {
        const skip = (page - 1) * limit;
        const qb = this.repo.createQueryBuilder('p');
        // 1. Strict Organization Check
        qb.where('p.organization_id = :orgId', { orgId: organizationId });
        // 2. Global Search (OR Logic across common fields)
        if (search) {
            qb.andWhere(new Brackets(subQb => {
                subQb.where('p.first_name ILIKE :search', { search: `%${search}%` })
                    .orWhere('p.last_name ILIKE :search', { search: `%${search}%` })
                    .orWhere('p.mobile ILIKE :search', { search: `%${search}%` })
                    .orWhere('p.email ILIKE :search', { search: `%${search}%` });
            }));
        }
        // 3. Specific Column Filters (AND Logic)
        if (filters) {
            // Name Filter (Checks First OR Last)
            if (filters.name) {
                qb.andWhere(new Brackets(subQb => {
                    subQb.where('p.first_name ILIKE :name', { name: `%${filters.name}%` })
                        .orWhere('p.last_name ILIKE :name', { name: `%${filters.name}%` });
                }));
            }
            if (filters.parentage) {
                qb.andWhere(new Brackets(subQb => {
                    subQb.where('p.father_name ILIKE :parent', { parent: `%${filters.parentage}%` })
                        .orWhere('p.mother_name ILIKE :parent', { parent: `%${filters.parentage}%` });
                }));
            }
            if (filters.mobile) {
                qb.andWhere('p.mobile ILIKE :mobile', { mobile: `%${filters.mobile}%` });
            }
            if (filters.city) {
                qb.andWhere('p.city ILIKE :city', { city: `%${filters.city}%` });
            }
        }
        // 4. Pagination & Sort
        qb.orderBy('p.first_name', 'ASC');
        qb.skip(skip).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }
    // ... search method (keep for autocomplete) ...
    async search(query, orgId) {
        // ... existing logic
        return this.repo.find({
            where: [
                { first_name: ILike(`%${query}%`), organization_id: orgId },
                { last_name: ILike(`%${query}%`), organization_id: orgId },
                { mobile: ILike(`%${query}%`), organization_id: orgId },
                { father_name: ILike(`%${query}%`), organization_id: orgId }
            ],
            take: 10
        });
    }
    async create(data) {
        return this.repo.save(data);
    }
    // NEW: Save (Update)
    async save(party) {
        return this.repo.save(party);
    }
    // NEW: Find One Strict
    async findById(id, organizationId) {
        return this.repo.findOne({
            where: { id, organization_id: organizationId }
        });
    }
    // NEW: Delete
    async delete(id) {
        return this.repo.delete(id);
    }
}
//# sourceMappingURL=party.repository.js.map