import { AppDataSource } from '../data-source.js';
import { Setting } from '../entities/Setting.js';

export class SettingRepository {
  private repo = AppDataSource.getRepository(Setting);

  // CHANGED: Find the MOST RECENT entry for this key
  async findByKey(key: string) {
    return this.repo.findOne({
      where: { key },
      order: { created_at: 'DESC' } // Latest first
    });
  }
  
  // NEW: Fetch history
  async getHistory(key: string) {
    return this.repo.find({
      where: { key },
      order: { created_at: 'DESC' },
      relations: { created_by: true }
    });
  }
  
  // NEW: Fetch all current keys (distinct)
  async getAllKeys() {
    // This is a bit complex in TypeORM, raw query is easiest for "Distinct On" logic
    // or just fetch all and group in JS. For admin, simple query is fine:
    const all = await this.repo.find({ 
        order: { key: 'ASC', created_at: 'DESC' } 
    });
    
    // Filter to get only the latest of each key
    const distinctMap = new Map();
    all.forEach(s => {
        if(!distinctMap.has(s.key)) distinctMap.set(s.key, s);
    });
    return Array.from(distinctMap.values());
  }

  async save(setting: Setting) {
    return this.repo.save(setting);
  }
}