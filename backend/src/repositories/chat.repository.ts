import { AppDataSource } from '../data-source.js';
import { ChatConversation, ChatType } from '../entities/ChatConversation.js';
import { ChatParticipant, ParticipantStatus } from '../entities/ChatParticipant.js';
import { ChatMessage } from '../entities/ChatMessage.js';
import { UserBlock } from '../entities/UserBlock.js';
import { MoreThan, Not, In } from 'typeorm';

// --- Conversation Repository ---
export class ConversationRepository {
  private repo = AppDataSource.getRepository(ChatConversation);

  async findExistingDM(user1Id: number, user2Id: number) {
    return this.repo.createQueryBuilder('c')
      .innerJoin('c.participants', 'p1')
      .innerJoin('c.participants', 'p2')
      .where('c.type = :type', { type: ChatType.DM })
      .andWhere('p1.user_id = :u1', { u1: user1Id })
      .andWhere('p2.user_id = :u2', { u2: user2Id })
      .getOne();
  }

  async getUserConversations(userId: number) {
    // Subquery optimization to get IDs first
    const participantIds = await AppDataSource.getRepository(ChatParticipant)
      .createQueryBuilder('cp')
      .select('cp.conversation_id')
      .where('cp.user_id = :userId', { userId })
      .andWhere('cp.status != :status', { status: ParticipantStatus.LEFT })
      .getMany();

    if (participantIds.length === 0) return [];

    const ids = participantIds.map(p => p.conversation_id);

    return this.repo.find({
      where: { id: In(ids) },
      relations: {
        participants: { user: true }
      },
      select: {
        id: true, type: true, name: true, description: true,
        min_role_read: true, min_role_write: true, created_at: true,
        organization_id: true,
        participants: {
          id: true, user_id: true, is_admin: true, status: true, last_read_at: true,
          user: {
            id: true, full_name: true, email: true, role: true, accent: true
          }
        }
      }
    });
  }
  
  async findOneBy(criteria: any) { return this.repo.findOneBy(criteria); }
  async findOne(options: any) { return this.repo.findOne(options); }
  async save(entity: any) { return this.repo.save(entity); }
  async remove(entity: any) { return this.repo.remove(entity); }
}

// --- Participant Repository ---
export class ParticipantRepository {
  private repo = AppDataSource.getRepository(ChatParticipant);

  async findMember(convoId: number, userId: number) {
    return this.repo.findOne({
      where: { conversation_id: convoId, user_id: userId },
      relations: ['user']
    });
  }

  async findOtherDMMember(convoId: number, myUserId: number) {
    return this.repo.findOne({
      where: { conversation_id: convoId, user_id: Not(myUserId) }
    });
  }
  
  async findOneBy(criteria: any) { return this.repo.findOneBy(criteria); }
  async save(entity: any) { return this.repo.save(entity); }
  async delete(criteria: any) { return this.repo.delete(criteria); }
}

// --- Message Repository ---
export class MessageRepository {
  private repo = AppDataSource.getRepository(ChatMessage);

  async countUnread(convoId: number, userId: number, lastReadAt: Date) {
    return this.repo.count({
      where: { 
        conversation_id: convoId,
        created_at: MoreThan(lastReadAt),
        sender_id: Not(userId) 
      }
    });
  }

  async getRecentMessages(convoId: number, limit: number, offset: number) {
    const messages = await this.repo.find({
      where: { conversation_id: convoId },
      relations: { sender: true },
      select: {
        id: true, content: true, file_path: true, file_type: true, created_at: true,
        sender: {
          id: true, full_name: true, email: true, accent: true
        }
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset
    });
    return messages.reverse();
  }

  async getLastMessage(convoId: number) {
    return this.repo.findOne({
      where: { conversation_id: convoId },
      order: { created_at: 'DESC' },
      relations: { sender: true },
      select: {
        id: true, content: true, created_at: true, sender_id: true,
        sender: { id: true, full_name: true }
      }
    });
  }
  
  async findOne(options: any) { return this.repo.findOne(options); }
  async save(entity: any) { return this.repo.save(entity); }
}

// --- Block Repository ---
export class BlockRepository {
  private repo = AppDataSource.getRepository(UserBlock);

  async hasBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    const block = await this.repo.findOneBy({ 
      blocker_id: blockerId, 
      blocked_id: blockedId 
    });
    return !!block;
  }
  
  async create(data: any) { return this.repo.create(data); }
  async save(entity: any) { return this.repo.save(entity); }
  async find(options: any) { return this.repo.find(options); }
  async delete(criteria: any) { return this.repo.delete(criteria); }
  async findOne(options: any) { return this.repo.findOne(options); }
}