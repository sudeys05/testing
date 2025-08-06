import { 
  users, 
  cases,
  obEntries,
  licensePlates,
  passwordResetTokens,
  type User, 
  type InsertUser,
  type Case,
  type InsertCase,
  type OBEntry,
  type InsertOBEntry,
  type LicensePlate,
  type InsertLicensePlate,
  type UpdateProfileRequest
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateProfileRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;
  updateLastLogin(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Password reset operations
  createPasswordResetToken(userId: number, token: string): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ userId: number } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  updateUserPassword(id: number, password: string): Promise<void>;

  // Case operations
  getCases(): Promise<Case[]>;
  getCase(id: number): Promise<Case | undefined>;
  createCase(caseData: InsertCase & { assignedOfficerId?: number; createdById: number }): Promise<Case>;
  updateCase(id: number, updates: Partial<Case>): Promise<Case>;
  deleteCase(id: number): Promise<void>;
  
  // OB Entry operations
  getOBEntries(): Promise<OBEntry[]>;
  getOBEntry(id: number): Promise<OBEntry | undefined>;
  createOBEntry(obData: InsertOBEntry & { recordingOfficerId: number }): Promise<OBEntry>;
  updateOBEntry(id: number, updates: Partial<OBEntry>): Promise<OBEntry>;
  deleteOBEntry(id: number): Promise<void>;
  
  // License Plate operations
  getLicensePlates(): Promise<LicensePlate[]>;
  getLicensePlate(id: number): Promise<LicensePlate | undefined>;
  getLicensePlateByNumber(plateNumber: string): Promise<LicensePlate | undefined>;
  createLicensePlate(plateData: InsertLicensePlate & { addedById: number }): Promise<LicensePlate>;
  updateLicensePlate(id: number, updates: Partial<LicensePlate>): Promise<LicensePlate>;
  deleteLicensePlate(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private obEntries: Map<number, OBEntry>;
  private licensePlates: Map<number, LicensePlate>;
  private resetTokens: Map<string, { userId: number; expiresAt: Date }>;
  private currentUserId: number;
  private currentCaseId: number;
  private currentOBId: number;
  private currentPlateId: number;

  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.obEntries = new Map();
    this.licensePlates = new Map();
    this.resetTokens = new Map();
    this.currentUserId = 1;
    this.currentCaseId = 1;
    this.currentOBId = 1;
    this.currentPlateId = 1;
    
    // Create default admin user
    this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminUser: User = {
      id: this.currentUserId++,
      username: 'admin',
      email: 'admin@police.gov',
      password: 'admin123', // In production, this should be hashed
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      badgeNumber: 'ADMIN001',
      department: 'IT',
      position: 'System Administrator',
      phone: '+1-555-0000',
      profileImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(adminUser.id, adminUser);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      profileImage: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: UpdateProfileRequest): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async updateLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(id, user);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Password reset operations
  async createPasswordResetToken(userId: number, token: string): Promise<void> {
    this.resetTokens.set(token, { 
      userId, 
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: number } | undefined> {
    const tokenData = this.resetTokens.get(token);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      this.resetTokens.delete(token);
      return undefined;
    }
    return tokenData;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    this.resetTokens.delete(token);
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.password = password;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  // Case operations
  async getCases(): Promise<Case[]> {
    return Array.from(this.cases.values());
  }

  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async createCase(caseData: InsertCase & { assignedOfficerId?: number; createdById: number }): Promise<Case> {
    const id = this.currentCaseId++;
    const caseNumber = `CASE-${new Date().getFullYear()}-${id.toString().padStart(3, '0')}`;
    const newCase: Case = {
      ...caseData,
      id,
      caseNumber,
      assignedOfficerId: caseData.assignedOfficerId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cases.set(id, newCase);
    return newCase;
  }

  async updateCase(id: number, updates: Partial<Case>): Promise<Case> {
    const existingCase = this.cases.get(id);
    if (!existingCase) throw new Error('Case not found');
    
    const updatedCase = { ...existingCase, ...updates, updatedAt: new Date() };
    this.cases.set(id, updatedCase);
    return updatedCase;
  }

  async deleteCase(id: number): Promise<void> {
    this.cases.delete(id);
  }

  // OB Entry operations
  async getOBEntries(): Promise<OBEntry[]> {
    return Array.from(this.obEntries.values());
  }

  async getOBEntry(id: number): Promise<OBEntry | undefined> {
    return this.obEntries.get(id);
  }

  async createOBEntry(obData: InsertOBEntry & { recordingOfficerId: number }): Promise<OBEntry> {
    const id = this.currentOBId++;
    const obNumber = `OB/${new Date().getFullYear()}/${id.toString().padStart(4, '0')}`;
    const newEntry: OBEntry = {
      ...obData,
      id,
      obNumber,
      dateTime: new Date(),
      status: 'recorded',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.obEntries.set(id, newEntry);
    return newEntry;
  }

  async updateOBEntry(id: number, updates: Partial<OBEntry>): Promise<OBEntry> {
    const existingEntry = this.obEntries.get(id);
    if (!existingEntry) throw new Error('OB Entry not found');
    
    const updatedEntry = { ...existingEntry, ...updates, updatedAt: new Date() };
    this.obEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteOBEntry(id: number): Promise<void> {
    this.obEntries.delete(id);
  }

  // License Plate operations
  async getLicensePlates(): Promise<LicensePlate[]> {
    return Array.from(this.licensePlates.values());
  }

  async getLicensePlate(id: number): Promise<LicensePlate | undefined> {
    return this.licensePlates.get(id);
  }

  async getLicensePlateByNumber(plateNumber: string): Promise<LicensePlate | undefined> {
    return Array.from(this.licensePlates.values()).find(
      (plate) => plate.plateNumber === plateNumber
    );
  }

  async createLicensePlate(plateData: InsertLicensePlate & { addedById: number }): Promise<LicensePlate> {
    const id = this.currentPlateId++;
    const newPlate: LicensePlate = {
      ...plateData,
      id,
      ownerImage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.licensePlates.set(id, newPlate);
    return newPlate;
  }

  async updateLicensePlate(id: number, updates: Partial<LicensePlate>): Promise<LicensePlate> {
    const existingPlate = this.licensePlates.get(id);
    if (!existingPlate) throw new Error('License plate not found');
    
    const updatedPlate = { ...existingPlate, ...updates, updatedAt: new Date() };
    this.licensePlates.set(id, updatedPlate);
    return updatedPlate;
  }

  async deleteLicensePlate(id: number): Promise<void> {
    this.licensePlates.delete(id);
  }
}

export const storage = new MemStorage();
