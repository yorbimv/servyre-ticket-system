import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getDb,
  getCategories,
  getTicketStatuses,
  getPriorities,
  getTechnicians,
  getUserTickets,
  getAllTickets,
} from "./db";
import { z } from "zod";
import {
  tickets,
  ticketStatuses,
  categories,
  priorities,
  ticketComments,
  attachments,
  ticketHistory,
  notifications,
} from "../drizzle/schema";
import { eq, and, or, like, desc, asc } from "drizzle-orm";

// Procedimiento protegido solo para técnicos
const technicianProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "technician" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Solo técnicos y administradores pueden acceder",
    });
  }
  return next({ ctx });
});

// Procedimiento protegido solo para administradores
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Solo administradores pueden acceder",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Procedimientos para datos maestros
  data: router({
    getCategories: protectedProcedure.query(async () => {
      return await getCategories();
    }),
    getStatuses: protectedProcedure.query(async () => {
      return await getTicketStatuses();
    }),
    getPriorities: protectedProcedure.query(async () => {
      return await getPriorities();
    }),
    getTechnicians: protectedProcedure.query(async () => {
      return await getTechnicians();
    }),
  }),

  // Procedimientos para tickets
  tickets: router({
    // Crear ticket (usuarios finales, técnicos y admins)
    create: protectedProcedure
      .input(
        z.object({
          title: z
            .string()
            .min(5, "El título debe tener al menos 5 caracteres"),
          description: z
            .string()
            .min(10, "La descripción debe tener al menos 10 caracteres"),
          categoryId: z.number(),
          priorityId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Base de datos no disponible",
          });

        // Obtener el estado inicial (abierto/nuevo)
        const statuses = await getTicketStatuses();
        const initialStatus =
          statuses.find(s => s.name === "open") || statuses[0];

        if (!initialStatus) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Estado inicial no encontrado",
          });
        }

        // Generar número de ticket único
        const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const result = await db.insert(tickets).values({
          ticketNumber,
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          statusId: initialStatus.id,
          priorityId: input.priorityId,
          createdByUserId: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Registrar en historial
        const ticketId = (result as any).insertId;
        await db.insert(ticketHistory).values({
          ticketId,
          changedByUserId: ctx.user.id,
          fieldName: "ticket",
          changeType: "created",
          description: "Ticket creado",
          createdAt: new Date(),
        });

        // Crear notificación para administradores
        const admins = await db
          .select()
          .from(require("../drizzle/schema").users)
          .where(eq(require("../drizzle/schema").users.role, "admin"));

        for (const admin of admins) {
          await db.insert(notifications).values({
            userId: admin.id,
            ticketId,
            title: "Nuevo Ticket Creado",
            message: `${ctx.user.name} ha creado un nuevo ticket: ${input.title}`,
            type: "ticket_created",
            actionUrl: `/tickets/${ticketId}`,
            createdAt: new Date(),
          });
        }

        return { ticketId, ticketNumber };
      }),

    // Obtener mis tickets (usuarios finales)
    getMyTickets: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTickets(ctx.user.id);
    }),

    // Obtener todos los tickets (técnicos y admins)
    getAll: technicianProcedure.query(async () => {
      return await getAllTickets();
    }),

    // Obtener detalles de un ticket
    getById: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await db
          .select()
          .from(tickets)
          .where(eq(tickets.id, input.ticketId))
          .limit(1);
        const ticket = result[0];

        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket no encontrado",
          });
        }

        // Verificar permisos
        const isCreator = ticket.createdByUserId === ctx.user.id;
        const isTechnicianOrAdmin =
          ctx.user.role === "technician" || ctx.user.role === "admin";

        if (!isCreator && !isTechnicianOrAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para ver este ticket",
          });
        }

        return ticket;
      }),

    // Actualizar ticket (técnicos y admins)
    update: technicianProcedure
      .input(
        z.object({
          ticketId: z.number(),
          statusId: z.number().optional(),
          priorityId: z.number().optional(),
          assignedToUserId: z.number().optional(),
          technicalReport: z.string().optional(),
          resolutionNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const ticket = await db
          .select()
          .from(tickets)
          .where(eq(tickets.id, input.ticketId))
          .limit(1);
        if (!ticket.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket no encontrado",
          });
        }

        const updates: any = { updatedAt: new Date() };
        const changes: string[] = [];

        if (
          input.statusId !== undefined &&
          input.statusId !== ticket[0].statusId
        ) {
          updates.statusId = input.statusId;
          changes.push(`Estado cambiado`);

          // Si se marca como resuelto, registrar fecha de resolución
          const newStatus = await db
            .select()
            .from(ticketStatuses)
            .where(eq(ticketStatuses.id, input.statusId))
            .limit(1);
          if (newStatus[0]?.name === "resolved") {
            updates.resolvedAt = new Date();
          }
        }

        if (
          input.priorityId !== undefined &&
          input.priorityId !== ticket[0].priorityId
        ) {
          updates.priorityId = input.priorityId;
          changes.push(`Prioridad actualizada`);
        }

        if (
          input.assignedToUserId !== undefined &&
          input.assignedToUserId !== ticket[0].assignedToUserId
        ) {
          updates.assignedToUserId = input.assignedToUserId;
          changes.push(`Asignado a técnico`);
        }

        if (input.technicalReport !== undefined) {
          updates.technicalReport = input.technicalReport;
          changes.push(`Reporte técnico actualizado`);
        }

        if (input.resolutionNotes !== undefined) {
          updates.resolutionNotes = input.resolutionNotes;
          changes.push(`Notas de resolución actualizadas`);
        }

        await db
          .update(tickets)
          .set(updates)
          .where(eq(tickets.id, input.ticketId));

        // Registrar cambios en historial
        for (const change of changes) {
          await db.insert(ticketHistory).values({
            ticketId: input.ticketId,
            changedByUserId: ctx.user.id,
            fieldName: change,
            changeType: "other",
            description: change,
            createdAt: new Date(),
          });
        }

        // Notificar al usuario que creó el ticket
        await db.insert(notifications).values({
          userId: ticket[0].createdByUserId,
          ticketId: input.ticketId,
          title: "Tu Ticket ha sido Actualizado",
          message: `Tu ticket "${ticket[0].title}" ha sido actualizado por ${ctx.user.name}`,
          type: "ticket_status_changed",
          actionUrl: `/tickets/${input.ticketId}`,
          createdAt: new Date(),
        });

        return { success: true };
      }),

    // Agregar comentario
    addComment: protectedProcedure
      .input(
        z.object({
          ticketId: z.number(),
          content: z.string().min(1),
          isInternal: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Verificar que el ticket existe y el usuario tiene permisos
        const ticket = await db
          .select()
          .from(tickets)
          .where(eq(tickets.id, input.ticketId))
          .limit(1);
        if (!ticket.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket no encontrado",
          });
        }

        const isCreator = ticket[0].createdByUserId === ctx.user.id;
        const isTechnicianOrAdmin =
          ctx.user.role === "technician" || ctx.user.role === "admin";

        if (!isCreator && !isTechnicianOrAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Comentarios internos solo para técnicos y admins
        if (input.isInternal && !isTechnicianOrAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Solo técnicos pueden agregar comentarios internos",
          });
        }

        const result = await db.insert(ticketComments).values({
          ticketId: input.ticketId,
          userId: ctx.user.id,
          content: input.content,
          isInternal: input.isInternal,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Registrar en historial
        await db.insert(ticketHistory).values({
          ticketId: input.ticketId,
          changedByUserId: ctx.user.id,
          fieldName: "comment",
          changeType: "comment_added",
          description: "Comentario agregado",
          createdAt: new Date(),
        });

        // Notificar
        if (!input.isInternal) {
          await db.insert(notifications).values({
            userId: ticket[0].createdByUserId,
            ticketId: input.ticketId,
            title: "Nuevo Comentario en tu Ticket",
            message: `${ctx.user.name} ha comentado en tu ticket`,
            type: "comment_added",
            actionUrl: `/tickets/${input.ticketId}`,
            createdAt: new Date(),
          });
        }

        return { commentId: (result as any).insertId };
      }),

    // Obtener comentarios de un ticket
    getComments: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        // Verificar permisos
        const ticket = await db
          .select()
          .from(tickets)
          .where(eq(tickets.id, input.ticketId))
          .limit(1);
        if (!ticket.length) return [];

        const isCreator = ticket[0].createdByUserId === ctx.user.id;
        const isTechnicianOrAdmin =
          ctx.user.role === "technician" || ctx.user.role === "admin";

        if (!isCreator && !isTechnicianOrAdmin) return [];

        // Si es usuario final, no mostrar comentarios internos
        const whereClause = isTechnicianOrAdmin
          ? undefined
          : eq(ticketComments.isInternal, false);

        const comments = await db
          .select()
          .from(ticketComments)
          .where(whereClause ? whereClause : undefined);
        return comments.filter(c => c.ticketId === input.ticketId);
      }),

    // Obtener historial de un ticket
    getHistory: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        const ticket = await db
          .select()
          .from(tickets)
          .where(eq(tickets.id, input.ticketId))
          .limit(1);
        if (!ticket.length) return [];

        const isCreator = ticket[0].createdByUserId === ctx.user.id;
        const isTechnicianOrAdmin =
          ctx.user.role === "technician" || ctx.user.role === "admin";

        if (!isCreator && !isTechnicianOrAdmin) return [];

        const history = await db
          .select()
          .from(ticketHistory)
          .where(eq(ticketHistory.ticketId, input.ticketId));
        return history;
      }),
  }),

  // Procedimientos para notificaciones
  notifications: router({
    getUnread: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.user.id),
            eq(notifications.isRead, false)
          )
        );
      return userNotifications;
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, input.notificationId));
        return { success: true };
      }),
  }),

  // Procedimientos para administración
  admin: router({
    getDashboardStats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return null;

      const allTickets = await getAllTickets();
      const totalTickets = allTickets.length;
      const openTickets = allTickets.filter(t => t.statusId).length;
      const resolvedTickets = allTickets.filter(t => t.resolvedAt).length;

      return {
        totalTickets,
        openTickets,
        resolvedTickets,
        resolutionRate:
          totalTickets > 0
            ? ((resolvedTickets / totalTickets) * 100).toFixed(2)
            : "0",
      };
    }),

    generateReport: adminProcedure
      .input(
        z.object({
          month: z.number().min(1).max(12),
          year: z.number().min(2000).max(2100),
        })
      )
      .mutation(async ({ input }) => {
        const { generateMonthlyReport } = await import("./reports");
        const pdfBuffer = await generateMonthlyReport(input.month, input.year);
        return {
          success: true,
          fileName: `reporte-tickets-${input.month}-${input.year}.pdf`,
          size: pdfBuffer.length,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
