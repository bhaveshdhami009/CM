import { AppDataSource } from '../data-source.js';
import { Hearing } from '../entities/Hearing.js';
import { Between } from 'typeorm';

export class HearingRepository {
  private repo = AppDataSource.getRepository(Hearing);

  // STRICT CHECK: Ensure parent case belongs to the user's Organization
  async findByCaseId(caseId: number, organizationId: number) {
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

  async create(data: Partial<Hearing>) {
    return this.repo.save(data);
  }
  
  async findById(id: number, organizationId: number) {
    return this.repo.findOne({
      where: { 
        id,
        case: { organization_id: organizationId } // Strict Ownership
      },
      relations: { case: true }
    });
  }

  async save(hearing: Hearing) {
    return this.repo.save(hearing);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
  
  async findParentHearing(childHearingId: number) {
    return this.repo.findOne({
      where: {
        next_hearing: { id: childHearingId }
      },
      relations: { next_hearing: true }
    });
  }
  
  async findAllForCase(caseId: number) {
    return this.repo.find({
      where: { case_id: caseId },
      order: { hearing_date: 'ASC' } // Oldest to Newest
    });
  }
  
  async saveMany(hearings: Hearing[]) {
    return this.repo.save(hearings);
  }
  
  async findBetweenDates(orgId: number, startDate: Date, endDate: Date) {
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