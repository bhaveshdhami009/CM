import { AppDataSource } from '../data-source.js';
import { ChatConversation, ChatType } from '../entities/ChatConversation.js';
import { ChatParticipant, ParticipantStatus } from '../entities/ChatParticipant.js';
import { ChatMessage } from '../entities/ChatMessage.js';
import { User } from '../entities/User.js';
import { AppError } from '../utils/AppError.js';
import { MoreThanOrEqual } from 'typeorm';
import { ROLES } from '../config/roles.js';
import path from 'path';
import fs from 'fs';
// Import Custom Repositories
import { ConversationRepository, ParticipantRepository, MessageRepository, BlockRepository } from '../repositories/chat.repository.js';
export class ChatService {
    constructor() {
        // Instantiate Repositories
        this.convoRepo = new ConversationRepository();
        this.partRepo = new ParticipantRepository();
        this.msgRepo = new MessageRepository();
        this.blockRepo = new BlockRepository();
        this.userRepo = AppDataSource.getRepository(User);
    }
    // --- ACTIONS ---
    async createDM(identifier, creator) {
        let targetUser = null;
        if (identifier.targetUserId) {
            targetUser = await this.userRepo.findOneBy({ id: identifier.targetUserId });
        }
        else if (identifier.email) {
            targetUser = await this.userRepo.findOneBy({ email: identifier.email });
        }
        if (!targetUser)
            throw new AppError('User not found', 404);
        if (creator.id === targetUser.id)
            throw new AppError("Cannot chat with yourself", 400);
        const isAdmin = creator.role >= ROLES.ORG_ADMIN;
        if (!isAdmin) {
            // FIX: Use this.blockRepo (Instance)
            const isBlocked = await this.blockRepo.hasBlocked(targetUser.id, creator.id);
            const iBlocked = await this.blockRepo.hasBlocked(creator.id, targetUser.id);
            if (isBlocked || iBlocked)
                throw new AppError('Cannot start chat. Block restrictions apply.', 403);
        }
        // FIX: Use this.convoRepo
        const existing = await this.convoRepo.findExistingDM(creator.id, targetUser.id);
        if (existing)
            return existing;
        // Create (Transaction)
        return AppDataSource.manager.transaction(async (manager) => {
            const convo = new ChatConversation();
            convo.type = ChatType.DM;
            convo.organization_id = creator.organization_id;
            const savedConvo = await manager.save(convo);
            const p1 = new ChatParticipant();
            p1.conversation = savedConvo;
            p1.user_id = creator.id;
            p1.status = ParticipantStatus.ACTIVE;
            await manager.save(p1);
            const p2 = new ChatParticipant();
            p2.conversation = savedConvo;
            p2.user_id = targetUser.id;
            p2.status = isAdmin ? ParticipantStatus.ACTIVE : ParticipantStatus.PENDING;
            await manager.save(p2);
            // Return with relations using Transaction Manager
            return await manager.findOne(ChatConversation, {
                where: { id: savedConvo.id },
                relations: ['participants', 'participants.user']
            });
        });
    }
    async sendMessage(convoId, content, filePath, user) {
        // FIX: Use this.convoRepo
        const convo = await this.convoRepo.findOne({ where: { id: convoId } });
        if (!convo)
            throw new AppError('Conversation not found', 404);
        // FIX: Use this.partRepo
        const senderPart = await this.partRepo.findMember(convoId, user.id);
        if (!senderPart || senderPart.status === ParticipantStatus.LEFT) {
            throw new AppError('You are not a member of this chat', 403);
        }
        if (convo.type === ChatType.DM) {
            // FIX: Use this.partRepo
            const otherPart = await this.partRepo.findOtherDMMember(convoId, user.id);
            if (otherPart) {
                const isAdmin = user.role >= ROLES.ORG_ADMIN;
                // FIX: Use this.blockRepo
                const isBlocked = await this.blockRepo.hasBlocked(otherPart.user_id, user.id);
                if (isBlocked && !isAdmin) {
                    return {
                        id: -1,
                        content,
                        conversation_id: convoId,
                        created_at: new Date(),
                        sender: user,
                        is_silent_discard: true
                    };
                }
                // Auto-Activate Logic:
                senderPart.last_read_at = new Date();
                if (senderPart.status !== ParticipantStatus.ACTIVE) {
                    senderPart.status = ParticipantStatus.ACTIVE;
                    await this.partRepo.save(senderPart);
                }
                // Reset Other to Pending if Rejected
                if (otherPart.status === ParticipantStatus.REJECTED) {
                    otherPart.status = ParticipantStatus.PENDING;
                    await this.partRepo.save(otherPart);
                }
            }
        }
        if (convo.type === ChatType.GROUP) {
            if (user.role < convo.min_role_write)
                throw new AppError('Read Only', 403);
        }
        const msg = new ChatMessage();
        msg.conversation = convo;
        msg.sender = user;
        msg.content = content;
        msg.file_path = filePath;
        // FIX: Use this.msgRepo
        return this.msgRepo.save(msg);
    }
    async markAsRead(convoId, userId) {
        const part = await this.partRepo.findMember(convoId, userId);
        if (!part)
            return;
        part.last_read_at = new Date();
        await this.partRepo.save(part);
    }
    // --- GROUP ACTIONS ---
    async createGroup(data, creator) {
        return AppDataSource.manager.transaction(async (manager) => {
            const convo = new ChatConversation();
            convo.type = ChatType.GROUP;
            convo.name = data.name;
            convo.description = data.description;
            convo.organization_id = creator.organization_id;
            convo.min_role_read = data.min_role_read || ROLES.VIEWER;
            convo.min_role_write = data.min_role_write || ROLES.VIEWER;
            const savedConvo = await manager.save(convo);
            const addParticipant = async (userId, isAdmin) => {
                const p = new ChatParticipant();
                p.conversation = savedConvo;
                p.user_id = userId;
                p.is_admin = isAdmin;
                p.status = ParticipantStatus.ACTIVE;
                await manager.save(p);
            };
            await addParticipant(creator.id, true);
            // Auto-add Org Admins
            const orgAdmins = await this.userRepo.find({
                where: {
                    organization_id: creator.organization_id,
                    role: ROLES.ORG_ADMIN
                }
            });
            for (const admin of orgAdmins) {
                if (admin.id !== creator.id)
                    await addParticipant(admin.id, true);
            }
            // Add Members
            let usersToAdd = [];
            if (data.memberIds && data.memberIds.length > 0) {
                usersToAdd = data.memberIds;
            }
            else if (data.auto_add_role) {
                const eligibleUsers = await this.userRepo.find({
                    where: {
                        organization_id: creator.organization_id,
                        role: MoreThanOrEqual(data.auto_add_role)
                    },
                    select: ['id']
                });
                usersToAdd = eligibleUsers.map(u => u.id);
            }
            for (const uid of usersToAdd) {
                const isOrgAdmin = orgAdmins.some(a => a.id === uid);
                if (uid === creator.id || isOrgAdmin)
                    continue;
                const part = new ChatParticipant();
                part.conversation = savedConvo;
                part.user_id = uid;
                part.is_admin = false;
                part.status = (creator.role >= ROLES.ORG_ADMIN) ? ParticipantStatus.ACTIVE : ParticipantStatus.PENDING;
                await manager.save(part);
            }
            // Return with relations using Transaction Manager
            return await manager.findOne(ChatConversation, {
                where: { id: savedConvo.id },
                relations: ['participants', 'participants.user']
            });
        });
    }
    async respondToInvite(convoId, status, user) {
        const participant = await this.partRepo.findMember(convoId, user.id);
        if (!participant)
            throw new AppError('Invite not found', 404);
        if (participant.status !== ParticipantStatus.PENDING)
            throw new AppError('Invite already processed', 400);
        if (status === 'REJECT') {
            participant.status = ParticipantStatus.REJECTED;
            const senderPart = await this.partRepo.findOtherDMMember(convoId, user.id);
            if (senderPart) {
                await this.blockUser(senderPart.user_id, user);
            }
        }
        else {
            participant.status = ParticipantStatus.ACTIVE;
        }
        return this.partRepo.save(participant);
    }
    async addGroupMember(convoId, targetUserId, actor) {
        const convo = await this.convoRepo.findOne({ where: { id: convoId } });
        if (!convo || convo.type !== ChatType.GROUP)
            throw new AppError('Invalid Group', 400);
        const actorPart = await this.partRepo.findMember(convoId, actor.id);
        const isOrgAdmin = actor.role >= ROLES.ORG_ADMIN;
        const isGroupAdmin = actorPart && actorPart.is_admin;
        if (!isOrgAdmin && !isGroupAdmin)
            throw new AppError('Access Denied', 403);
        const existing = await this.partRepo.findMember(convoId, targetUserId);
        if (existing) {
            if (existing.status !== ParticipantStatus.ACTIVE) {
                existing.status = ParticipantStatus.ACTIVE;
                return this.partRepo.save(existing);
            }
            return existing;
        }
        const newPart = new ChatParticipant();
        newPart.conversation = convo;
        newPart.user_id = targetUserId;
        newPart.is_admin = false;
        newPart.status = ParticipantStatus.ACTIVE;
        return this.partRepo.save(newPart);
    }
    async removeGroupMember(convoId, targetUserId, actor) {
        const convo = await this.convoRepo.findOne({ where: { id: convoId } });
        if (!convo || convo.type !== ChatType.GROUP)
            throw new AppError('Invalid Group', 400);
        const actorPart = await this.partRepo.findMember(convoId, actor.id);
        const isActorOrgAdmin = actor.role >= ROLES.ORG_ADMIN;
        const isActorGroupAdmin = actorPart && actorPart.is_admin;
        if (actor.id !== targetUserId) {
            if (!isActorOrgAdmin && !isActorGroupAdmin)
                throw new AppError('Access Denied', 403);
        }
        const targetUser = await this.userRepo.findOneBy({ id: targetUserId });
        if (targetUser && targetUser.role >= ROLES.ORG_ADMIN && actor.id !== targetUserId) {
            throw new AppError('Cannot remove an Organization Admin', 403);
        }
        return this.partRepo.delete({ conversation_id: convoId, user_id: targetUserId });
    }
    // --- RETRIEVAL ---
    async getMyConversations(userId) {
        // 1. Get Base Conversations
        const conversations = await this.convoRepo.getUserConversations(userId);
        const results = [];
        // 2. Iterate to attach dynamic data
        for (const convo of conversations) {
            const myPart = convo.participants.find(p => p.user_id === userId);
            if (!myPart)
                continue;
            // Use this.msgRepo
            const lastMsg = await this.msgRepo.getLastMessage(convo.id);
            const unreadCount = await this.msgRepo.countUnread(convo.id, userId, myPart.last_read_at);
            results.push({
                ...convo,
                last_message: lastMsg,
                unread_count: unreadCount,
                my_last_read_at: myPart.last_read_at
            });
        }
        return results.sort((a, b) => {
            const dateA = a.last_message?.created_at || a.created_at;
            const dateB = b.last_message?.created_at || b.created_at;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    }
    async getMessages(convoId, user, limit = 20, offset = 0) {
        const isMember = await this.partRepo.findMember(convoId, user.id);
        // Removed strict check for Rejected users so they can still see history
        if (!isMember)
            throw new AppError('Access Denied', 403);
        return this.msgRepo.getRecentMessages(convoId, limit, offset);
    }
    // --- BLOCKING ---
    async blockUser(targetId, user) {
        if (targetId === user.id)
            throw new AppError("Cannot block yourself", 400);
        // Use this.blockRepo
        const isBlocked = await this.blockRepo.hasBlocked(user.id, targetId);
        if (isBlocked)
            return;
        const block = this.blockRepo.create({
            blocker_id: user.id,
            blocked_id: targetId
        });
        return this.blockRepo.save(block);
    }
    async unblockUser(targetId, user) {
        await this.blockRepo.delete({
            blocker_id: user.id,
            blocked_id: targetId
        });
        const convo = await this.convoRepo.findExistingDM(user.id, targetId);
        if (convo) {
            const actorPart = await this.partRepo.findMember(convo.id, user.id);
            if (actorPart) {
                actorPart.status = ParticipantStatus.ACTIVE;
                await this.partRepo.save(actorPart);
            }
            const targetPart = await this.partRepo.findMember(convo.id, targetId);
            if (targetPart) {
                targetPart.status = ParticipantStatus.PENDING;
                await this.partRepo.save(targetPart);
            }
        }
    }
    async getBlockedUsers(userId) {
        const blocks = await this.blockRepo.find({
            where: { blocker_id: userId },
            select: ['blocked_id']
        });
        return blocks.map(b => b.blocked_id);
    }
    // --- MISC ---
    async updateGroup(convoId, data, user) {
        const convo = await this.convoRepo.findOne({ where: { id: convoId } });
        if (!convo)
            throw new AppError('Conversation not found', 404);
        const part = await this.partRepo.findMember(convoId, user.id);
        const isOrgAdmin = user.role >= ROLES.ORG_ADMIN;
        const isGroupAdmin = part && part.is_admin;
        if (!isOrgAdmin && !isGroupAdmin)
            throw new AppError('Access Denied', 403);
        if (data.name)
            convo.name = data.name;
        if (data.description)
            convo.description = data.description;
        if (data.min_role_read !== undefined)
            convo.min_role_read = data.min_role_read;
        if (data.min_role_write !== undefined)
            convo.min_role_write = data.min_role_write;
        return this.convoRepo.save(convo);
    }
    async deleteConversation(convoId, user) {
        const convo = await this.convoRepo.findOne({ where: { id: convoId } });
        if (!convo)
            throw new AppError('Conversation not found', 404);
        const part = await this.partRepo.findMember(convoId, user.id);
        const isOrgAdmin = user.role >= ROLES.ORG_ADMIN;
        const isGroupAdmin = part && part.is_admin;
        if (!isOrgAdmin && !isGroupAdmin)
            throw new AppError('Access Denied', 403);
        return this.convoRepo.remove(convo);
    }
    async deleteMessage(msgId, user) {
        const msg = await this.msgRepo.findOne({
            where: { id: msgId },
            relations: { sender: true }
        });
        if (!msg)
            throw new AppError('Message not found', 404);
        if (msg.sender.id !== user.id)
            throw new AppError('Cannot delete others messages', 403);
        msg.content = '🚫 This message was deleted';
        msg.file_path = undefined;
        return this.msgRepo.save(msg);
    }
    async getAttachment(msgId, user) {
        const msg = await this.msgRepo.findOne({
            where: { id: msgId },
            relations: { conversation: true }
        });
        if (!msg || !msg.file_path)
            throw new AppError('File not found', 404);
        const isMember = await this.partRepo.findMember(msg.conversation.id, user.id);
        if (user.role !== ROLES.PLATFORM_ADMIN && !isMember) {
            throw new AppError('Access Denied', 403);
        }
        const absolutePath = path.resolve(msg.file_path);
        if (!absolutePath.includes('uploads'))
            throw new AppError('Invalid file path', 400);
        if (!fs.existsSync(absolutePath))
            throw new AppError('File missing on disk', 404);
        return { path: absolutePath, filename: path.basename(msg.file_path) };
    }
}
//# sourceMappingURL=chat.service.js.map