import { PartyRepository } from '../repositories/party.repository.js';
import { Party } from '../entities/Party.js';
import { User } from '../entities/User.js';
import { AppError } from '../utils/AppError.js';
import { CreatePartyDto } from '../dto/party.dto.js'; // FIX: Update path to match new structure

export class PartyService {
  private repo = new PartyRepository();

  async searchParties(query: string, user: User) {
    if (!query) return [];
    return this.repo.search(query, user.organization_id!);
  }

  async getParties(user: User, page: number, limit: number, search?: string, filters?: any) {
    const { data, total } = await this.repo.findAll(user.organization_id!, page, limit, search, filters);
    
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

  async createParty(data: CreatePartyDto, user: User) {
    const party = new Party();
    // Safe to copy because DTO validation whitelist stripped unknown fields
    Object.assign(party, data);
    
    // Strict Org Assignment
    party.organization_id = user.organization_id!;
    
    return this.repo.create(party);
  }

  async updateParty(id: number, data: Partial<CreatePartyDto>, user: User) {
    const party = await this.repo.findById(id, user.organization_id!);
    if (!party) throw new AppError('Party not found', 404);

    // Merge updates
    Object.assign(party, data);
    
    return this.repo.save(party);
  }

  async deleteParty(id: number, user: User) {
    const party = await this.repo.findById(id, user.organization_id!);
    if (!party) throw new AppError('Party not found', 404);
    
    try {
        return await this.repo.delete(id);
    } catch(e: any) {
        // Postgres error code 23503 is foreign_key_violation
        if (e.code === '23503') {
            throw new AppError('Cannot delete party because they are linked to existing cases.', 400);
        }
        throw e;
    }
  }
}