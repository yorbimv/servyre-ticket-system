import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable(
  "users",
  {
    /**
     * Surrogate primary key. Auto-incremented numeric value managed by the database.
     * Use this for relations between tables.
     */
    id: int("id").autoincrement().primaryKey(),
    /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).notNull().unique(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "technician", "admin"])
      .default("user")
      .notNull(),
    department: varchar("department", { length: 255 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categorías de tickets
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Estados de tickets
export const ticketStatuses = mysqlTable("ticket_statuses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 50 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#6B7280").notNull(),
  order: int("order").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketStatus = typeof ticketStatuses.$inferSelect;
export type InsertTicketStatus = typeof ticketStatuses.$inferInsert;

// Prioridades de tickets
export const priorities = mysqlTable("priorities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 50 }).notNull(),
  level: int("level").notNull(),
  color: varchar("color", { length: 7 }).default("#6B7280").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Priority = typeof priorities.$inferSelect;
export type InsertPriority = typeof priorities.$inferInsert;

// Tickets
export const tickets = mysqlTable(
  "tickets",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    categoryId: int("categoryId").notNull(),
    statusId: int("statusId").notNull(),
    priorityId: int("priorityId").notNull(),
    createdByUserId: int("createdByUserId").notNull(),
    assignedToUserId: int("assignedToUserId"),
    technicalReport: text("technicalReport"),
    resolutionNotes: text("resolutionNotes"),
    estimatedResolutionTime: varchar("estimatedResolutionTime", {
      length: 100,
    }),
    actualResolutionTime: decimal("actualResolutionTime", {
      precision: 10,
      scale: 2,
    }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
  },
  table => ({
    ticketNumberIdx: index("ticketNumber_idx").on(table.ticketNumber),
    statusIdx: index("status_idx").on(table.statusId),
    categoryIdx: index("category_idx").on(table.categoryId),
    priorityIdx: index("priority_idx").on(table.priorityId),
    createdByIdx: index("createdBy_idx").on(table.createdByUserId),
    assignedToIdx: index("assignedTo_idx").on(table.assignedToUserId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// Comentarios en tickets
export const ticketComments = mysqlTable(
  "ticket_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull(),
    userId: int("userId").notNull(),
    content: text("content").notNull(),
    isInternal: boolean("isInternal").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    ticketIdx: index("ticketId_idx").on(table.ticketId),
    userIdx: index("userId_idx").on(table.userId),
  })
);

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = typeof ticketComments.$inferInsert;

// Archivos adjuntos
export const attachments = mysqlTable(
  "attachments",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull(),
    uploadedByUserId: int("uploadedByUserId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileKey: varchar("fileKey", { length: 500 }).notNull(),
    fileUrl: text("fileUrl").notNull(),
    fileSize: int("fileSize").notNull(),
    mimeType: varchar("mimeType", { length: 100 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    ticketIdx: index("ticketId_idx").on(table.ticketId),
    uploadedByIdx: index("uploadedBy_idx").on(table.uploadedByUserId),
  })
);

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

// Historial de cambios en tickets
export const ticketHistory = mysqlTable(
  "ticket_history",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull(),
    changedByUserId: int("changedByUserId").notNull(),
    fieldName: varchar("fieldName", { length: 100 }).notNull(),
    oldValue: text("oldValue"),
    newValue: text("newValue"),
    changeType: mysqlEnum("changeType", [
      "created",
      "status_changed",
      "assigned",
      "priority_changed",
      "category_changed",
      "comment_added",
      "attachment_added",
      "other",
    ]).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    ticketIdx: index("ticketId_idx").on(table.ticketId),
    changedByIdx: index("changedBy_idx").on(table.changedByUserId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type TicketHistoryRecord = typeof ticketHistory.$inferSelect;
export type InsertTicketHistoryRecord = typeof ticketHistory.$inferInsert;

// Notificaciones
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    ticketId: int("ticketId"),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: mysqlEnum("type", [
      "ticket_created",
      "ticket_assigned",
      "ticket_status_changed",
      "comment_added",
      "attachment_added",
      "ticket_resolved",
      "general",
    ]).notNull(),
    isRead: boolean("isRead").default(false).notNull(),
    actionUrl: varchar("actionUrl", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("userId_idx").on(table.userId),
    ticketIdx: index("ticketId_idx").on(table.ticketId),
    isReadIdx: index("isRead_idx").on(table.isRead),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Logs de actividad
export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    action: varchar("action", { length: 255 }).notNull(),
    entityType: varchar("entityType", { length: 100 }).notNull(),
    entityId: int("entityId"),
    details: text("details"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("userId_idx").on(table.userId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  createdTickets: many(tickets, { relationName: "createdTickets" }),
  assignedTickets: many(tickets, { relationName: "assignedTickets" }),
  comments: many(ticketComments),
  attachments: many(attachments),
  notifications: many(notifications),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  category: one(categories, {
    fields: [tickets.categoryId],
    references: [categories.id],
  }),
  status: one(ticketStatuses, {
    fields: [tickets.statusId],
    references: [ticketStatuses.id],
  }),
  priority: one(priorities, {
    fields: [tickets.priorityId],
    references: [priorities.id],
  }),
  createdBy: one(users, {
    fields: [tickets.createdByUserId],
    references: [users.id],
    relationName: "createdTickets",
  }),
  assignedTo: one(users, {
    fields: [tickets.assignedToUserId],
    references: [users.id],
    relationName: "assignedTickets",
  }),
  comments: many(ticketComments),
  attachments: many(attachments),
  history: many(ticketHistory),
  notifications: many(notifications),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, { fields: [ticketComments.userId], references: [users.id] }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [attachments.ticketId],
    references: [tickets.id],
  }),
  uploadedBy: one(users, {
    fields: [attachments.uploadedByUserId],
    references: [users.id],
  }),
}));

export const ticketHistoryRelations = relations(ticketHistory, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketHistory.ticketId],
    references: [tickets.id],
  }),
  changedBy: one(users, {
    fields: [ticketHistory.changedByUserId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  ticket: one(tickets, {
    fields: [notifications.ticketId],
    references: [tickets.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tickets: many(tickets),
}));

export const ticketStatusesRelations = relations(
  ticketStatuses,
  ({ many }) => ({
    tickets: many(tickets),
  })
);

export const prioritiesRelations = relations(priorities, ({ many }) => ({
  tickets: many(tickets),
}));
