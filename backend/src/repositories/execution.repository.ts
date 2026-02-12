import { AppDataSource } from '../data-source.js';
import { Execution } from '../entities/Execution.js';
import { Between } from 'typeorm';

export class ExecutionRepository {
  private repo = AppDataSource.getRepository(Execution);

  async findByCaseId(caseId: number, organizationId: number) {
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
  
  async findByDueDate(orgId: number, startDate: Date, endDate: Date) {
    return this.repo.find({
      where: {
        next_due_date: Between(startDate.toISOString(), endDate.toISOString()), // Date stored as string usually in 1-1
        case: { organization_id: orgId }
      },
      relations: { case: { court: true, parties: { party: true } } }
    });
  }

  async save(execution: Execution) {
    return this.repo.save(execution);
  }

  async delete(caseId: number) {
    return this.repo.delete(caseId);
  }
}