import { AppDataSource } from '../data-source.js';
import { Execution } from '../entities/Execution.js';
import { Between } from 'typeorm';
export class ExecutionRepository {
    constructor() {
        this.repo = AppDataSource.getRepository(Execution);
    }
    async findByCaseId(caseId, organizationId) {
        return this.repo.findOne({
            where: {
                case_id: caseId,
                // STRICT CHECK: Parent Case must belong to Org
                case: {
                    organization_id: organizationId
                }
            }
        });
    }
    async findByDueDate(orgId, startDate, endDate) {
        return this.repo.find({
            where: {
                next_due_date: Between(startDate.toISOString(), endDate.toISOString()), // Date stored as string usually in 1-1
                case: { organization_id: orgId }
            },
            relations: { case: { court: true, parties: { party: true } } }
        });
    }
    async save(execution) {
        return this.repo.save(execution);
    }
    async delete(caseId) {
        return this.repo.delete(caseId);
    }
}
//# sourceMappingURL=execution.repository.js.map