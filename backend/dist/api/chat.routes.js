import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateDto } from '../middleware/validation.middleware.js';
import { CreateGroupDto, CreateDMDto, InviteResponseDto, AddMemberDto, UpdateGroupDto } from '../dto/chat.dto.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/chat/';
        if (!fs.existsSync(uploadPath))
            fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const router = Router();
const controller = new ChatController();
router.use(authenticateToken);
// --- Validated Routes ---
// Create DM
router.post('/dm', validateDto(CreateDMDto), controller.createDM);
// Respond Invite
router.post('/:id/invite-response', validateDto(InviteResponseDto), controller.respondInvite);
// Create Group
router.post('/groups', validateDto(CreateGroupDto), controller.createGroup);
// Add Member
router.post('/:id/members', validateDto(AddMemberDto), controller.addMember);
// Update Group
router.patch('/:id', validateDto(UpdateGroupDto), controller.updateGroup);
// Send Message 
// Note: We skip validateDto here because Multer processes the body before JSON parsing in some configs, 
// and the controller handles the manual DTO construction for content + file.
router.post('/:id/messages', upload.single('file'), controller.sendMessage);
// --- General Routes ---
router.get('/conversations', controller.getMyConversations);
router.get('/:id/messages', controller.getMessages);
router.delete('/messages/:msgId', controller.deleteMessage);
router.get('/messages/:msgId/file', controller.downloadAttachment);
router.delete('/:id/members/:userId', controller.removeMember);
router.delete('/:id', controller.deleteGroup);
router.post('/users/:userId/block', controller.blockUser);
router.delete('/users/:userId/block', controller.unblockUser);
router.get('/blocks', controller.getBlockedList);
router.post('/:id/read', controller.markRead);
export default router;
//# sourceMappingURL=chat.routes.js.map