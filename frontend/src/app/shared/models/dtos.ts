// src/app/shared/models/dtos.ts

// --- ENUMS ---
export enum AnnouncementScope {
  GLOBAL = 'GLOBAL',
  ORG = 'ORG'
}

export enum InviteStatus {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

// =============================================================================
//  READ MODELS (For Display / GET Responses)
// =============================================================================

export interface LogDto {
  id: number;
  log_date: string;
  purpose: string;
  remarks?: string;
  is_pending: boolean; 
  file_path?: string;
  file_extension?: string;
  creator?: { id: number, full_name: string };
  
  created_at?: string; 
  updated_at?: string;
  case: {
    id: number;
    case_no?: string;
    file_no?: string;
    parties?: any[]; // Needed for getTitle helper
  };
}

export interface HearingDto {
  id: number;
  hearing_date: string;
  purpose: string;
  court_room?: string;
  judge_id?: number | null;
  judge?: { id: number, name: string }; // If relation loaded
  remarks?: string;
  outcome?: string;
  
  case: {
    id: number;
    case_no?: string;
    file_no?: string;
    court?: { id: number, name: string };
    parties?: any[]; // Needed for getTitle helper
  };
}

export interface ExecutionDto {
  amount: number;
  start_date: string;
  next_due_date?: string;
  remarks?: string;
  is_active: boolean;
}

export interface DlsaDto {
  letterNo: string;  
  registrationNo: string;  
  letterDate: string;  
  remarks: string;  
  billedOn: string;  
  receivedOn: string;  
}

export interface AnnouncementDto {
  id: number;
  title: string;
  message: string;
  scope: AnnouncementScope;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  creator?: { full_name: string };
}

export interface SettingDto {
  key: string;
  value: any;
  description?: string;
  created_at: string;
}

// --- CHAT READ MODELS ---
export interface ChatParticipantDto {
  user_id: number;
  is_admin: boolean;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  user: {
    id: number;
    full_name: string;
    email: string;
    role: number;
  };
}

export interface ChatMessageDto {
  id: number;
  content?: string;
  file_path?: string;
  created_at: string;
  sender: {
    id: number;
    full_name: string;
    email: string;
  };
  conversation_id?: number;
}

export interface ConversationDto {
  id: number;
  type: 'DM' | 'GROUP';
  name?: string;
  description?: string;
  is_read_only: boolean;
  participants: ChatParticipantDto[];
  
  // UI Helpers
  displayName?: string;
  myStatus?: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'LEFT'; 
  isAdmin?: boolean;
  otherUserId?: number;     
  otherStatus?: string;     
  
  unread_count?: number;    
  last_message?: ChatMessageDto; 
}

export interface DashboardCaseDto {
  id: number;
  case_no?: string;
  file_no?: string;
  created_at: string;
  court?: {
    id: number;
    name: string;
  };
  // Needed for getTitle() helper
  parties?: {
    role: string;
    party: {
      first_name: string;
      last_name?: string;
    };
  }[];
}

// --- DASHBOARD ---
export interface DashboardStats {
  tasksCompleted: number;
  hearingsCount: number;
  casesFiled: number;
  totalPendingTasks: number;
}

export interface DashboardWidgets {
  upcomingHearings: HearingDto[];
  pendingTasks: LogDto[];
  recentActivity: LogDto[];
  announcements: AnnouncementDto[];
  recentCases: DashboardCaseDto[];
}

// =============================================================================
//  WRITE MODELS (For POST/PUT Requests - Must Match Backend DTOs)
// =============================================================================

// --- AUTH ---
export interface LoginDto {
  email: string;
  password: string;
}

//export interface RegisterDto {
//  email: string;
//  password: string;
//  full_name: string;
//}

// --- ORGANIZATION ---
export interface CreateOrgDto {
  name: string;
  admin_email: string;
  admin_name: string;
  address?: string;
  contact_email?: string;
  phone?: string;
  admin_password?: string;
}


// --- CASE ---
export interface CreateCaseDto {
  fileNo?: string;
  filingNo?: string;
  filingDate?: string; // ISO Date String
  caseType: string;
  caseNo?: string;
  //courtNo?: number; 
  receivedDate?: string;
  act?: string;
  section?: string;
  
  districtId: number;
  courtId: number;
  establishmentId?: number;
  remarks?: string;
  
  petitionerIds: number[];
  respondentIds: number[];
  
  dlsa?: {
    letterNo: string;
    registrationNo: string;
    letterDate?: string;
    remarks?: string;
    billedOn?: string;
    receivedOn?: string;
  };
  
  execution?: {
    amount: number;
    start_date: string;
    next_due_Date: string;
    remarks?: string;
  };
}

// --- PARTIES ---
export interface CreatePartyDto {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  
  mobile?: string;
  mobile2?: string;
  email?: string;
  
  father_name?: string;
  mother_name?: string;
  guardian?: string;
  guardian_relation?: string;
  
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  remarks?: string;
}

// --- HEARINGS ---
export interface CreateHearingDto {
  hearing_date: string; // ISO
  purpose: string;
  court_room?: string;
  remarks?: string;
  outcome?: string;
  judge_id?: number;
}

// --- LOGS ---
export interface CreateLogDto {
  case_id?: number;
  log_date: string;
  purpose: string;
  remarks?: string;
  is_pending?: boolean;
  // File handled via FormData, not JSON DTO
}

// --- ANNOUNCEMENTS ---
export interface CreateAnnouncementDto {
  title: string;
  message: string;
  scope: AnnouncementScope;
  expires_at?: string;
  target_org_id?: number;
}

// --- USER MANAGEMENT ---
export interface CreateTeamMemberDto {
  fullName: string;
  email: string;
  role: number;
  password?: string;
}

export interface UpdateProfileDto {
  accent?: string;
  is_dark_mode?: boolean;
}

// --- CHAT ---
export interface CreateGroupDto {
  name: string;
  description?: string;
  min_role_read?: number;
  min_role_write?: number;
  memberIds?: number[];
  auto_add_role?: number;
}

export interface CreateDMDto {
  targetUserId?: number;
  email?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  min_role_read?: number;
  min_role_write?: number;
}

// --- EXECUTION ---
export interface StartExecutionDto {
  amount: number;
  start_date: string;
  next_due_date: string;
  remarks?: string;
}

export interface MarkCycleCompleteDto {
  remarks?: string;
}

// --- LOOKUP ---
export interface CreateDistrictDto { name: string; state: string; }
export interface CreateCourtDto { name: string; district_id: number; }
export interface CreateEstablishmentDto { name: string; district_id: number; }
export interface CreateJudgeDto { name: string; }

// --- SETTINGS ---
export interface CreateSettingDto {
  key?: string;
  value: any;
  description?: string;
}

// --- SEARCH ---
export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'startsWith';
  value: any;
}

export interface AdvancedSearchDto {
  entityType: string;
  filters: FilterCondition[];
  logic: 'AND' | 'OR';
  page?: number;
  limit?: number;
}