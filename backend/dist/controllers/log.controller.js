import { LogService } from '../services/log.service.js';
import { AppError } from '../utils/AppError.js';
import path from 'path';
export class LogController {
    constructor() {
        this.service = new LogService();
        this.getAll = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                if (isNaN(caseId))
                    return next(new AppError('Invalid Case ID', 400));
                const logs = await this.service.getLogs(caseId, req.user);
                res.json(logs);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            // Note: Validation is handled by middleware, BUT since this route usually involves
            // multipart/form-data (file upload), req.body properties often arrive as strings.
            // We construct the DTO manually here to ensure types before passing to Service.
            try {
                const caseId = parseInt(req.params.caseId);
                if (isNaN(caseId))
                    return next(new AppError('Invalid Case ID', 400));
                let extension = null;
                if (req.file) {
                    const ext = path.extname(req.file.originalname);
                    extension = ext ? ext.substring(1) : null; // Remove the dot
                }
                // Handle "true"/"false" strings from FormData
                const rawPending = req.body.is_pending;
                const isPendingBool = String(rawPending).toLowerCase() === 'true' || rawPending === '1' || rawPending === 1;
                // Construct DTO
                const logData = {
                    //case_id: caseId, // Ensure DTO has this if required, or service handles it
                    log_date: req.body.log_date,
                    purpose: req.body.purpose,
                    remarks: req.body.remarks,
                    is_pending: isPendingBool, // Use parsed boolean
                    file_path: req.file ? req.file.path : undefined,
                    file_extension: extension || undefined
                };
                const log = await this.service.addLog(caseId, logData, req.user);
                res.status(201).json(log);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                // 1. Handle File Extension
                let extension = null;
                if (req.file) {
                    const ext = path.extname(req.file.originalname);
                    extension = ext ? ext.substring(1) : null;
                }
                // 2. Handle Boolean Conversion for FormData
                let isPendingBool = undefined;
                if (req.body.is_pending !== undefined) {
                    const raw = req.body.is_pending;
                    isPendingBool = String(raw).toLowerCase() === 'true' || raw === '1' || raw === 1;
                }
                // 3. Construct Payload (Partial Update)
                // We manually map to ensure safety, rather than dumping req.body
                const logData = {
                    ...req.body,
                    ...(isPendingBool !== undefined && { is_pending: isPendingBool }),
                    ...(req.file && { file_path: req.file.path }),
                    ...(req.file && { file_extension: extension })
                };
                const updated = await this.service.updateLog(id, logData, req.user);
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        };
        this.togglePending = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const result = await this.service.togglePendingStatus(id, req.user);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.downloadFile = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                const logId = parseInt(req.params.logId);
                const fileInfo = await this.service.getLogFile(caseId, logId, req.user);
                res.download(fileInfo.path, fileInfo.filename);
            }
            catch (err) {
                next(err);
            }
        };
        this.getCalendar = async (req, res, next) => {
            try {
                const { start, end } = req.query;
                if (!start || !end) {
                    return next(new AppError('Start and End dates are required', 400));
                }
                const events = await this.service.getCalendarEvents(req.user, start, end);
                res.json(events);
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.logId || req.params.id);
                if (isNaN(id))
                    return next(new AppError('Invalid Log ID', 400));
                await this.service.deleteLog(id, req.user);
                res.json({ message: 'Log deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=log.controller.js.map