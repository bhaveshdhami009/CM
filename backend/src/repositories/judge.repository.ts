import { AppDataSource } from '../data-source.js';
import { Judge } from '../entities/Judge.js';

export class JudgeRepository {
  private repo = AppDataSource.getRepository(Judge);

  async findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  // Generalized 'create' to 'save' to handle updates too
  async save(judge: Partial<Judge>) {
    return this.repo.save(judge);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
  
  // Kept for backward compatibility if used explicitly elsewhere, 
  // but save() above covers this.
  async create(name: string) {
    const judge = this.repo.create({ name });
    return this.repo.save(judge);
  }
}