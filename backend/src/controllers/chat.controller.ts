import { Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AppDataSource } from '../data-source.js'; 
import { ChatConversation } from '../entities/ChatConversation.js';
import { 
  CreateGroupDto, 
  CreateDMDto, 
  InviteResponseDto, 
  AddMemberDto, 
  UpdateGroupDto,
  SendMessageDto 
} from '../dto/chat.dto.js'; // Import DTOs

export class ChatController {
  private service = new ChatService();

  getMyConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const list = await this.service.getMyConversations(req.user!.id);
      res.json(list);
    } catch(err) { next(err); }
  }

  createGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateGroupDto;
      const group = await this.service.createGroup(data, req.user!);
      
      if (!group) return;
      
      const io = (req as any).io;
      if (io && group.participants) {
          group.participants.forEach((p: any) => {
              if (p.user_id !== req.user!.id) {
                  io.to(`user_${p.user_id}`).emit('refresh_conversations');
              }
          });
      }
      
      res.status(201).json(group);
    } catch(err) { next(err); }
  }
  
  getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const convoId = parseInt(req.params.id);
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
        
        const msgs = await this.service.getMessages(convoId, req.user!, limit, offset);
        res.json(msgs);
    } catch(err) { next(err); }
  }

  sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const convoId = parseInt(req.params.id);
      // Optional: Cast body if needed, though SendMessageDto is loose
      const { content } = req.body; 
      const file = req.file ? req.file.path : undefined;

      const msg: any = await this.service.sendMessage(convoId, content, file, req.user!);
      
      if (msg.is_silent_discard) {
          return res.status(201).json(msg);
      }

      msg.sender = {
        id: req.user!.id,
        full_name: req.user!.full_name,
        email: req.user!.email
      };

      const io = (req as any).io;
      if (io) {
        io.to(`room_${convoId}`).emit('receive_message', msg);

        // Fetch participants to notify unread badges
        // Optimization: Use QueryBuilder or Repo here if available, but standard Repo is fine for simple relation fetch
        const convoRepo = AppDataSource.getRepository(ChatConversation);
        const convo = await convoRepo.findOne({
            where: { id: convoId },
            relations: { participants: true }
        });

        if (convo && convo.participants) {
            convo.participants.forEach((p) => {
                if (p.user_id !== req.user!.id) {
                    io.to(`user_${p.user_id}`).emit('receive_message', msg);
                }
            });
        }
      }

      res.status(201).json(msg);
    } catch(err) { next(err); }
  }
  
  markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const convoId = parseInt(req.params.id);
      await this.service.markAsRead(convoId, req.user!.id);
      res.json({ success: true });
    } catch(err) { next(err); }
  }
  
  createDM = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateDMDto;
      const convo = await this.service.createDM(data, req.user!);
      
      if (!convo) return;
      
      const io = (req as any).io;
      if (io && convo.participants) {
          convo.participants.forEach((p: any) => {
              if (p.user_id !== req.user!.id) {
                  io.to(`user_${p.user_id}`).emit('refresh_conversations');
              }
          });
      }

      res.status(201).json(convo);
    } catch(err) { next(err); }
  }

  respondInvite = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const convoId = parseInt(req.params.id);
      const data = req.body as InviteResponseDto;
      const result = await this.service.respondToInvite(convoId, data.status, req.user!);
      res.json(result);
    } catch(err) { next(err); }
  }

  blockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const targetId = parseInt(req.params.userId);
      await this.service.blockUser(targetId, req.user!);
      res.json({ message: 'User blocked' });
    } catch(err) { next(err); }
  }
  
  unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const targetId = parseInt(req.params.userId);
      await this.service.unblockUser(targetId, req.user!);
      res.json({ message: 'User unblocked' });
    } catch(err) { next(err); }
  }
  
  getBlockedList = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ids = await this.service.getBlockedUsers(req.user!.id);
      res.json(ids);
    } catch(err) { next(err); }
  }
  
  deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const msgId = parseInt(req.params.msgId);
      const updatedMsg = await this.service.deleteMessage(msgId, req.user!);
      
      const io = (req as any).io;
      if (io) io.to(`room_${updatedMsg.conversation_id}`).emit('message_deleted', updatedMsg);
      
      res.json(updatedMsg);
    } catch(err) { next(err); }
  }

  addMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const convoId = parseInt(req.params.id);
      const data = req.body as AddMemberDto;
      
      await this.service.addGroupMember(convoId, data.userId, req.user!);
      
      const io = (req as any).io;
      if (io) {
          io.to(`user_${data.userId}`).emit('refresh_conversations');
      }

      res.json({ success: true });
    } catch(err) { next(err); }
  }

  removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const convoId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      await this.service.removeGroupMember(convoId, userId, req.user!);
      
      const io = (req as any).io;
      if (io) {
          io.to(`user_${userId}`).emit('refresh_conversations');
      }

      res.json({ success: true, userId });
    } catch(err) { next(err); }
  }

  downloadAttachment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const msgId = parseInt(req.params.msgId);
      const fileData = await this.service.getAttachment(msgId, req.user!);
      res.download(fileData.path, fileData.filename);
    } catch(err) { next(err); }
  }
  
  updateGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const convoId = parseInt(req.params.id);
      const data = req.body as UpdateGroupDto;
      const updated = await this.service.updateGroup(convoId, data, req.user!);
      res.json(updated);
    } catch(err) { next(err); }
  }

  deleteGroup = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const convoId = parseInt(req.params.id);
      await this.service.deleteConversation(convoId, req.user!);
      res.json({ message: 'Group deleted' });
    } catch(err) { next(err); }
  }
}