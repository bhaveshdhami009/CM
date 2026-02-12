import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../services/setting.service.js';
import { AppError } from '../utils/AppError.js';
import { AuthRequest } from '../middleware/auth.middleware.js'; 
import { CreateSettingDto } from '../dto/setting.dto.js'; // Import DTO

export class SettingController {
  private service = new SettingService();

  getByKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.key;
      const value = await this.service.getSettingByKey(key);
      
      if (!value) return next(new AppError('Setting not found', 404));
      
      res.json(value);
    } catch (err) {
      next(err);
    }
  };
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.service.getAllSettings();
      res.json(settings);
    } catch(err) { next(err); }
  }

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Body validation handled by middleware
      const { key } = req.params;
      //const { value, description } = req.body as CreateSettingDto;
      const data = req.body as CreateSettingDto;
      
      //const result = await this.service.updateSetting(key, value, description, req.user!);
      const result = await this.service.updateSetting(key, data, req.user!);
      res.json(result);
    } catch(err) { next(err); }
  }
  
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Manual regex checks removed; DTO handles @Matches
      const data = req.body as CreateSettingDto;
      
      // If key is missing (though DTO might make it optional for updates), verify here for create
      if (!data.key) {
          return next(new AppError('Key is required for creation', 400));
      }

      //const result = await this.service.createSetting(data.key, data.value, data.description, req.user!);
      const result = await this.service.createSetting(data, req.user!);
      res.status(201).json(result);
    } catch(err) { next(err); }
  }
}