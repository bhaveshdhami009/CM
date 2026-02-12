import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { PartyService } from '../services/party.service.js';
import { CreatePartyDto } from '../dto/party.dto.js'; // Corrected Import Path
import { AppError } from '../utils/AppError.js';

export class PartyController {
  private service = new PartyService();

  search = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string || '';
      // req.user is guaranteed by the auth middleware
      const results = await this.service.searchParties(query, req.user!);
      res.json(results);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      // Extract Column Filters
      const filters = {
        name: req.query.name as string,
        parentage: req.query.parentage as string,
        mobile: req.query.mobile as string,
        city: req.query.city as string
      };

      const result = await this.service.getParties(req.user!, page, limit, search, filters);
      res.json(result);
    } catch (err) { next(err); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Body validation is handled by validateDto middleware
      const partyData = req.body as CreatePartyDto;

      const party = await this.service.createParty(partyData, req.user!);
      res.status(201).json(party);
    } catch (err: any) {
      next(err);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      // Partial updates allow missing fields
      const partyData = req.body as Partial<CreatePartyDto>;
      
      const party = await this.service.updateParty(id, partyData, req.user!);
      res.json(party);
    } catch (err) { next(err); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteParty(id, req.user!);
      res.json({ message: 'Party deleted' });
    } catch (err) { next(err); }
  };
}