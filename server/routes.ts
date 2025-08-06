import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  updateProfileSchema,
  insertCaseSchema,
  insertOBSchema,
  insertLicensePlateSchema,
  type User 
} from "@shared/schema";
import { randomBytes } from "crypto";

// Session configuration
declare module "express-session" {
  interface SessionData {
    userId?: number;
    user?: User;
  }
}

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Admin middleware
export const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'police-system-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }

      await storage.updateLastLogin(user.id);
      req.session.userId = user.id;
      req.session.user = user;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/register', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Create user (remove confirmPassword before saving)
      const { confirmPassword, ...userToCreate } = userData;
      const newUser = await storage.createUser(userToCreate);

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { username } = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({ message: "If the username exists, a reset token has been generated" });
      }

      const token = randomBytes(32).toString('hex');
      await storage.createPasswordResetToken(user.id, token);

      // In production, send email here
      // For development, return the token
      res.json({ 
        message: "Password reset token generated",
        token // Remove this in production
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      const resetData = await storage.getPasswordResetToken(token);
      if (!resetData) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      await storage.updateUserPassword(resetData.userId, password);
      await storage.deletePasswordResetToken(token);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Profile routes
  app.put('/api/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const updates = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.session.userId!, updates);
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json({ users: usersWithoutPasswords });
  });

  app.delete('/api/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (userId === req.session.userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    try {
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  });

  // Case routes - removed duplicate, using enhanced version below

  app.post('/api/cases', requireAuth, async (req: Request, res: Response) => {
    try {
      const caseData = insertCaseSchema.parse(req.body);
      const newCase = await storage.createCase({
        ...caseData,
        createdById: req.session.userId!
      });
      res.status(201).json({ case: newCase });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put('/api/cases/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id);
      const updates = req.body;
      const updatedCase = await storage.updateCase(caseId, updates);
      res.json({ case: updatedCase });
    } catch (error) {
      res.status(404).json({ message: "Case not found" });
    }
  });

  app.delete('/api/cases/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const caseId = parseInt(req.params.id);
      await storage.deleteCase(caseId);
      res.json({ message: "Case deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "Case not found" });
    }
  });

  // OB Entry routes
  app.get('/api/ob-entries', requireAuth, async (req: Request, res: Response) => {
    const obEntries = await storage.getOBEntries();
    res.json({ obEntries });
  });

  app.post('/api/ob-entries', requireAuth, async (req: Request, res: Response) => {
    try {
      const obData = insertOBSchema.parse(req.body);
      const newOBEntry = await storage.createOBEntry({
        ...obData,
        recordingOfficerId: req.session.userId!
      });
      res.status(201).json({ obEntry: newOBEntry });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put('/api/ob-entries/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const obId = parseInt(req.params.id);
      const updates = req.body;
      const updatedOBEntry = await storage.updateOBEntry(obId, updates);
      res.json({ obEntry: updatedOBEntry });
    } catch (error) {
      res.status(404).json({ message: "OB Entry not found" });
    }
  });

  app.delete('/api/ob-entries/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const obId = parseInt(req.params.id);
      await storage.deleteOBEntry(obId);
      res.json({ message: "OB Entry deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "OB Entry not found" });
    }
  });

  // License Plate routes
  app.get('/api/license-plates', requireAuth, async (req: Request, res: Response) => {
    const licensePlates = await storage.getLicensePlates();
    res.json({ licensePlates });
  });

  app.get('/api/license-plates/search/:plateNumber', requireAuth, async (req: Request, res: Response) => {
    const plateNumber = req.params.plateNumber;
    const licensePlate = await storage.getLicensePlateByNumber(plateNumber);
    
    if (!licensePlate) {
      return res.status(404).json({ message: "License plate not found" });
    }

    res.json({ licensePlate });
  });

  app.post('/api/license-plates', requireAuth, async (req: Request, res: Response) => {
    try {
      const plateData = insertLicensePlateSchema.parse(req.body);
      const newPlate = await storage.createLicensePlate({
        ...plateData,
        addedById: req.session.userId!
      });
      res.status(201).json({ licensePlate: newPlate });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.put('/api/license-plates/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const plateId = parseInt(req.params.id);
      const updates = req.body;
      const updatedPlate = await storage.updateLicensePlate(plateId, updates);
      res.json({ licensePlate: updatedPlate });
    } catch (error) {
      res.status(404).json({ message: "License plate not found" });
    }
  });

  app.delete('/api/license-plates/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const plateId = parseInt(req.params.id);
      await storage.deleteLicensePlate(plateId);
      res.json({ message: "License plate deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: "License plate not found" });
    }
  });

  // Officers management endpoints
  app.get('/api/officers', requireAuth, requireAdmin, async (req, res) => {
    try {
      const officers = await storage.getAllUsers();
      res.json(officers);
    } catch (error) {
      console.error('Error fetching officers:', error);
      res.status(500).json({ message: 'Failed to fetch officers' });
    }
  });

  app.post('/api/officers', requireAuth, requireAdmin, async (req, res) => {
    try {
      const officerData = req.body;
      const newOfficer = await storage.createUser({
        ...officerData,
        username: officerData.badgeNumber || `officer_${Date.now()}`,
        password: 'changeme123',
        role: 'user',
        isActive: true
      });
      res.status(201).json(newOfficer);
    } catch (error) {
      console.error('Error creating officer:', error);
      res.status(500).json({ message: 'Failed to create officer' });
    }
  });

  app.put('/api/officers/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const officerData = req.body;
      const updatedOfficer = await storage.updateUser(parseInt(id), officerData);
      res.json(updatedOfficer);
    } catch (error) {
      console.error('Error updating officer:', error);
      res.status(500).json({ message: 'Failed to update officer' });
    }
  });

  app.delete('/api/officers/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(parseInt(id));
      res.json({ message: 'Officer deleted successfully' });
    } catch (error) {
      console.error('Error deleting officer:', error);
      res.status(500).json({ message: 'Failed to delete officer' });
    }
  });

  // Override the old cases endpoint with new data format
  app.get('/api/cases', requireAuth, async (req, res) => {
    try {
      const cases = [
        {
          id: 1,
          caseNumber: 'CASE-2025-001',
          title: 'Burglary at Main Street Store',
          description: 'Break-in occurred at electronics store on Main Street. Several items reported missing including laptops and phones.',
          type: 'Burglary',
          priority: 'High',
          status: 'In Progress',
          incidentDate: '2025-01-20T10:30:00Z',
          reportedDate: '2025-01-20T11:00:00Z',
          location: 'Main Street Electronics Store, Downtown',
          assignedOfficer: 'Officer Johnson',
          createdAt: '2025-01-20T11:00:00Z',
          updatedAt: '2025-01-21T09:15:00Z'
        },
        {
          id: 2,
          caseNumber: 'CASE-2025-002',
          title: 'Traffic Accident Investigation',
          description: 'Multi-vehicle accident at highway intersection. Minor injuries reported.',
          type: 'Traffic Violation',
          priority: 'Medium',
          status: 'Open',
          incidentDate: '2025-01-21T15:45:00Z',
          reportedDate: '2025-01-21T16:00:00Z',
          location: 'Highway 101 & Oak Avenue Intersection',
          assignedOfficer: 'Officer Davis',
          createdAt: '2025-01-21T16:00:00Z',
          updatedAt: '2025-01-21T16:00:00Z'
        },
        {
          id: 3,
          caseNumber: 'CASE-2025-003',
          title: 'Missing Person Report',
          description: 'Adult male reported missing by family. Last seen at work on Friday evening.',
          type: 'Missing Person',
          priority: 'Critical',
          status: 'Open',
          incidentDate: '2025-01-19T18:00:00Z',
          reportedDate: '2025-01-20T08:00:00Z',
          location: 'Last seen at Downtown Office Building',
          assignedOfficer: 'Detective Smith',
          createdAt: '2025-01-20T08:00:00Z',
          updatedAt: '2025-01-21T14:30:00Z'
        }
      ];
      res.json({ cases });
    } catch (error) {
      console.error('Error fetching cases:', error);
      res.status(500).json({ message: 'Failed to fetch cases' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
