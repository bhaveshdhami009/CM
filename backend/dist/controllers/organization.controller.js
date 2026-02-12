import { OrganizationService } from '../services/organization.service.js';
export class OrganizationController {
    constructor() {
        this.service = new OrganizationService();
        this.list = async (req, res, next) => {
            try {
                const filters = {
                    name: req.query.name,
                    address: req.query.address,
                    contact_email: req.query.contact_email,
                    phone: req.query.phone
                };
                const orgs = await this.service.getAll(filters);
                res.json(orgs);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                // Logic removed: validationResult(req) check is done in middleware
                const data = req.body;
                const org = await this.service.onboardOrganization(data);
                res.status(201).json(org);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                // We assume req.body contains partial updates validated by middleware
                const org = await this.service.updateOrganization(id, req.body);
                res.json(org);
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                await this.service.deleteOrganization(id);
                res.json({ message: 'Organization deleted successfully' });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
//# sourceMappingURL=organization.controller.js.map