import { DistrictRepository } from '../repositories/district.repository.js';
import { CourtRepository } from '../repositories/court.repository.js';
import { JudgeRepository } from '../repositories/judge.repository.js';
import { SettingRepository } from '../repositories/setting.repository.js';
import { EstablishmentRepository } from '../repositories/establishment.repository.js';
import { AppError } from '../utils/AppError.js';

// Import DTOs
import { 
  CreateDistrictDto, 
  CreateCourtDto, 
  CreateEstablishmentDto, 
  CreateJudgeDto 
} from '../dto/lookup.dto.js';

export class LookupService {
  private districtRepo = new DistrictRepository();
  private courtRepo = new CourtRepository();
  private judgeRepo = new JudgeRepository();
  private settingRepo = new SettingRepository();
  private establishmentRepo = new EstablishmentRepository();

  // --- GETTERS ---

  async getAllCaseTypes() {
    const setting = await this.settingRepo.findByKey('case_types');
    return setting ? setting.value : [];
  }

  async getAllDistricts() {
    return this.districtRepo.findAll();
  }

  async getCourtsByDistrict(districtId: number) {
    return this.courtRepo.findByDistrict(districtId);
  }

  async getAllCourts() {
    return this.courtRepo.findAll();
  }

  async getAllJudges() {
    return this.judgeRepo.findAll();
  }
  
  async getEstablishmentsByDistrict(districtId: number) {
    return this.establishmentRepo.findByDistrict(districtId);
  }
  
  async getAllEstablishments() {
    return this.establishmentRepo.findAll();
  }

  // --- DISTRICT MANAGEMENT ---

  // Handle Create (id undefined) or Update (id present)
  async saveDistrict(data: CreateDistrictDto, id?: number) {
    // If updating, we could add checks here (e.g. check if name exists in another ID)
    return this.districtRepo.save({ ...data, id });
  }

  async deleteDistrict(id: number) {
    // Foreign Key constraints in DB will prevent deletion if courts exist.
    // We rely on DB error or we can pre-check count if we want a custom error message.
    return this.districtRepo.delete(id);
  }

  // --- COURT MANAGEMENT ---

  async saveCourt(data: CreateCourtDto, id?: number) {
    // Verify district exists to maintain integrity
    const district = await this.districtRepo.findById(data.district_id);
    if (!district) throw new AppError('Invalid District ID', 400);

    return this.courtRepo.save({ ...data, id });
  }

  async deleteCourt(id: number) {
    return this.courtRepo.delete(id);
  }

  // --- ESTABLISHMENT MANAGEMENT ---

  async saveEstablishment(data: CreateEstablishmentDto, id?: number) {
    // FIX: Verify district exists (was missing in previous code)
    const district = await this.districtRepo.findById(data.district_id);
    if (!district) throw new AppError('Invalid District ID', 400);

    return this.establishmentRepo.save({ ...data, id });
  }

  async deleteEstablishment(id: number) {
    return this.establishmentRepo.delete(id);
  }

  // --- JUDGE MANAGEMENT ---

  async saveJudge(data: CreateJudgeDto, id?: number) {
    return this.judgeRepo.save({ ...data, id });
  }

  async deleteJudge(id: number) {
    return this.judgeRepo.delete(id);
  }
}