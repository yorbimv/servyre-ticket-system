import { eq, ne, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertCategory, InsertUser, InsertPriority, InsertCategoryFailure, InsertDepartment,
  users, categories, priorities, categoryFailures, departments, tickets, ticketStatuses
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId || !user.email) {
    throw new Error("User openId and email are required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod", "department"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (user.isActive !== undefined) {
      values.isActive = user.isActive;
      updateSet.isActive = user.isActive;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// Funciones de consulta para tickets
export async function getTicketById(ticketId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: tickets.id,
      ticketNumber: tickets.ticketNumber,
      folio: tickets.folio,
      title: tickets.title,
      description: tickets.description,
      statusId: tickets.statusId,
      priorityId: tickets.priorityId,
      categoryId: tickets.categoryId,
      createdByUserId: tickets.createdByUserId,
      assignedToUserId: tickets.assignedToUserId,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      resolvedAt: tickets.resolvedAt,
      userName: users.name,
      commentCount: sql<number>`(SELECT COUNT(*) FROM ticket_comments WHERE ticket_comments.ticketId = tickets.id)`.mapWith(Number),
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.createdByUserId, users.id))
    .where(eq(tickets.createdByUserId, userId))
    .orderBy(desc(tickets.createdAt));

  return result;
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: tickets.id,
      folio: tickets.folio,
      ticketNumber: tickets.ticketNumber,
      title: tickets.title,
      description: tickets.description,
      statusId: tickets.statusId,
      priorityId: tickets.priorityId,
      categoryId: tickets.categoryId,
      createdByUserId: tickets.createdByUserId,
      assignedToUserId: tickets.assignedToUserId,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      resolvedAt: tickets.resolvedAt,
      userName: users.name,
      commentCount: sql<number>`(SELECT COUNT(*) FROM ticket_comments WHERE ticket_comments.ticketId = tickets.id)`.mapWith(Number),
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.createdByUserId, users.id))
    .orderBy(desc(tickets.createdAt));

  return result;
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true));
  return result;
}

export async function getCategoryFailures(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(categoryFailures)
    .where(and(eq(categoryFailures.categoryId, categoryId), eq(categoryFailures.isActive, true)));
  return result;
}

export async function getTicketStatuses() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(ticketStatuses)
    .where(eq(ticketStatuses.isActive, true));
  return result;
}

export async function getPriorities() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(priorities)
    .where(eq(priorities.isActive, true));
  return result;
}

export async function getAllPriorities() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(priorities);
}

export async function createPriority(data: InsertPriority) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(priorities).values(data);
}

export async function updatePriority(id: number, data: Partial<InsertPriority>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(priorities).set(data).where(eq(priorities.id, id));
}

export async function getTechnicians() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(users).where(eq(users.role, "technician"));
  return result;
}

// Admin functions for User Management
export async function getUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(users).values({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  });
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

// Admin functions for Category Management
export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(categories).set({ ...data, updatedAt: new Date() }).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Soft delete or hard delete? Let's go with deactivating first or check schema.
  // Schema has isActive, so let's use that.
  await db.update(categories).set({ isActive: false, updatedAt: new Date() }).where(eq(categories.id, id));
}

export async function getAllCategoryFailures() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categoryFailures);
}

export async function createCategoryFailure(data: InsertCategoryFailure) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(categoryFailures).values(data);
}

export async function updateCategoryFailure(id: number, data: Partial<InsertCategoryFailure>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categoryFailures).set({ ...data, updatedAt: new Date() }).where(eq(categoryFailures.id, id));
}

export async function deleteCategoryFailure(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categoryFailures).set({ isActive: false, updatedAt: new Date() }).where(eq(categoryFailures.id, id));
}

// Department Management
export async function getDepartments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(departments).where(eq(departments.isActive, true));
}

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(departments);
}

export async function createDepartment(data: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(departments).values(data);
}

export async function updateDepartment(id: number, data: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(departments).set({ ...data, updatedAt: new Date() }).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(departments).set({ isActive: false, updatedAt: new Date() }).where(eq(departments.id, id));
}

// Folio Generation
export async function getNextFolio(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allTickets = await db
    .select({ folio: tickets.folio })
    .from(tickets);

  if (allTickets.length === 0) {
    return 1000; // Start folios at 1000
  }

  // Parse the numeric part from folios like "SRV - 1001"
  const numericFolios = allTickets
    .map(t => {
      const parts = t.folio.split("-");
      const lastPart = parts[parts.length - 1].trim();
      const num = parseInt(lastPart);
      return isNaN(num) ? 0 : num;
    })
    .filter(num => num > 0);

  if (numericFolios.length === 0) {
    return 1000;
  }

  return Math.max(...numericFolios) + 1;
}
