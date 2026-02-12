import { ExecutionService } from '../services/execution.service.js';
export class ExecutionController {
    constructor() {
        this.service = new ExecutionService();
        this.start = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                // Validated body from middleware
                const data = req.body;
                const result = await this.service.startExecution(caseId, data, req.user);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        // NEW: Update
        this.update = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                const data = req.body;
                const result = await this.service.updateExecution(caseId, data, req.user);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        // NEW: Hard Delete
        this.delete = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                await this.service.deleteExecution(caseId, req.user);
                res.json({ message: 'Execution record deleted' });
            }
            catch (err) {
                next(err);
            }
        };
        this.completeCycle = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                // Optional remarks
                const { remarks } = req.body;
                const result = await this.service.markCycleComplete(caseId, req.user, remarks);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.stop = async (req, res, next) => {
            try {
                const caseId = parseInt(req.params.caseId);
                await this.service.stopExecution(caseId, req.user);
                res.json({ message: 'Execution stopped' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=execution.controller.js.map