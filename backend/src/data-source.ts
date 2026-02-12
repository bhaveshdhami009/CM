// src/data-source.ts

import 'reflect-metadata'; // <-- IMPORT THIS FIRST!
import { DataSource } from 'typeorm';
import { User } from './entities/User.js'; 
import { Organization } from './entities/Organization.js';
//import { CaseType } from './entities/CaseType.js';
import { District } from './entities/District.js';
import { Court } from './entities/Court.js';
import { Judge } from './entities/Judge.js';
import { Party } from './entities/Party.js';
import { Case } from './entities/Case.js';
import { CaseParty } from './entities/CaseParty.js';
import { CaseLog } from './entities/CaseLog.js';
import { Setting } from './entities/Setting.js';
import { Execution } from './entities/Execution.js'; 
import { DlsaRecord } from './entities/DlsaRecord.js'; 
import { Hearing } from './entities/Hearing.js';
import { AuthLog } from './entities/AuthLog.js';
import { AuditLog } from './entities/AuditLog.js';
import { LoginAttempt } from './entities/LoginAttempt.js';
import { UserSession } from './entities/UserSession.js';
import { Establishment } from './entities/Establishment.js';
import { Announcement } from './entities/Announcement.js';
import { ChatConversation } from './entities/ChatConversation.js';
import { ChatParticipant } from './entities/ChatParticipant.js';
import { ChatMessage } from './entities/ChatMessage.js';
import { UserBlock } from './entities/UserBlock.js';

import { AuditSubscriber } from './subscribers/AuditSubscriber.js';

// This is the connection configuration
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // Set to false in production and use migrations
  logging: true,
  entities: [
      User,
	  Organization,
      //CaseType,
      District,
      Court,
      Establishment,
      Judge,
      Party,
      Case,
      CaseParty,
      CaseLog,
      Hearing,
      Setting,
      Execution,
      DlsaRecord,
      AuditLog,
      AuthLog,
      LoginAttempt,
      UserSession,
      Announcement,
      ChatConversation,
      ChatParticipant,
      ChatMessage,
      UserBlock
  ], // List all your entities here
  migrations: [],
  subscribers: [AuditSubscriber],
});