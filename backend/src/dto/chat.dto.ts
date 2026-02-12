import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt, 
  IsArray, 
  IsEnum, 
  IsEmail, 
  ValidateIf,
  Min
} from 'class-validator';

// Enum for Invite Response
export enum InviteStatus {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

// 1. Create Group
export class CreateGroupDto {
  @IsString()
  @IsNotEmpty({ message: 'Group name is required' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  min_role_read?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  min_role_write?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  memberIds?: number[];

  @IsOptional()
  @IsInt()
  auto_add_role?: number;
}

// 2. Create DM (Flexible: accepts ID or Email)
export class CreateDMDto {
  // Validate: targetUserId must exist if email is missing
  @ValidateIf(o => !o.email)
  @IsInt({ message: 'Target User ID must be an integer' })
  targetUserId?: number;

  // Validate: email must exist if targetUserId is missing
  @ValidateIf(o => !o.targetUserId)
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;
}

// 3. Send Message
export class SendMessageDto {
  @IsOptional()
  @IsString()
  content?: string;
  
  // Note: File validation is usually handled by Multer's fileFilter, 
  // not class-validator, as files come in req.file not req.body
}

// 4. Respond to Invite
export class InviteResponseDto {
  @IsEnum(InviteStatus, { message: 'Status must be ACCEPT or REJECT' })
  status!: InviteStatus;
}

// 5. Add Member
export class AddMemberDto {
  @IsInt()
  @IsNotEmpty()
  userId!: number;
}

// 6. Update Group
export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  min_role_read?: number;

  @IsOptional()
  @IsInt()
  min_role_write?: number;
}