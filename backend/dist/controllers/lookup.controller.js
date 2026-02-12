import { LookupService } from '../services/lookup.service.js';
import { AppError } from '../utils/AppError.js';
export class LookupController {
    constructor() {
        this.lookupService = new LookupService();
        // --- Public / General Lookups ---
        this.getCaseTypes = async (req, res, next) => {
            try {
                const types = await this.lookupService.getAllCaseTypes();
                res.json(types);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDistricts = async (req, res, next) => {
            try {
                const districts = await this.lookupService.getAllDistricts();
                res.json(districts);
            }
            catch (error) {
                next(error);
            }
        };
        this.getCourtsByDistrict = async (req, res, next) => {
            try {
                const districtId = parseInt(req.params.districtId);
                if (isNaN(districtId))
                    return next(new AppError('Invalid District ID', 400));
                const courts = await this.lookupService.getCourtsByDistrict(districtId);
                res.json(courts);
            }
            catch (error) {
                next(error);
            }
        };
        this.getJudges = async (req, res, next) => {
            try {
                const judges = await this.lookupService.getAllJudges();
                res.json(judges);
            }
            catch (error) {
                next(error);
            }
        };
        // --- Master Data Management (Admin) ---
        this.getAllCourts = async (req, res, next) => {
            try {
                const courts = await this.lookupService.getAllCourts();
                res.json(courts);
            }
            catch (err) {
                next(err);
            }
        };
        this.getEstablishmentsByDistrict = async (req, res, next) => {
            try {
                const districtId = parseInt(req.params.districtId);
                if (isNaN(districtId))
                    return next(new AppError('Invalid District ID', 400));
                const list = await this.lookupService.getEstablishmentsByDistrict(districtId);
                res.json(list);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllEstablishments = async (req, res, next) => {
            try {
                const list = await this.lookupService.getAllEstablishments();
                res.json(list);
            }
            catch (err) {
                next(err);
            }
        };
        // --- Save / Delete Handlers (Using DTOs) ---
        // 1. Establishment
        this.saveEstablishment = async (req, res, next) => {
            try {
                const id = req.params.id ? parseInt(req.params.id) : undefined;
                // Validate type
                const data = req.body;
                const result = await this.lookupService.saveEstablishment({ ...data, id });
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.deleteEstablishment = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id))
                    return next(new AppError('Invalid ID', 400));
                await this.lookupService.deleteEstablishment(id);
                res.json({ message: 'Deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        };
        // 2. District
        this.saveDistrict = async (req, res, next) => {
            try {
                const id = req.params.id ? parseInt(req.params.id) : undefined;
                const data = req.body;
                const result = await this.lookupService.saveDistrict({ ...data, id });
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.deleteDistrict = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id))
                    return next(new AppError('Invalid ID', 400));
                await this.lookupService.deleteDistrict(id);
                res.json({ message: 'Deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        };
        // 3. Court
        this.saveCourt = async (req, res, next) => {
            try {
                const id = req.params.id ? parseInt(req.params.id) : undefined;
                const data = req.body;
                const result = await this.lookupService.saveCourt({ ...data, id });
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.deleteCourt = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id))
                    return next(new AppError('Invalid ID', 400));
                await this.lookupService.deleteCourt(id);
                res.json({ message: 'Deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        };
        // 4. Judge
        // Consolidating createJudge and saveJudge into one logic flow if possible, 
        // or keeping separate if routes differ. Assumed standard save:
        this.saveJudge = async (req, res, next) => {
            try {
                const id = req.params.id ? parseInt(req.params.id) : undefined;
                const data = req.body;
                const result = await this.lookupService.saveJudge({ ...data, id });
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.deleteJudge = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id))
                    return next(new AppError('Invalid ID', 400));
                await this.lookupService.deleteJudge(id);
                res.json({ message: 'Deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=lookup.controller.js.map