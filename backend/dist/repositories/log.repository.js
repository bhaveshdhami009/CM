import { AppDataSource } from '../data-source.js';
import { CaseLog } from '../entities/CaseLog.js';
import { Between } from 'typeorm';
export class LogRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(CaseLog);
    }
    async findByCaseId(caseId, organizationId) {
        return this.repo.find({
            where: {
                case_id: caseId,
                // STRICT CHECK: Ensure the parent case belongs to this Org
                case: {
                    organization_id: organizationId
                }
            },
            relations: { creator: true },
            order: { log_date: 'DESC' }
        });
    }
    async create(data) {
        return this.repo.save(data);
    }
    async findById(id, organizationId) {
        return this.repo.findOne({
            where: {
                id,
                // STRICT CHECK: Ensure the parent case belongs to this Org
                case: {
                    organization_id: organizationId
                }
            },
            relations: { case: true } // Need relation to check org
        });
    }
    async findBetweenDates(orgId, startDate, endDate) {
        return this.repo.find({
            where: {
                log_date: Between(startDate, endDate),
                // Filter by Organization via the Case relation
                case: {
                    organization_id: orgId
                }
            },
            relations: {
                case: {
                    parties: {
                        party: true
                    },
                    court: true
                }
            },
            order: {
                log_date: 'ASC'
            }
        });
    }
    async save(log) {
        return this.repo.save(log);
    }
    async delete(id) {
        return this.repo.delete(id);
    }
}
//# sourceMappingURL=log.repository.js.map