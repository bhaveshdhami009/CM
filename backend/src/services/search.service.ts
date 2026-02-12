import { AppDataSource } from '../data-source.js';
import { AdvancedSearchDto, FilterCondition } from '../dto/search.dto.js';
import { Brackets, In, Repository } from 'typeorm';

// Import Entities strictly
import { Case } from '../entities/Case.js';
import { Hearing } from '../entities/Hearing.js';
import { CaseLog } from '../entities/CaseLog.js';
import { Execution } from '../entities/Execution.js';
import { DlsaRecord } from '../entities/DlsaRecord.js';
import { User } from '../entities/User.js';

export class SearchService {
  
  async search(dto: AdvancedSearchDto, user: User) {
    const { entityType, filters, logic, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    let repo: Repository<any>;
    let alias: string;
    let pkName: string;
    let sortColumn: string;
    
    // 1. Configure Repo, Alias, PK, and Default Sort
    switch (entityType) {
      case 'cases': 
        repo = AppDataSource.getRepository(Case); 
        alias = 'c'; 
        pkName = 'id'; 
        sortColumn = 'c.created_at';
        break;
      case 'hearings': 
        repo = AppDataSource.getRepository(Hearing); 
        alias = 'h'; 
        pkName = 'id'; 
        sortColumn = 'h.hearing_date'; // Sort by actual event date
        break;
      case 'logs': 
        repo = AppDataSource.getRepository(CaseLog); 
        alias = 'l'; 
        pkName = 'id'; 
        sortColumn = 'l.log_date'; // Sort by actual log date
        break;
      case 'executions': 
        repo = AppDataSource.getRepository(Execution); 
        alias = 'e'; 
        pkName = 'case_id'; 
        sortColumn = 'e.created_at';
        break;
      case 'dlsa': 
        repo = AppDataSource.getRepository(DlsaRecord); 
        alias = 'd'; 
        pkName = 'case_id'; 
        sortColumn = 'd.created_at';
        break;
      default: throw new Error('Invalid Entity Type');
    }

    const qb = repo.createQueryBuilder(alias);

    // --- JOINS ---
    // Establish the 'c' alias for the Case relation if we aren't querying cases directly
    if (entityType !== 'cases') {
      qb.innerJoin(`${alias}.case`, 'c'); // Inner join enforces security (orphaned records won't show)
    }
    
    // Join Common Relations for Filtering
    qb.leftJoin('c.court', 'court'); 
    qb.leftJoin('court.district', 'district');
    qb.leftJoin('c.parties', 'cp');
    qb.leftJoin('cp.party', 'p');

    // --- SECURITY ---
    // Ensure data belongs to User's Org
    qb.where('c.organization_id = :orgId', { orgId: user.organization_id });

    // Handle Soft Delete for Cases
    if (entityType === 'cases') {
        qb.andWhere('c.deleted_at IS NULL');
    }

    // --- FILTERS ---
    if (filters && filters.length > 0) {
      qb.andWhere(new Brackets(qbInner => {
        filters.forEach((filter, index) => {
          const paramName = `val_${index}`;
          const formattedValue = this.formatValue(filter);
          const params = { [paramName]: formattedValue };

          // 1. Special Case: Search by Party Name (Case Title)
          if (filter.field === 'case_title') {
            const condition = `(p.first_name ILIKE :${paramName} OR p.last_name ILIKE :${paramName})`;
            this.applyCondition(qbInner, condition, params, index, logic);
            return;
          }

          // 2. Field Mapping
          let dbField = `${alias}.${filter.field}`; // Default to main alias
          
          // Map to Joined Tables
          if (filter.field === 'court_name') dbField = 'court.name';
          if (filter.field === 'district_name') dbField = 'district.name';
          
          // Always map core identifiers to Case table (c), even if searching Logs/Hearings
          if (filter.field === 'case_no') dbField = 'c.case_no';
          if (filter.field === 'file_no') dbField = 'c.file_no';
          if (filter.field === 'filing_no') dbField = 'c.filing_no';

          // 3. Condition Construction
          let condition = '';
          
          // CHECK FOR DATE FIELDS (Postgres Casting Fix)
          // If field ends in _date, _at, _on (e.g. log_date, created_at, billed_on)
          const isDateSearch = filter.field.includes('date') || filter.field.includes('_at') || filter.field.includes('_on');

          switch (filter.operator) {
            case 'equals': 
                // Exact match for dates usually requires casting or date_trunc, strict equality is fine for IDs
                condition = `${dbField} = :${paramName}`; 
                break;
            case 'contains': 
            case 'startsWith':
                if (isDateSearch) {
                    // FIX: Cast Date/Timestamp to TEXT for string comparison (ILIKE)
                    // This prevents "operator does not exist: timestamp ~~* unknown"
                    condition = `CAST(${dbField} AS TEXT) ILIKE :${paramName}`;
                } else {
                    condition = `${dbField} ILIKE :${paramName}`;
                }
                break;
            case 'gt': condition = `${dbField} > :${paramName}`; break;
            case 'lt': condition = `${dbField} < :${paramName}`; break;
          }

          this.applyCondition(qbInner, condition, params, index, logic);
        });
      }));
    }

    // --- STEP 1: GET IDs (Pagination) ---
    // We select distinct IDs to handle the one-to-many explosion from Parties join
    qb.select(`${alias}.${pkName}`, 'id');
    // We must add the sort column to select to order by it
    qb.addSelect(sortColumn, 'sortCol');
    
    qb.orderBy(sortColumn, 'DESC');
    qb.skip(skip).take(limit);

    // Get IDs and Total Count
    // getRawMany is safer here due to distinct logic needed for complex joins
    const rawResults = await qb.getRawMany(); 
    const total = await qb.getCount();

    if (rawResults.length === 0) {
      return { data: [], meta: { total, page, limit } };
    }

    // Extract IDs (handle raw alias usually being table_id)
    const ids = rawResults.map(r => r.id);

    // --- STEP 2: HYDRATE FULL DATA ---
    const relations: any = {};

    if (entityType === 'cases') {
      relations.court = { district: true };
      relations.parties = { party: true }; 
      relations.hearings = true;
      relations.logs = true;
      relations.dlsa = true;
      relations.execution = true;
    } else {
      // For children, load parent case details
      relations.case = {
        court: { district: true },
        parties: { party: true }
      };
      if (entityType === 'hearings') relations.judge = true;
      if (entityType === 'logs') relations.creator = true;
    }

    const cleanData = await repo.find({
      where: { [pkName]: In(ids) },
      relations: relations,
      order: { 
          // Re-apply sort order for the final result set
          [sortColumn.split('.')[1]]: 'DESC' 
      }
    });

    return { data: cleanData, meta: { total, page, limit } };
  }

  // Helper to apply AND/OR logic
  private applyCondition(qb: any, condition: string, params: any, index: number, logic: string) {
      if (index === 0) {
          qb.where(condition, params);
      } else {
          logic === 'OR' ? qb.orWhere(condition, params) : qb.andWhere(condition, params);
      }
  }

  private formatValue(filter: FilterCondition) {
    if (filter.operator === 'contains') return `%${filter.value}%`;
    if (filter.operator === 'startsWith') return `${filter.value}%`;
    
    // Handle Boolean strings
    if (filter.value === 'true') return true;
    if (filter.value === 'false') return false;
    
    return filter.value;
  }
}