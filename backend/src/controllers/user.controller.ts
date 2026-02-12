import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { UserService } from '../services/user.service.js';
import { CreateTeamMemberDto, UpdateProfileDto } from '../dto/user.dto.js'; // Import DTOs

export class UserController {
  private service = new UserService();

  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters = {
        name: req.query.name as string,
        email: req.query.email as string,
        role: req.query.role ? parseInt(req.query.role as string) : undefined
      };

      const users = await this.service.getTeamMembers(req.user!, filters);
      res.json(users);
    } catch (err) { next(err); }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Body is guaranteed valid by middleware
      const data = req.body as CreateTeamMemberDto;
      
      const user = await this.service.addTeamMember(data, req.user!);
      res.status(201).json(user);
    } catch (err) { next(err); }
  };
  
  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      const data = req.body as Partial<CreateTeamMemberDto>;
      
      const updatedUser = await this.service.updateTeamMember(req.user!, userId, data);
      res.json(updatedUser);
    } catch (err) { next(err); }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.id);
      await this.service.removeTeamMember(userId, req.user!);
      res.json({ message: 'User removed successfully' });
    } catch (err) { next(err); }
  };
  
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Body is guaranteed valid by middleware
      const data = req.body as UpdateProfileDto;
      
      const updatedUser = await this.service.updateProfile(req.user!.id, data);
      res.json(updatedUser);
    } catch (err) { next(err); }
  };
}