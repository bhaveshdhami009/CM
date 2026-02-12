import { Request, Response, NextFunction } from 'express';
import { LookupService } from '../services/lookup.service.js';
import { AppError } from '../utils/AppError.js';
import { 
  CreateDistrictDto, 
  CreateCourtDto, 
  CreateEstablishmentDto, 
  CreateJudgeDto 
} from '../dto/lookup.dto.js'; // Import the DTOs

export class LookupController {
  private lookupService = new LookupService();

  // --- Public / General Lookups ---

  getCaseTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await this.lookupService.getAllCaseTypes();
      res.json(types);
    } catch (error) { next(error); }
  };

  getDistricts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const districts = await this.lookupService.getAllDistricts();
      res.json(districts);
    } catch (error) { next(error); }
  };

  getCourtsByDistrict = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const districtId = parseInt(req.params.districtId);
      if (isNaN(districtId)) return next(new AppError('Invalid District ID', 400));
      
      const courts = await this.lookupService.getCourtsByDistrict(districtId);
      res.json(courts);
    } catch (error) { next(error); }
  };
  
  getJudges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const judges = await this.lookupService.getAllJudges();
      res.json(judges);
    } catch (error) { next(error); }
  };

  // --- Master Data Management (Admin) ---

  getAllCourts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courts = await this.lookupService.getAllCourts();
      res.json(courts);
    } catch (err) { next(err); }
  };
  
  getEstablishmentsByDistrict = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const districtId = parseInt(req.params.districtId);
      if (isNaN(districtId)) return next(new AppError('Invalid District ID', 400));
      
      const list = await this.lookupService.getEstablishmentsByDistrict(districtId);
      res.json(list);
    } catch (error) { next(error); }
  };

  getAllEstablishments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const list = await this.lookupService.getAllEstablishments();
        res.json(list);
    } catch (err) { next(err); }
  };

  // --- Save / Delete Handlers (Using DTOs) ---

  // 1. Establishment
  saveEstablishment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id ? parseInt(req.params.id) : undefined;
      // Validate type
      const data = req.body as CreateEstablishmentDto; 
      
      const result = await this.lookupService.saveEstablishment({ ...data, id });
      res.json(result);
    } catch (err) { next(err); }
  };

  deleteEstablishment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return next(new AppError('Invalid ID', 400));

      await this.lookupService.deleteEstablishment(id);
      res.json({ message: 'Deleted successfully' });
    } catch (err) { next(err); }
  };

  // 2. District
  saveDistrict = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id ? parseInt(req.params.id) : undefined;
      const data = req.body as CreateDistrictDto;

      const result = await this.lookupService.saveDistrict({ ...data, id });
      res.json(result);
    } catch (err) { next(err); }
  };

  deleteDistrict = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return next(new AppError('Invalid ID', 400));

      await this.lookupService.deleteDistrict(id);
      res.json({ message: 'Deleted successfully' });
    } catch (err) { next(err); }
  };

  // 3. Court
  saveCourt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id ? parseInt(req.params.id) : undefined;
      const data = req.body as CreateCourtDto;

      const result = await this.lookupService.saveCourt({ ...data, id });
      res.json(result);
    } catch (err) { next(err); }
  };

  deleteCourt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return next(new AppError('Invalid ID', 400));

      await this.lookupService.deleteCourt(id);
      res.json({ message: 'Deleted successfully' });
    } catch (err) { next(err); }
  };

  // 4. Judge
  // Consolidating createJudge and saveJudge into one logic flow if possible, 
  // or keeping separate if routes differ. Assumed standard save:
  saveJudge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id ? parseInt(req.params.id) : undefined;
      const data = req.body as CreateJudgeDto;

      const result = await this.lookupService.saveJudge({ ...data, id });
      res.json(result);
    } catch (err) { next(err); }
  };

  deleteJudge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return next(new AppError('Invalid ID', 400));

      await this.lookupService.deleteJudge(id);
      res.json({ message: 'Deleted successfully' });
    } catch (err) { next(err); }
  };
}