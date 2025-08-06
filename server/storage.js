import { 
  users, 
  cases,
  obEntries,
  licensePlates,
  passwordResetTokens
} from "../shared/schema.js";

export class MemStorage {
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

    // Initialize with default admin user
    this.initializeDefaultData();
  }

  initializeDefaultData() {
    const defaultAdmin = {
      id: 1,
      username: 'admin',
      email: 'admin@police.gov',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      badgeNumber: 'ADMIN-001',
      department: 'Administration',
      position: 'System Admin',
      phone: '+1-555-0001',
      profileImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null
    };

    this.users.set(1, defaultAdmin);
    this.currentUserId = 2;

    // Add sample case
    const defaultCase = {
      id: 1,
      caseNumber: 'CASE-2025-001',
      title: 'Sample Investigation Case',
      description: 'This is a sample case for demonstration purposes.',
      status: 'open',
      priority: 'medium',
      assignedOfficerId: 1,
      createdById: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.cases.set(1, defaultCase);
    this.currentCaseId = 2;
  }

  // User operations
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData) {
    const user = {
      id: this.currentUserId++,
      ...userData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id) {
    return this.users.delete(id);
  }

  async updateLastLogin(id) {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.users.set(id, user);
    }
  }

  async getAllUsers() {
    return Array.from(this.users.values());
  }

  // Password reset operations
  async createPasswordResetToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
    this.resetTokens.set(token, { userId, expiresAt });
  }

  async getPasswordResetToken(token) {
    const tokenData = this.resetTokens.get(token);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      return undefined;
    }
    return { userId: tokenData.userId };
  }

  async deletePasswordResetToken(token) {
    this.resetTokens.delete(token);
  }

  async updateUserPassword(id, password) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.password = password;
    user.updatedAt = new Date();
    this.users.set(id, user);
  }

  // Case operations
  async getCases() {
    return Array.from(this.cases.values());
  }

  async getCase(id) {
    return this.cases.get(id);
  }

  async createCase(caseData) {
    const caseRecord = {
      id: this.currentCaseId++,
      caseNumber: `CASE-2025-${String(this.currentCaseId - 1).padStart(3, '0')}`,
      ...caseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cases.set(caseRecord.id, caseRecord);
    return caseRecord;
  }

  async updateCase(id, updates) {
    const caseRecord = this.cases.get(id);
    if (!caseRecord) {
      throw new Error('Case not found');
    }
    
    const updatedCase = {
      ...caseRecord,
      ...updates,
      updatedAt: new Date()
    };
    this.cases.set(id, updatedCase);
    return updatedCase;
  }

  async deleteCase(id) {
    if (!this.cases.has(id)) {
      throw new Error('Case not found');
    }
    this.cases.delete(id);
  }

  // OB Entry operations
  async getOBEntries() {
    return Array.from(this.obEntries.values());
  }

  async getOBEntry(id) {
    return this.obEntries.get(id);
  }

  async createOBEntry(obData) {
    const obEntry = {
      id: this.currentOBId++,
      obNumber: `OB-2025-${String(this.currentOBId - 1).padStart(3, '0')}`,
      ...obData,
      dateTime: obData.dateTime || new Date(),
      status: 'recorded',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.obEntries.set(obEntry.id, obEntry);
    return obEntry;
  }

  async updateOBEntry(id, updates) {
    const obEntry = this.obEntries.get(id);
    if (!obEntry) {
      throw new Error('OB Entry not found');
    }
    
    const updatedOBEntry = {
      ...obEntry,
      ...updates,
      updatedAt: new Date()
    };
    this.obEntries.set(id, updatedOBEntry);
    return updatedOBEntry;
  }

  async deleteOBEntry(id) {
    if (!this.obEntries.has(id)) {
      throw new Error('OB Entry not found');
    }
    this.obEntries.delete(id);
  }

  // License Plate operations
  async getLicensePlates() {
    return Array.from(this.licensePlates.values());
  }

  async getLicensePlate(id) {
    return this.licensePlates.get(id);
  }

  async getLicensePlateByNumber(plateNumber) {
    for (const plate of this.licensePlates.values()) {
      if (plate.plateNumber === plateNumber) {
        return plate;
      }
    }
    return undefined;
  }

  async createLicensePlate(plateData) {
    const licensePlate = {
      id: this.currentPlateId++,
      ...plateData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.licensePlates.set(licensePlate.id, licensePlate);
    return licensePlate;
  }

  async updateLicensePlate(id, updates) {
    const licensePlate = this.licensePlates.get(id);
    if (!licensePlate) {
      throw new Error('License plate not found');
    }
    
    const updatedLicensePlate = {
      ...licensePlate,
      ...updates,
      updatedAt: new Date()
    };
    this.licensePlates.set(id, updatedLicensePlate);
    return updatedLicensePlate;
  }

  async deleteLicensePlate(id) {
    if (!this.licensePlates.has(id)) {
      throw new Error('License plate not found');
    }
    this.licensePlates.delete(id);
  }
}

export const storage = new MemStorage();