import { AppDataSource } from '../data-source.js';
import { Case } from '../entities/Case.js';
import { ILike, Brackets, In, Between } from 'typeorm'; // Import ILike for case-insensitive search


export class CaseRepository {
  private repo = AppDataSource.getRepository(Case);

  async findAll(
    organizationId: number, 
    page: number = 1, 
    limit: number = 20, 
    search?: string, 
    filters?: any
  ) {
    const skip = (page - 1) * limit;

    // --- STEP 1: Find Matching IDs ---
    const qb = this.repo.createQueryBuilder('c');

    // Joins needed for FILTERING only
    qb.leftJoin('c.court', 'court')
      .leftJoin('c.parties', 'cp')
      .leftJoin('cp.party', 'p');

    // Security & Soft Delete
    qb.where('c.organization_id = :orgId', { orgId: organizationId });
    qb.andWhere('c.deleted_at IS NULL');

    // Global Search
    if (search) {
      qb.andWhere(new Brackets(subQb => {
        subQb.where('c.file_no ILIKE :search', { search: `%${search}%` })
             .orWhere('c.filing_no ILIKE :search', { search: `%${search}%` })
             .orWhere('c.case_type ILIKE :search', { search: `%${search}%` })
             .orWhere('court.name ILIKE :search', { search: `%${search}%` })
             .orWhere('p.first_name ILIKE :search', { search: `%${search}%` })
             .orWhere('p.last_name ILIKE :search', { search: `%${search}%` });
      }));
    }

    // Column Filters
    if (filters) {
      if (filters.file_no) {
        qb.andWhere('c.file_no ILIKE :file_no', { file_no: `%${filters.file_no}%` });
      }
      if (filters.case_type) {
        qb.andWhere('c.case_type ILIKE :case_type', { case_type: `%${filters.case_type}%` });
      }
      if (filters.court_name) {
        qb.andWhere('court.name ILIKE :court_name', { court_name: `%${filters.court_name}%` });
      }
      if (filters.title) {
        qb.andWhere(new Brackets(subQb => {
           subQb.where('p.first_name ILIKE :title', { title: `%${filters.title}%` })
                .orWhere('p.last_name ILIKE :title', { title: `%${filters.title}%` });
        }));
      }
    }

    // Get IDs and Count
    qb.select(['c.id', 'c.created_at']);
    qb.orderBy('c.created_at', 'DESC');
    qb.skip(skip).take(limit);

    const [results, total] = await qb.getManyAndCount();

    // If no results, return empty immediately
    if (results.length === 0) {
      return { data: [], total: 0 };
    }

    const ids = results.map(r => r.id);

    // --- STEP 2: Fetch Full Data ---
    // Fetch distinct cases with ALL relations (no filtering applied to relations)
    const data = await this.repo.find({
      where: { id: In(ids) },
      relations: {
        logs: true,
        court: true,
        parties: { party: true }, // This will now fetch ALL parties, not just the matching one
        hearings: true 
      },
      order: { created_at: 'DESC' } // Ensure same order
    });

    return { data, total };
  }
  
  
  async findById(id: number, organizationId: number) {
    return this.repo.findOne({
      where: { 
        id: id, 
        organization_id: organizationId // Security Check
      },
      relations: {
        //caseType: true,
        court: {
          district: true // Fetch nested district info
        },
        establishment: true,
        creator: true,
        parties: {
          party: true
        }, 
        execution: true,
        dlsa: true,
        hearings: true, // Required for dynamic Next Hearing calculation
        logs: true  
      }
    });
  }
  
  async update(id: number, organizationId: number, data: Partial<Case>) {
    // We pass an object as the first argument to restrict the update 
    // strictly to the ID AND the Organization ID.
    return this.repo.update({ id, organization_id: organizationId }, data);
  }
  
  async findByReceivedDate(orgId: number, startDate: Date, endDate: Date) {
    return this.repo.find({
      where: {
        organization_id: orgId,
        received_date: Between(startDate, endDate)
      },
      relations: { court: true, parties: { party: true } }
    });
  }
  
  async findForCalendar(orgId: number, startDate: Date, endDate: Date) {
    return this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.court', 'court')
      .leftJoinAndSelect('c.parties', 'cp')
      .leftJoinAndSelect('cp.party', 'p')
      .where('c.organization_id = :orgId', { orgId })
      .andWhere(
        '(c.filing_date BETWEEN :start AND :end OR c.received_date BETWEEN :start AND :end)',
        { start: startDate, end: endDate }
      )
      .getMany();
  }
}