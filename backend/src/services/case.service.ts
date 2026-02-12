import { AppDataSource } from '../data-source.js';
import { Case } from '../entities/Case.js';
import { Party } from '../entities/Party.js';
import { CaseParty, PartyRole } from '../entities/CaseParty.js';
import { CreateCaseDto } from '../dto/case.dto.js'; // Use new DTO file
import { User } from '../entities/User.js';
import { EntityManager } from 'typeorm';
import { CaseRepository } from '../repositories/case.repository.js'; 
import { DlsaRecord } from '../entities/DlsaRecord.js';
import { Execution } from '../entities/Execution.js';
import { Court } from '../entities/Court.js';
import { Establishment } from '../entities/Establishment.js';
import { AppError } from '../utils/AppError.js';

export class CaseService {
	
  private caseRepo = new CaseRepository();
  
  async getAllCases(user: User, page: number, limit: number, search?: string, filters?: any) {
    const { data, total } = await this.caseRepo.findAll(user.organization_id!, page, limit, search, filters);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async getCaseById(id: number, user: User) {
    const caseDetails = await this.caseRepo.findById(id, user.organization_id!);
    if (!caseDetails) return null; 
    return caseDetails;
  }
  
  // COMMAND: Create a Case
  async createCase(data: CreateCaseDto, creator: User) {
    return AppDataSource.manager.transaction(async (manager) => {
      
      // 1. Create the Case Record
      const newCase = new Case();
      newCase.file_no = data.fileNo;
      newCase.filing_no = data.filingNo;
      newCase.case_type = data.caseType;
      newCase.court_id = data.courtId;
      newCase.establishment_id = data.establishmentId;
      newCase.case_no = data.caseNo;
      //newCase.court_no = data.courtNo; // If entity has this field, uncomment
      newCase.act = data.act;
      newCase.section = data.section;
      newCase.remarks = data.remarks;
      newCase.organization_id = creator.organization_id!; 
      newCase.created_by = creator.id;

      // Handle Dates Safely
      if (data.filingDate) {
        const d = new Date(data.filingDate);
        if (!isNaN(d.getTime())) newCase.filing_date = d;
      }
      if (data.receivedDate) {
        const d = new Date(data.receivedDate);
        if (!isNaN(d.getTime())) newCase.received_date = d;
      }
      
      const savedCase = await manager.save(newCase);

      // 2. Handle Petitioners
      await this.linkParties(manager, data.petitionerIds, savedCase, PartyRole.PETITIONER);

      // 3. Handle Respondents
      await this.linkParties(manager, data.respondentIds, savedCase, PartyRole.RESPONDENT);
      
      // 4. Handle DLSA (Check if object exists and has required fields)
      if (data.dlsa && data.dlsa.letterNo) {
        const dlsa = new DlsaRecord();
        dlsa.case = savedCase; 
        dlsa.letter_no = data.dlsa.letterNo;
        dlsa.registration_no = data.dlsa.registrationNo;
        dlsa.remarks = data.dlsa.remarks;
        
        if (data.dlsa.letterDate) {
          const d = new Date(data.dlsa.letterDate);
          if (!isNaN(d.getTime())) dlsa.letter_date = d;
        }
        if (data.dlsa.billedOn) {
          const d = new Date(data.dlsa.billedOn);
          if (!isNaN(d.getTime())) dlsa.billed_on = d;
        }
        if (data.dlsa.receivedOn) {
          const d = new Date(data.dlsa.receivedOn);
          if (!isNaN(d.getTime())) dlsa.received_on = d;
        }
        
        await manager.save(dlsa);
      }
      
      // 5. Handle Execution
      if (data.execution && data.execution.amount !== undefined) {
        const exec = new Execution();
        exec.case = savedCase;
        exec.amount = data.execution.amount;
        exec.remarks = data.execution.remarks;
        exec.is_active = true;

        if (data.execution.start_date) {
            exec.start_date = data.execution.start_date; // DTO validates DateString
        } else {
            const now = new Date().toISOString();
            exec.start_date = now;
        }
        
        if (data.execution.next_due_date) {
            exec.next_due_date = data.execution.next_due_date; // DTO validates DateString
        } else {
            exec.next_due_date = exec.start_date;
        }

        await manager.save(exec);
      }
      
      return savedCase;
    });
  }
  
  private async linkParties(manager: EntityManager, partyIds: number[], savedCase: Case, role: PartyRole) {
    let count = 1;
    for (const partyId of partyIds) {
      const caseParty = new CaseParty();
      caseParty.case = savedCase;
      caseParty.party = { id: partyId } as Party; 
      caseParty.role = role;
      caseParty.party_number = count++;
      
      await manager.save(caseParty);
    }
  }
  
  async updateCase(id: number, data: CreateCaseDto, user: User) {
    const caseItem = await this.caseRepo.findById(id, user.organization_id!);
    if (!caseItem) throw new AppError('Case not found', 404);

    return AppDataSource.manager.transaction(async (manager) => {
      // 1. Update Scalar Fields
      caseItem.file_no = data.fileNo;
      caseItem.filing_no = data.filingNo;
      caseItem.case_type = data.caseType;
      caseItem.court = { id: data.courtId } as Court;
      if (data.establishmentId) {
          caseItem.establishment = { id: data.establishmentId } as Establishment;
      }
      caseItem.case_no = data.caseNo;
      // caseItem.court_no = data.courtNo;
      caseItem.act = data.act;
      caseItem.section = data.section;
      caseItem.remarks = data.remarks;

      if (data.filingDate) {
        const d = new Date(data.filingDate);
        if (!isNaN(d.getTime())) caseItem.filing_date = d;
      }
      if (data.receivedDate) {
        const d = new Date(data.receivedDate);
        if (!isNaN(d.getTime())) caseItem.received_date = d;
      }

      const savedCase = await manager.save(caseItem);

      // 2. Update Parties (Full Replace)
      if (data.petitionerIds || data.respondentIds) {
        // Delete existing links for this case
        await manager.delete(CaseParty, { case_id: id });
      
        if (data.petitionerIds?.length > 0) {
          await this.linkParties(manager, data.petitionerIds, savedCase, PartyRole.PETITIONER);
        }
        if (data.respondentIds?.length > 0) {
          await this.linkParties(manager, data.respondentIds, savedCase, PartyRole.RESPONDENT);
        }
      }

      // 3. Handle DLSA Update
      if (data.dlsa && data.dlsa.letterNo) {
        let dlsa = caseItem.dlsa;
        if (!dlsa) {
          dlsa = new DlsaRecord();
          dlsa.case = savedCase;
        }

        dlsa.letter_no = data.dlsa.letterNo;
        dlsa.registration_no = data.dlsa.registrationNo;
        dlsa.remarks = data.dlsa.remarks;

        if (data.dlsa.letterDate) dlsa.letter_date = new Date(data.dlsa.letterDate);
        if (data.dlsa.billedOn) dlsa.billed_on = new Date(data.dlsa.billedOn);
        if (data.dlsa.receivedOn) dlsa.received_on = new Date(data.dlsa.receivedOn);

        await manager.save(dlsa);
      } else if (caseItem.dlsa && !data.dlsa) {
        // If DLSA existed but now payload has no DLSA, remove it?
        // Usually safer to keep unless explicitly asked to delete.
        await manager.remove(caseItem.dlsa); 
      }
      
      // 4. Handle Execution Update
      if (data.execution && data.execution.amount !== undefined) {
        let exec = caseItem.execution;
        if (!exec) {
          exec = new Execution();
          exec.case_id = id;
          exec.is_active = true;
          exec.next_due_date = new Date().toISOString();
        }

        exec.amount = data.execution.amount;
        exec.remarks = data.execution.remarks;
        
        if (data.execution.start_date) {
             exec.start_date = data.execution.start_date;
        } else {
            const now = new Date().toISOString();
            exec.start_date = now;
        }
        
        if (data.execution.next_due_date) {
             exec.next_due_date = data.execution.next_due_date;
        } else {
            exec.next_due_date = exec.start_date;
        }

        await manager.save(exec);
      } else if (caseItem.execution) {
        caseItem.execution.is_active = false;
        await manager.save(caseItem.execution);
      }

      return savedCase;
    });
  }

  async deleteCase(id: number, user: User) {
    const caseItem = await this.caseRepo.findById(id, user.organization_id!);
    if (!caseItem) throw new AppError('Case not found', 404);

    const typeOrmRepo = AppDataSource.getRepository(Case);
    return typeOrmRepo.softRemove(caseItem); 
  }
}