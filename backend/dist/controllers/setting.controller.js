import { SettingService } from '../services/setting.service.js';
import { AppError } from '../utils/AppError.js';
export class SettingController {
    constructor() {
        this.service = new SettingService();
        this.getByKey = async (req, res, next) => {
            try {
                const key = req.params.key;
                const value = await this.service.getSettingByKey(key);
                if (!value)
                    return next(new AppError('Setting not found', 404));
                res.json(value);
            }
            catch (err) {
                next(err);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const settings = await this.service.getAllSettings();
                res.json(settings);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                // Body validation handled by middleware
                const { key } = req.params;
                //const { value, description } = req.body as CreateSettingDto;
                const data = req.body;
                //const result = await this.service.updateSetting(key, value, description, req.user!);
                const result = await this.service.updateSetting(key, data, req.user);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                // Manual regex checks removed; DTO handles @Matches
                const data = req.body;
                // If key is missing (though DTO might make it optional for updates), verify here for create
                if (!data.key) {
                    return next(new AppError('Key is required for creation', 400));
                }
                //const result = await this.service.createSetting(data.key, data.value, data.description, req.user!);
                const result = await this.service.createSetting(data, req.user);
                res.status(201).json(result);
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=setting.controller.js.map