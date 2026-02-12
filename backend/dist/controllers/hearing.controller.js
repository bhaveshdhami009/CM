import { HearingService } from '../services/hearing.service.js';
import { AppError } from '../utils/AppError.js';
export class HearingController {
    constructor() {
        this.service = new HearingService();
        this.getAll = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                if (isNaN(caseId))
                    return next(new AppError('Invalid Case ID', 400));
                const hearings = await this.service.getHearings(caseId, req.user);
                res.json(hearings);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                if (isNaN(caseId))
                    return next(new AppError('Invalid Case ID', 400));
                // Middleware handles validation
                const hearingData = req.body;
                const hearing = await this.service.addHearing(caseId, hearingData, req.user);
                res.status(201).json(hearing);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const hearingData = req.body;
                const updated = await this.service.updateHearing(id, hearingData, req.user);
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                await this.service.deleteHearing(id, req.user);
                res.json({ message: 'Hearing deleted' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=hearing.controller.js.map