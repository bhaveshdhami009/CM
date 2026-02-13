import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth'; 
import { 
  ConversationDto, 
  ChatMessageDto, 
  CreateGroupDto, 
  CreateDMDto, 
  UpdateGroupDto,
  InviteStatus 
} from '../../shared/models/dtos'; // Import DTOs
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`; 
  private socket?: Socket;
  
  // Track processed IDs to prevent double-counting (Room emit + User emit)
  private processedMessageIds = new Set<number>();
  
  // Track active chat to prevent badging open chats
  public activeConversationId: number | null = null; 

  // Streams
  public messageReceived$ = new Subject<ChatMessageDto>(); // Typed
  public messageDeleted$ = new Subject<ChatMessageDto>();
  public conversationListUpdated$ = new Subject<void>();
  
  public totalUnreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private authService: AuthService) {}

  // --- SOCKET.IO MANAGEMENT ---

  ensureConnection() {
      if (!this.socket?.connected) {
          this.connect();
      }
  }

  connect() {
    const token = this.authService.getToken();
    if (this.socket?.connected) return;

    this.socket = io(undefined, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Chat Socket');
    });

    this.socket.on('receive_message', (msg: ChatMessageDto) => {
      // --- FIX: DE-DUPLICATION LOGIC ---
      if (this.processedMessageIds.has(msg.id)) return;

      this.processedMessageIds.add(msg.id);
      setTimeout(() => this.processedMessageIds.delete(msg.id), 5000);

      this.messageReceived$.next(msg);
    });

    this.socket.on('message_deleted', (msg: ChatMessageDto) => {
      this.messageDeleted$.next(msg);
    });
    
    this.socket.on('refresh_conversations', () => {
       this.conversationListUpdated$.next();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Chat Socket');
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  joinRoom(conversationId: number) {
    this.activeConversationId = conversationId;
    if (this.socket) this.socket.emit('join_room', conversationId);
  }
  
  leaveRoom(conversationId: number) {
    if (this.activeConversationId === conversationId) {
        this.activeConversationId = null;
    }
    if (this.socket) this.socket.emit('leave_room', conversationId);
  }

  // --- HTTP API ---

  getConversations(): Observable<ConversationDto[]> {
    return this.http.get<ConversationDto[]>(`${this.apiUrl}/conversations`).pipe(
      tap((results) => {
        const total = results.reduce((sum, c) => sum + (c.unread_count || 0), 0);
        this.totalUnreadCount$.next(total);
      })
    );
  }

  getMessages(convoId: number, limit: number = 20, offset: number = 0): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.apiUrl}/${convoId}/messages?limit=${limit}&offset=${offset}`);
  }

  sendMessage(convoId: number, content: string, file: File | null): Observable<ChatMessageDto> {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);
    
    return this.http.post<ChatMessageDto>(`${this.apiUrl}/${convoId}/messages`, formData);
  }
  
  markAsRead(convoId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${convoId}/read`, {});
  }

  // Updated to use DTOs
  createGroup(data: CreateGroupDto): Observable<ConversationDto> {
    return this.http.post<ConversationDto>(`${this.apiUrl}/groups`, data);
  }

  createDM(payload: CreateDMDto): Observable<ConversationDto> {
    return this.http.post<ConversationDto>(`${this.apiUrl}/dm`, payload);
  }

  respondToInvite(convoId: number, status: InviteStatus): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${convoId}/invite-response`, { status });
  }

  // --- BLOCKING ---
  blockUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/block`, {});
  }
  
  unblockUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}/block`);
  }
  
  getBlockedUsers(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/blocks`);
  }
  
  // --- MESSAGE ACTIONS ---
  deleteMessage(msgId: number): Observable<ChatMessageDto> {
    return this.http.delete<ChatMessageDto>(`${this.apiUrl}/messages/${msgId}`);
  }

  downloadAttachment(msgId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/messages/${msgId}/file`, { responseType: 'blob' });
  }

  // --- MEMBER MANAGEMENT ---
  addMember(convoId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${convoId}/members`, { userId });
  }

  removeMember(convoId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${convoId}/members/${userId}`);
  }
  
  updateGroup(convoId: number, data: UpdateGroupDto): Observable<ConversationDto> {
    return this.http.patch<ConversationDto>(`${this.apiUrl}/${convoId}`, data);
  }

  deleteGroup(convoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${convoId}`);
  }
}
