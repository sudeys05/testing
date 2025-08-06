import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  badgeNumber: text("badge_number"),
  department: text("department"),
  position: text("position"),
  phone: text("phone"),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// Cases table
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"), // "open", "in_progress", "closed"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high"
  assignedOfficerId: integer("assigned_officer_id").references(() => users.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Occurrence Book entries
export const obEntries = pgTable("ob_entries", {
  id: serial("id").primaryKey(),
  obNumber: text("ob_number").notNull().unique(),
  dateTime: timestamp("date_time").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  reportedBy: text("reported_by").notNull(),
  recordingOfficerId: integer("recording_officer_id").references(() => users.id),
  location: text("location"),
  status: text("status").notNull().default("recorded"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// License plates
export const licensePlates = pgTable("license_plates", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  ownerName: text("owner_name").notNull(),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  idNumber: text("id_number"),
  passportNumber: text("passport_number"),
  ownerImage: text("owner_image"),
  addedById: integer("added_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  badgeNumber: true,
  department: true,
  position: true,
  phone: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  badgeNumber: true,
  department: true,
  position: true,
  phone: true,
}).extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  badgeNumber: true,
  department: true,
  position: true,
  phone: true,
}).partial();

export const insertCaseSchema = createInsertSchema(cases).pick({
  title: true,
  description: true,
  status: true,
  priority: true,
});

export const insertOBSchema = createInsertSchema(obEntries).pick({
  type: true,
  description: true,
  reportedBy: true,
  location: true,
});

export const insertLicensePlateSchema = createInsertSchema(licensePlates).pick({
  plateNumber: true,
  ownerName: true,
  fatherName: true,
  motherName: true,
  idNumber: true,
  passportNumber: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type OBEntry = typeof obEntries.$inferSelect;
export type InsertOBEntry = z.infer<typeof insertOBSchema>;
export type LicensePlate = typeof licensePlates.$inferSelect;
export type InsertLicensePlate = z.infer<typeof insertLicensePlateSchema>;
