import { SettingRepository } from '../repositories/setting.repository.js';
import { Setting } from '../entities/Setting.js';
import { User } from '../entities/User.js';
import { AppError } from '../utils/AppError.js';
import { CreateSettingDto } from '../dto/setting.dto.js'; // Import DTO

export class SettingService {
  private repo = new SettingRepository();

  async getSettingByKey(key: string) {
    const setting = await this.repo.findByKey(key);
    // Return just the value for easy consumption by frontend configs
    return setting ? setting.value : null;
  }
  
  async getAllSettings() {
      // Returns the distinct list of latest settings
      return this.repo.getAllKeys();
  }

  // Create: Strict check for uniqueness
  async createSetting(data: CreateSettingDto, user: User) {
    const key = data.key;
    if (!key) throw new AppError('Key is required for creating a setting', 400);

    // 1. Check if key already exists
    const existing = await this.repo.findByKey(key);
    if (existing) {
      throw new AppError(`Setting with key '${key}' already exists. Use update instead.`, 409);
    }

    // 2. Save new
    const setting = new Setting();
    setting.key = key;
    setting.value = data.value;
    setting.description = data.description;
    setting.created_by_id = user.id;

    return this.repo.save(setting);
  }

  // Update: Creates a NEW version (history tracking)
  async updateSetting(key: string, data: CreateSettingDto, user: User) {
    // 1. Verify existence of previous version
    const existing = await this.repo.findByKey(key);
    if (!existing) {
      throw new AppError(`Setting '${key}' does not exist. Use create to add it.`, 404);
    }

    // 2. Create new version
    const newVersion = new Setting();
    newVersion.key = key;
    newVersion.value = data.value;
    
    // Fallback: If new description not provided, keep the old one
    newVersion.description = data.description || existing.description;
    newVersion.created_by_id = user.id;
    
    return this.repo.save(newVersion);
  }
  
  // Optional: Get history of a specific key
  async getSettingHistory(key: string) {
      return this.repo.getHistory(key);
  }
}