import { AppDataSource } from '../data-source.js';
import { CaseLog } from '../entities/CaseLog.js';
import { Between, FindOptionsWhere } from 'typeorm';


export class LogRepository {
  private repo = AppDataSource.getRepository(CaseLog);

  async findByCaseId(caseId: number, organizationId: number) {
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

  async create(data: Partial<CaseLog>) {
    return this.repo.save(data);
  }
  
  async findById(id: number, organizationId: number) {
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
  
  async findBetweenDates(orgId: number, startDate: Date, endDate: Date) {
    return this.repo.find({
      where: {
        log_date: Between(startDate, endDate),
        // Filter by Organization via the Case relation
        case: {
          organization_id: orgId
        }
      } as FindOptionsWhere<CaseLog>,
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
  
  async save(log: CaseLog) {
    return this.repo.save(log);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}