import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat'; 
import { AuthService } from '../../core/services/auth'; 
import { UserService } from '../../core/services/user'; 
import { 
  ConversationDto, 
  ChatMessageDto, 
  CreateGroupDto, 
  CreateDMDto, 
  UpdateGroupDto,
  InviteStatus 
} from '../../shared/models/dtos';
import { Subscription } from 'rxjs';
import { ROLES } from '../../core/config/roles';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  conversations: ConversationDto[] = [];
  selectedConvo: any | null = null; 
  messages: ChatMessageDto[] = [];
  
  // Modal States
  showDetailsModal = false;
  showNewChatModal = false;
  isGroupMode = false;
  
  showInviteMessageModal = false;
  inviteMessageText = '';
  pendingInvitePayload: CreateDMDto | null = null; // Typed
  
  blockedUserIds: number[] = [];
  isBlockedByMe = false;
  
  inviteEmail = '';
  currentUserRole = 1;
  
  // Group Form Data (Bound to ngModel)
  groupForm = {
    name: '',
    min_role_read: ROLES.VIEWER, 
    min_role_write: ROLES.VIEWER, 
    auto_add_role: null as number | null 
  };
  groupCreationMethod: 'ROLE' | 'MANUAL' = 'MANUAL';
  
  // UI Data
  currentUser_id: number = 0;
  messageText = '';
  selectedFile: File | null = null;
  availableUsers: any[] = []; 
  selectedMemberIds: number[] = [];
  
  messageOffset = 0;
  messageLimit = 20;
  hasMoreMessages = true;
  isLoadingMessages = false;
  
  private subscriptions: Subscription[] = [];

  roleOptions = [
    { label: 'Everyone (Viewers+)', value: ROLES.VIEWER },
    { label: 'Editors & Admins', value: ROLES.EDITOR },
    { label: 'Admins Only', value: ROLES.ORG_ADMIN }
  ];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private ngZone: NgZone 
  ) {}

  ngOnInit() {
      const user = this.authService.currentUser();
      this.currentUser_id = user ? user.id : 0;
      this.currentUserRole = user ? user.role : 1; 
      
      // FIX 1: Editor is 5. Check role correctly.
      if (this.currentUserRole > 5) {
          this.loadTeam();
      }
      
      this.fetchBlockedUsers();
      this.chatService.connect();

      // --- SUBSCRIPTIONS ---

      const sub1 = this.chatService.messageReceived$.subscribe((msg) => {
        this.ngZone.run(() => {
          if (this.selectedConvo && msg.conversation_id === this.selectedConvo.id) {
              if (msg.sender.id !== this.currentUser_id) {
                // De-duplicate check
                const exists = this.messages.some(m => m.id === msg.id);
                  if (!exists) {
                      this.messages.push(msg);
                      this.scrollToBottom();
                      this.chatService.markAsRead(this.selectedConvo.id).subscribe();
                  }
              }
          } 
          else {
              const convo = this.conversations.find(c => c.id === msg.conversation_id);
              if (convo) {
                  convo.unread_count = (convo.unread_count || 0) + 1;
                  convo.last_message = msg;
                  this.moveToTop(convo);
              } else {
                  this.loadConversations();
              }
          }
        });
      });

      const sub2 = this.chatService.messageDeleted$.subscribe((updatedMsg) => {
         this.ngZone.run(() => {
            if (this.selectedConvo && updatedMsg.conversation_id === this.selectedConvo.id) {
               const index = this.messages.findIndex(m => m.id === updatedMsg.id);
               if (index !== -1) {
                  this.messages[index] = updatedMsg;
               }
            }
         });
      });
      
      const sub3 = this.chatService.conversationListUpdated$.subscribe(() => {
          this.ngZone.run(() => {
              this.loadConversations();
          });
      });

      this.subscriptions.push(sub1, sub2, sub3);
      
      // --- INITIAL LOAD ---
      this.chatService.getConversations().subscribe(data => {
          this.conversations = data.map(c => this.formatConversation(c));
          
          this.route.queryParams.subscribe(params => {
             const targetId = params['id'] ? parseInt(params['id']) : null;
             if (targetId) {
                 const targetConvo = this.conversations.find(c => c.id === targetId);
                 if (targetConvo) {
                     this.selectConversation(targetConvo);
                 }
             }
          });
      });
  }

  ngOnDestroy() {
    if (this.selectedConvo) {
        this.chatService.leaveRoom(this.selectedConvo.id);
    }
    this.chatService.disconnect();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // --- DATA LOADING ---

  loadTeam() {
    this.userService.getTeam().subscribe(users => {
       this.availableUsers = users.filter((u: any) => u.id !== this.currentUser_id);
    });
  }

  loadConversations() {
    this.chatService.getConversations().subscribe(data => {
      this.conversations = data.map(c => this.formatConversation(c));
    });
  }

  selectConversation(convo: any) {
    if (this.selectedConvo) this.chatService.leaveRoom(this.selectedConvo.id);
    
    this.selectedConvo = convo;
    
    if (convo.unread_count > 0) {
      const amountCleared = convo.unread_count;
      convo.unread_count = 0;
      
      const currentTotal = this.chatService.totalUnreadCount$.value;
      const newTotal = Math.max(0, currentTotal - amountCleared); 
      this.chatService.totalUnreadCount$.next(newTotal);
      
      this.chatService.markAsRead(convo.id).subscribe();
    }

    this.messages = [];
    this.messageOffset = 0;
    this.hasMoreMessages = true;
    
    this.checkIfBlockedByMe();
    this.chatService.joinRoom(convo.id); 
    this.loadMessages(true);
  }
  
  loadMessages(scrollToBottom: boolean = false) {
      if (this.isLoadingMessages || !this.selectedConvo) return;
      this.isLoadingMessages = true;

      this.chatService.getMessages(this.selectedConvo.id, this.messageLimit, this.messageOffset)
        .subscribe({
          next: (newMsgs) => {
            if (newMsgs.length < this.messageLimit) {
                this.hasMoreMessages = false; 
            }

            if (this.messageOffset === 0) {
                this.messages = newMsgs;
                if (scrollToBottom) this.scrollToBottom();
            } else {
                const oldScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
                this.messages = [...newMsgs, ...this.messages];
                setTimeout(() => {
                    const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
                    this.scrollContainer.nativeElement.scrollTop = newScrollHeight - oldScrollHeight;
                }, 0);
            }

            this.messageOffset += newMsgs.length;
            this.isLoadingMessages = false;
          },
          error: () => this.isLoadingMessages = false
        });
  }
  
  fetchBlockedUsers() {
      this.chatService.getBlockedUsers().subscribe(ids => {
          this.blockedUserIds = ids;
      });
  }
  
  checkIfBlockedByMe() {
      this.isBlockedByMe = false;
      if (this.selectedConvo?.type === 'DM' && this.selectedConvo.otherUserId) {
          this.isBlockedByMe = this.blockedUserIds.includes(this.selectedConvo.otherUserId);
      }
  }

  // --- MESSAGING ---

  sendMessage() {
    if ((!this.messageText.trim() && !this.selectedFile) || !this.selectedConvo) return;

    if (!this.canSendMessage) {
        return alert("You cannot send messages to this conversation.");
    }

    this.chatService.sendMessage(this.selectedConvo.id, this.messageText, this.selectedFile).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.messageText = '';
        this.selectedFile = null;
        this.scrollToBottom();
      },
      error: (err) => alert(err.error?.message || 'Failed to send')
    });
  }
  
  deleteMessage(msg: any) {
    if(!confirm('Delete this message?')) return;
    this.chatService.deleteMessage(msg.id).subscribe({
        next: () => {
            msg.content = '🚫 This message was deleted';
            msg.file_path = null;
        }
    });
  }

  // --- ACTIONS ---

  get canSendMessage(): boolean {
      if (!this.selectedConvo) return false;
      
      if (this.selectedConvo.type === 'DM') {
          if (this.selectedConvo.myStatus === 'REJECTED' || this.selectedConvo.myStatus === 'LEFT') return false;
      }
      
      if (this.selectedConvo.type === 'GROUP') {
          const myRole = this.authService.currentUser()?.role || 1; 
          // @ts-ignore
          if (myRole < (this.selectedConvo.min_role_write || 1)) return false;
      }
      return true;
  }

  get eligibleMembers() {
    if (!this.selectedConvo) return [];
    const currentMemberIds = this.selectedConvo.participants.map((p: any) => p.user_id);
    return this.availableUsers.filter(u => !currentMemberIds.includes(u.id));
  }

  openDetailsModal() {
    this.showDetailsModal = true;
  }

  getLastMessagePreview(c: any): string {
    if (!c.last_message) return 'No messages yet';
    const content = c.last_message.content || 'Attachment';
    const prefix = c.last_message.sender_id === this.currentUser_id ? 'You: ' : '';
    return prefix + (content.length > 30 ? content.substring(0, 30) + '...' : content);
  }

  blockUser(userId: number) {
      if(!confirm('Block this user?')) return;
      this.chatService.blockUser(userId).subscribe(() => {
          this.blockedUserIds.push(userId);
          this.checkIfBlockedByMe();
          this.loadConversations(); // Update list to possibly hide blocked? No, keep it but show blocked status
          alert('User Blocked');
      });
  }
  
  unblockUser(userId: number) {
      if(!confirm('Unblock this user?')) return;
      this.chatService.unblockUser(userId).subscribe(() => {
          this.blockedUserIds = this.blockedUserIds.filter(id => id !== userId);
          this.checkIfBlockedByMe();
          this.loadConversations();
          alert('User Unblocked');
      });
  }

  respondToInvite(statusStr: string) {
    if(!this.selectedConvo) return;
    
    const status = statusStr as InviteStatus;
    
    this.chatService.respondToInvite(this.selectedConvo.id, status).subscribe(() => {
      this.loadConversations();
      
      if (status === InviteStatus.ACCEPT) {
          this.selectedConvo.myStatus = 'ACTIVE';
      } else {
          this.selectedConvo.myStatus = 'REJECTED';
          this.isBlockedByMe = true; 
          this.blockedUserIds.push(this.selectedConvo.otherUserId);
      }
    });
  }

  // --- GROUPS ---

  createGroup() {
    if (!this.groupForm.name) return alert('Group Name required');
    
    // Construct DTO
    const payload: CreateGroupDto = {
      name: this.groupForm.name,
      min_role_read: this.groupForm.min_role_read,
      min_role_write: this.groupForm.min_role_write
    };

    if (this.groupCreationMethod === 'MANUAL') {
       if (this.selectedMemberIds.length === 0) return alert('Select at least one member');
       payload.memberIds = this.selectedMemberIds;
    } else {
       if (!this.groupForm.auto_add_role) return alert('Select a role to auto-add');
       payload.auto_add_role = this.groupForm.auto_add_role;
    }

    this.chatService.createGroup(payload).subscribe({
      next: () => {
        this.showNewChatModal = false;
        this.loadConversations();
      },
      error: (err) => alert(err.error?.message)
    });
  }

  addMemberToGroup(userId: number) {
    if(!this.selectedConvo) return;
    
    const userToAdd = this.availableUsers.find((u: any) => u.id === userId);

    this.chatService.addMember(this.selectedConvo.id, userId).subscribe({
        next: () => {
            alert('Member added');
            if (userToAdd) {
                const newPart = {
                    user_id: userToAdd.id,
                    is_admin: false,
                    status: 'ACTIVE',
                    user: userToAdd
                };
                this.selectedConvo.participants = [...this.selectedConvo.participants, newPart];
            }
            this.refreshCurrentConvo(); 
        },
        error: (err) => alert(err.error?.message || 'Failed to add member')
    });
  }

  removeMemberFromGroup(userId: number) {
    if(!this.selectedConvo) return;
    if(!confirm('Remove this member?')) return;

    this.chatService.removeMember(this.selectedConvo.id, userId).subscribe({
        next: () => {
             this.selectedConvo.participants = this.selectedConvo.participants.filter(
                 (p: any) => p.user_id !== userId
             );
             this.refreshCurrentConvo();
        },
        error: (err) => alert(err.error?.message || 'Failed to remove member')
    });
  }

  deleteGroup() {
    if (!this.selectedConvo) return;
    if (!confirm('Delete this group completely?')) return;
    this.chatService.deleteGroup(this.selectedConvo.id).subscribe({
        next: () => {
            this.selectedConvo = null;
            this.showDetailsModal = false;
            this.loadConversations();
        },
        error: (err) => alert(err.error?.message || 'Delete failed')
    });
  }
  
  get isCreateGroupDisabled(): boolean {
      if (!this.groupForm.name) return true;
      if (this.groupCreationMethod === 'MANUAL' && this.selectedMemberIds.length === 0) return true;
      if (this.groupCreationMethod === 'ROLE' && !this.groupForm.auto_add_role) return true;
      return false;
  }
  
  updateGroupPermissions() {
    if (!this.selectedConvo) return;
    const payload: UpdateGroupDto = {
       min_role_write: this.selectedConvo.min_role_write
    };
    this.chatService.updateGroup(this.selectedConvo.id, payload).subscribe({
        next: () => alert('Permissions updated'),
        error: (err) => alert(err.error?.message)
    });
  }

  // --- HELPERS ---

  private refreshCurrentConvo() {
      this.chatService.getConversations().subscribe(data => {
          this.conversations = data.map(c => this.formatConversation(c));
          if (this.selectedConvo) {
              const updated = this.conversations.find(c => c.id === this.selectedConvo.id);
              if (updated) this.selectedConvo = updated;
          }
      });
  }

  formatConversation(c: any): ConversationDto {
    if (c.type === 'GROUP') {
      c.displayName = c.name;
    } else {
      const other = c.participants.find((p: any) => p.user_id !== this.currentUser_id);
      c.displayName = other?.user?.full_name || 'Unknown';
      c.otherUserId = other?.user_id;
      c.otherStatus = other?.status;
    }

    const myPart = c.participants.find((p: any) => p.user_id === this.currentUser_id);
    c.myStatus = myPart?.status;
    c.isAdmin = myPart?.is_admin;
    c.unread_count = c.unread_count || 0;
    
    return c;
  }

  openNewChatModal() {
      this.showNewChatModal = true;
      this.groupCreationMethod = 'MANUAL';
      this.selectedMemberIds = [];
      this.groupForm = { name: '', min_role_read: 1, min_role_write: 1, auto_add_role: null };
  }
  
  startDM(targetUserId?: number) {
      const payload: CreateDMDto = {};
      
      if (targetUserId) payload.targetUserId = targetUserId;
      else if (this.selectedMemberIds.length > 0) payload.targetUserId = this.selectedMemberIds[0];
      else if (this.inviteEmail) payload.email = this.inviteEmail;
      else return alert('Please select a user or enter email.');

      if (this.currentUserRole < ROLES.ORG_ADMIN) {
          this.pendingInvitePayload = payload;
          this.showNewChatModal = false; 
          this.showInviteMessageModal = true; 
          this.inviteMessageText = "Hi, I'd like to chat with you regarding..."; 
          return;
      }

      this.executeCreateDM(payload);
  }

  executeCreateDM(payload: CreateDMDto, initialMessage?: string) {
      this.chatService.createDM(payload).subscribe({
        next: (convo) => {
            this.showNewChatModal = false;
            this.showInviteMessageModal = false;
            this.inviteEmail = '';
            this.selectedMemberIds = [];
            
            if (initialMessage) {
                this.chatService.sendMessage(convo.id, initialMessage, null).subscribe(() => {
                    this.loadConversations();
                    this.selectConversation(this.formatConversation(convo)); 
                });
            } else {
                this.loadConversations();
                this.selectConversation(this.formatConversation(convo)); 
            }
        },
        error: (err) => alert(err.error?.message || 'User not found')
      });
  }

  sendInvite() {
      if (!this.inviteMessageText.trim()) return alert("Please write a message");
      if (this.pendingInvitePayload) {
          this.executeCreateDM(this.pendingInvitePayload, this.inviteMessageText);
      }
  }
  
  get inputState(): 'ALLOWED' | 'WAITING_FOR_ACCEPT' | 'BLOCKED_BY_ME' | 'READ_ONLY' | 'PENDING_INVITE' {
    if (!this.selectedConvo) return 'READ_ONLY';

    if (this.isBlockedByMe) return 'BLOCKED_BY_ME';

    if (this.selectedConvo.type === 'DM') {
      if (this.selectedConvo.myStatus === 'PENDING') {
        return 'PENDING_INVITE';
      }
      if (this.selectedConvo.myStatus === 'REJECTED' || this.selectedConvo.myStatus === 'LEFT') {
          return 'READ_ONLY';
      }
      return 'ALLOWED';
    }
    
    if (this.selectedConvo.type === 'GROUP') {
         // @ts-ignore
         if (this.currentUserRole < this.selectedConvo.min_role_write) return 'READ_ONLY';
    }

    return 'ALLOWED';
  }

  toggleMemberSelection(userId: number) {
    const idx = this.selectedMemberIds.indexOf(userId);
    if (idx > -1) this.selectedMemberIds.splice(idx, 1);
    else this.selectedMemberIds.push(userId);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  
  downloadFile(msg: any) {
    if (!msg.file_path) return;
    this.chatService.downloadAttachment(msg.id).subscribe({
        next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = msg.file_path.split('-').pop() || 'file'; 
            a.click();
            window.URL.revokeObjectURL(url);
        },
        error: () => alert('Download failed')
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
  
  moveToTop(convo: any) {
      this.conversations = this.conversations.filter(c => c.id !== convo.id);
      this.conversations.unshift(convo);
  }
}