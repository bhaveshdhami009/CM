import { DistrictRepository } from '../repositories/district.repository.js';
import { CourtRepository } from '../repositories/court.repository.js';
import { JudgeRepository } from '../repositories/judge.repository.js';
import { SettingRepository } from '../repositories/setting.repository.js';
import { EstablishmentRepository } from '../repositories/establishment.repository.js';
import { AppError } from '../utils/AppError.js';
export class LookupService {
    constructor() {
        this.districtRepo = new DistrictRepository();
        this.courtRepo = new CourtRepository();
        this.judgeRepo = new JudgeRepository();
        this.settingRepo = new SettingRepository();
        this.establishmentRepo = new EstablishmentRepository();
    }
    // --- GETTERS ---
    async getAllCaseTypes() {
        const setting = await this.settingRepo.findByKey('case_types');
        return setting ? setting.value : [];
    }
    async getAllDistricts() {
        return this.districtRepo.findAll();
    }
    async getCourtsByDistrict(districtId) {
        return this.courtRepo.findByDistrict(districtId);
    }
    async getAllCourts() {
        return this.courtRepo.findAll();
    }
    async getAllJudges() {
        return this.judgeRepo.findAll();
    }
    async getEstablishmentsByDistrict(districtId) {
        return this.establishmentRepo.findByDistrict(districtId);
    }
    async getAllEstablishments() {
        return this.establishmentRepo.findAll();
    }
    // --- DISTRICT MANAGEMENT ---
    // Handle Create (id undefined) or Update (id present)
    async saveDistrict(data, id) {
        // If updating, we could add checks here (e.g. check if name exists in another ID)
        return this.districtRepo.save({ ...data, id });
    }
    async deleteDistrict(id) {
        // Foreign Key constraints in DB will prevent deletion if courts exist.
        // We rely on DB error or we can pre-check count if we want a custom error message.
        return this.districtRepo.delete(id);
    }
    // --- COURT MANAGEMENT ---
    async saveCourt(data, id) {
        // Verify district exists to maintain integrity
        const district = await this.districtRepo.findById(data.district_id);
        if (!district)
            throw new AppError('Invalid District ID', 400);
        return this.courtRepo.save({ ...data, id });
    }
    async deleteCourt(id) {
        return this.courtRepo.delete(id);
    }
    // --- ESTABLISHMENT MANAGEMENT ---
    async saveEstablishment(data, id) {
        // FIX: Verify district exists (was missing in previous code)
        const district = await this.districtRepo.findById(data.district_id);
        if (!district)
            throw new AppError('Invalid District ID', 400);
        return this.establishmentRepo.save({ ...data, id });
    }
    async deleteEstablishment(id) {
        return this.establishmentRepo.delete(id);
    }
    // --- JUDGE MANAGEMENT ---
    async saveJudge(data, id) {
        return this.judgeRepo.save({ ...data, id });
    }
    async deleteJudge(id) {
        return this.judgeRepo.delete(id);
    }
}
//# sourceMappingURL=lookup.service.js.map