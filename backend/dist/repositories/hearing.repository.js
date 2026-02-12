import { AppDataSource } from '../data-source.js';
import { Hearing } from '../entities/Hearing.js';
import { Between } from 'typeorm';
export class HearingRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Hearing);
    }
    // STRICT CHECK: Ensure parent case belongs to the user's Organization
    async findByCaseId(caseId, organizationId) {
        return this.repo.find({
            where: {
                case_id: caseId,
                case: {
                    organization_id: organizationId
                }
            },
            relations: { judge: true, next_hearing: true },
            order: { hearing_date: 'DESC' } // Newest hearings first
        });
    }
    async create(data) {
        return this.repo.save(data);
    }
    async findById(id, organizationId) {
        return this.repo.findOne({
            where: {
                id,
                case: { organization_id: organizationId } // Strict Ownership
            },
            relations: { case: true }
        });
    }
    async save(hearing) {
        return this.repo.save(hearing);
    }
    async delete(id) {
        return this.repo.delete(id);
    }
    async findParentHearing(childHearingId) {
        return this.repo.findOne({
            where: {
                next_hearing: { id: childHearingId }
            },
            relations: { next_hearing: true }
        });
    }
    async findAllForCase(caseId) {
        return this.repo.find({
            where: { case_id: caseId },
            order: { hearing_date: 'ASC' } // Oldest to Newest
        });
    }
    async saveMany(hearings) {
        return this.repo.save(hearings);
    }
    async findBetweenDates(orgId, startDate, endDate) {
        return this.repo.find({
            where: {
                hearing_date: Between(startDate, endDate),
                case: { organization_id: orgId }
            },
            relations: {
                case: { court: true, parties: { party: true } }
            },
            order: { hearing_date: 'ASC' }
        });
    }
}
//# sourceMappingURL=hearing.repository.js.map