import { DashboardService } from '../services/dashboard.service.js';
import { AppError } from '../utils/AppError.js';
export class DashboardController {
    constructor() {
        this.service = new DashboardService();
        this.getStats = async (req, res, next) => {
            try {
                const { start, end } = req.query;
                if (!start || !end)
                    return next(new AppError('Date range required', 400));
                const stats = await this.service.getStats(req.user.organization_id, String(start), String(end));
                res.json(stats);
            }
            catch (err) {
                next(err);
            }
        };
        this.getWidgets = async (req, res, next) => {
            try {
                const widgets = await this.service.getWidgets(req.user);
                res.json(widgets);
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=dashboard.controller.js.map