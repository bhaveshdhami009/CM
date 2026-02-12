import express from 'express';
import 'dotenv/config'; 
import helmet from 'helmet';
import { globalLimiter } from './middleware/rate-limit.middleware.js';
import { AppDataSource } from './data-source.js';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { globalErrorHandler } from './middleware/error.middleware.js'; 

// Import Routes
import authRouter from './api/auth.routes.js';
import lookupRouter from './api/lookup.routes.js';
import partyRouter from './api/party.routes.js';
import caseRouter from './api/case.routes.js'; 
import settingRouter from './api/setting.routes.js'; 
import calendarRouter from './api/calendar.routes.js'; 
import userRouter from './api/user.routes.js'; 
import orgRouter from './api/organization.routes.js';
import searchRouter from './api/search.routes.js';
import announcementRouter from './api/announcement.routes.js';
import dashboardRouter from './api/dashboard.routes.js';
import chatRouter from './api/chat.routes.js'; // Ensure this path is correct

import * as useragent from 'express-useragent'; 

console.log("JWT_SECRET:", process.env.JWT_SECRET);

const main = async () => {
  try {
    // 1. Database Initialization
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const app = express();
    const httpServer = createServer(app);
    
    // 2. Socket.io Setup
    const io = new Server(httpServer, {
      cors: {
        origin: "*"
      }
    });

    
    // Socket Authentication Middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        // Ensure your JWT payload structure matches this (e.g., { user: { id: 1... } })
        socket.data.user = decoded.user || decoded; 
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    });
    
    io.on('connection', (socket) => {
      // console.log(`User connected: ${socket.id}`);
      
      const userId = socket.data.user.id;
      socket.join(`user_${userId}`); 
      
      console.log(`User ${userId} connected and joined channel user_${userId}`);
      
      socket.on('join_room', (roomId) => {
         // This string must match what the controller emits (e.g., "room_105")
         socket.join(`room_${roomId}`);
      });

      socket.on('disconnect', () => {
        // console.log('User disconnected');
      });
    });
    
    // 3. Express Standard Middleware
    app.use(cors());

    
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            
            // Allow scripts from self and inline (needed for some Angular functionality)
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            
            // Fix "Refused to execute inline event handler"
            scriptSrcAttr: ["'unsafe-inline'"], 

            // Allow Angular's inline styles and Google Fonts
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            
            // Allow loading fonts from Google
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            
            // Allow images from self and data: (base64)
            imgSrc: ["'self'", "data:"],
            
            // Allow connections (API + WebSockets)
            connectSrc: ["'self'", "http://localhost:3000", "ws://localhost:3000"],
          },
        },
        // Cross-Origin-Embedder-Policy can sometimes block resources, disable if images break
        crossOriginEmbedderPolicy: false, 
      })
    );
    app.use('/api', globalLimiter);
    app.use(express.json({ limit: '10kb' })); 
    app.use(useragent.express());

    // 4. CRITICAL: Inject IO *before* Routes definition
    app.use((req, res, next) => {
      (req as any).io = io;
      next();
    });

    // 5. Routes
    app.use('/api/auth', authRouter);
    app.use('/api/lookups', lookupRouter);
    app.use('/api/cases', caseRouter); 
    app.use('/api/parties', partyRouter);
    app.use('/api/settings', settingRouter);
    app.use('/api/calendar', calendarRouter);
    app.use('/api/users', userRouter);
    app.use('/api/organizations', orgRouter);
    app.use('/api/search', searchRouter);
    app.use('/api/announcements', announcementRouter);
    app.use('/api/dashboard', dashboardRouter);
    
    // Chat Routes (Now has access to req.io)
    app.use('/api/chat', chatRouter);

    // 6. Test Routes (Dev only)
    app.get('/api/test/tables', async (req, res) => {
      const tables = await AppDataSource.query(`
        SELECT tablename FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
      `);
      res.json(tables.map((t: any) => t.tablename));
    });
    
    app.get('/api/test/table/:tableName', async (req, res) => {
      const tableName = req.params.tableName;
      // SECURITY WARNING: In a real app, you MUST sanitize this input
      // to prevent SQL injection. This is for trusted testing only.
      if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
         return res.status(400).json({ message: 'Invalid table name.' });
      }
      const data = await AppDataSource.query(`SELECT * FROM public."${tableName}"`);
      res.json(data);
    });
    
    // ==========================================
    //  SERVE ANGULAR FRONTEND (Add this Section)
    // ==========================================

    // 1. Resolve the path to the Angular 'dist' folder
    // Adjust '../legal-frontend/dist/...' based on your actual folder structure relative to backend
    const frontendPath = path.join(process.cwd(), '../frontend/dist/legal-frontend/browser');

    // 2. Serve Static Files
    app.use(express.static(frontendPath));

    // 3. Handle SPA Fallback (Send index.html for any unknown non-API requests)
    app.get(/.*/, (req, res) => {
      // Don't intercept API calls
      if (req.url.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route not found' });
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });

    // ==========================================

    // 7. Global Error Handler (Must be last)
    app.use(globalErrorHandler);

    // 8. Start Server
    const port = process.env.PORT || 3000;
    httpServer.listen(port, () => {
      console.log(`Backend server (HTTP + Socket) listening at http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Error during Data Source initialization:', error);
  }
};

main();
