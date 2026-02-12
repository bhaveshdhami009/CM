import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service.js';
import { CreateOrgDto } from '../dto/org.dto.js'; // Corrected Path

export class OrganizationController {
  private service = new OrganizationService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        name: req.query.name as string,
        address: req.query.address as string,
        contact_email: req.query.contact_email as string,
        phone: req.query.phone as string
      };

      const orgs = await this.service.getAll(filters);
      res.json(orgs);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Logic removed: validationResult(req) check is done in middleware
      const data = req.body as CreateOrgDto;
      const org = await this.service.onboardOrganization(data);
      res.status(201).json(org);
    } catch (err) { next(err); }
  };
  
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      // We assume req.body contains partial updates validated by middleware
      const org = await this.service.updateOrganization(id, req.body);
      res.json(org);
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteOrganization(id);
      res.json({ message: 'Organization deleted successfully' });
    } catch (err) { next(err); }
  };
}