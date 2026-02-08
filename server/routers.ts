import { COOKIE_NAME } from "@shared/const";
import fs from "fs";
import path from "path";
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
  getUsers,
  createUser,
  updateUser,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllPriorities,
  createPriority,
  updatePriority,
  getCategoryFailures,
  createCategoryFailure,
  updateCategoryFailure,
  deleteCategoryFailure,
  getDepartments,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getNextFolio,
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
  users,
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
    devLogin: publicProcedure
      .input(z.object({ role: z.enum(["admin", "technician", "user"]) }))
      .mutation(async ({ ctx, input }) => {
        const { ENV } = await import("./_core/env");
        if (ENV.isProduction || ENV.oAuthServerUrl) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Dev login only available in local development",
          });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const openId = `dev-${input.role}`;
        const email = `${input.role}@local.test`;
        const name =
          input.role === "admin"
            ? "Administrador"
            : input.role === "technician"
              ? "Técnico Local"
              : "Usuario Local";

        // Ensure user exists
        let user = await db
          .select()
          .from(users)
          .where(eq(users.openId, openId))
          .limit(1);

        if (!user.length) {
          await createUser({
            openId,
            name,
            email,
            role: input.role,
            department: input.role === "technician" ? "Soporte" : "General",
          });
        } else {
          // Update role if changed
          if (user[0].role !== input.role) {
            await updateUser(user[0].id, { role: input.role });
          }
          // Force update name if it was the old "Admin Local" or if we want to enforce the new name
          if (input.role === "admin" && user[0].name === "Admin Local") {
            await updateUser(user[0].id, { name: "Administrador" });
          }
        }

        // Create session
        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(openId, { name });
        const cookieOptions = getSessionCookieOptions(ctx.req);

        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true };
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
    getCategoryFailures: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await getCategoryFailures(input.categoryId);
      }),
    getDepartments: protectedProcedure.query(async () => {
      return await getDepartments();
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
            .min(3, "El título debe tener al menos 3 caracteres"),
          description: z
            .string()
            .min(10, "La descripción debe tener al menos 10 caracteres"),
          categoryId: z.number(),
          priorityId: z.number(),
          departmentId: z.number(),
          userName: z.string().min(1, "El nombre de usuario es requerido"),
          userEmail: z.string().email("Correo inválido").refine((email) => /@servyre\./.test(email), {
            message: "El correo debe ser del dominio @servyre (ej: usuario@servyre.com)"
          }),
          branch: z.enum(["SRV", "NAUC"]).default("SRV"),
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

        // Generar Folio y Número de Ticket homologados
        const nextFolioNum = await getNextFolio();
        const branchStr = input.branch || "SRV";
        const folioStr = `${branchStr} - ${nextFolioNum}`;
        const ticketNumber = `TKT-${branchStr}-${nextFolioNum}`;

        const result = await db.insert(tickets).values({
          branch: branchStr,
          folio: folioStr,
          ticketNumber,
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          statusId: initialStatus.id,
          priorityId: input.priorityId,
          departmentId: input.departmentId,
          userName: input.userName,
          userEmail: input.userEmail,
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
          content: z.string().optional(),
          isInternal: z.boolean().default(false),
          attachment: z.object({
            name: z.string(),
            base64: z.string(),
          }).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Validar que exista al menos contenido o adjunto
        if (!input.content && !input.attachment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "El comentario no puede estar vacío"
          });
        }

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

        let attachmentUrl = null;
        let attachmentName = null;

        if (input.attachment) {
          try {
            // Remove prefix if present (data:image/png;base64,)
            const base64Data = input.attachment.base64.includes(',')
              ? input.attachment.base64.split(',')[1]
              : input.attachment.base64;

            const buffer = Buffer.from(base64Data, 'base64');
            const safeName = input.attachment.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${safeName}`;
            const uploadDir = path.join(process.cwd(), 'uploads');
            const filePath = path.join(uploadDir, fileName);

            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            fs.writeFileSync(filePath, buffer);
            attachmentUrl = `/uploads/${fileName}`;
            attachmentName = input.attachment.name;
          } catch (e) {
            console.error("Error saving attachment:", e);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al guardar el archivo adjunto"
            });
          }
        }

        const result = await db.insert(ticketComments).values({
          ticketId: input.ticketId,
          userId: ctx.user.id,
          content: input.content || "",
          attachmentUrl,
          attachmentName,
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
          description: attachmentName ? "Comentario con archivo adjunto" : "Comentario agregado",
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

        const result = await db
          .select({
            id: ticketComments.id,
            ticketId: ticketComments.ticketId,
            userId: ticketComments.userId,
            content: ticketComments.content,
            attachmentUrl: ticketComments.attachmentUrl,
            attachmentName: ticketComments.attachmentName,
            isInternal: ticketComments.isInternal,
            createdAt: ticketComments.createdAt,
            updatedAt: ticketComments.updatedAt,
            userRole: users.role,
            userName: users.name,
          })
          .from(ticketComments)
          .leftJoin(users, eq(ticketComments.userId, users.id))
          .where(
            and(
              eq(ticketComments.ticketId, input.ticketId),
              isTechnicianOrAdmin ? undefined : eq(ticketComments.isInternal, false)
            )
          )
          .orderBy(desc(ticketComments.createdAt));

        return result;
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

    updateComment: adminProcedure
      .input(z.object({ commentId: z.number(), content: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .update(ticketComments)
          .set({ content: input.content, updatedAt: new Date() })
          .where(eq(ticketComments.id, input.commentId));
        return { success: true };
      }),

    deleteComment: adminProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .delete(ticketComments)
          .where(eq(ticketComments.id, input.commentId));
        return { success: true };
      }),

    updateTicketAdmin: adminProcedure
      .input(
        z.object({
          ticketId: z.number(),
          title: z.string().min(1),
          description: z.string().min(1),
          statusId: z.number(),
          priorityId: z.number(),
          categoryId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(tickets)
          .set({
            title: input.title,
            description: input.description,
            statusId: input.statusId,
            priorityId: input.priorityId,
            categoryId: input.categoryId,
            updatedAt: new Date(),
          })
          .where(eq(tickets.id, input.ticketId));

        await db.insert(ticketHistory).values({
          ticketId: input.ticketId,
          changedByUserId: ctx.user.id,
          fieldName: "admin_update",
          changeType: "update",
          description: "Actualización administrativa del ticket",
          createdAt: new Date(),
        });

        return { success: true };
      }),

    deleteTicketAdmin: adminProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Delete dependencies first (Hard Delete)
        await db
          .delete(ticketComments)
          .where(eq(ticketComments.ticketId, input.ticketId));
        await db
          .delete(ticketHistory)
          .where(eq(ticketHistory.ticketId, input.ticketId));
        await db
          .delete(notifications)
          .where(eq(notifications.ticketId, input.ticketId));
        // Delete ticket
        await db.delete(tickets).where(eq(tickets.id, input.ticketId));

        return { success: true };
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

    // Gestión de Usuarios
    getAllUsers: adminProcedure.query(async () => {
      return await getUsers();
    }),

    createUser: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          role: z.enum(["user", "technician", "admin"]),
          department: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate a random openId for manually created users
        const openId = `manual-${Math.random().toString(36).substring(2, 15)}`;
        await createUser({
          openId,
          name: input.name,
          email: input.email,
          role: input.role,
          department: input.department,
        });
        return { success: true };
      }),

    updateUser: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          role: z.enum(["user", "technician", "admin"]).optional(),
          isActive: z.boolean().optional(),
          department: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateUser(input.userId, {
          name: input.name,
          email: input.email,
          role: input.role,
          isActive: input.isActive,
          department: input.department,
        });
        return { success: true };
      }),

    deleteUser: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateUser(input.id, { isActive: false });
        return { success: true };
      }),

    // Gestión de Categorías
    createCategory: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createCategory({
          name: input.name,
          description: input.description,
          color: input.color || "#3B82F6",
        });
        return { success: true };
      }),

    updateCategory: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          color: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateCategory(input.id, {
          name: input.name,
          description: input.description,
          color: input.color,
          isActive: input.isActive,
        });
        return { success: true };
      }),

    deleteCategory: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCategory(input.id);
        return { success: true };
      }),

    // Gestión de Fallas por Categoría
    createCategoryFailure: adminProcedure
      .input(
        z.object({
          categoryId: z.number(),
          name: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        await createCategoryFailure({
          categoryId: input.categoryId,
          name: input.name,
        });
        return { success: true };
      }),

    updateCategoryFailure: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateCategoryFailure(id, data);
        return { success: true };
      }),

    deleteCategoryFailure: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCategoryFailure(input.id);
        return { success: true };
      }),

    // Gestión de Prioridades
    getAllPriorities: adminProcedure.query(async () => {
      return await getAllPriorities();
    }),

    createPriority: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          displayName: z.string().min(1),
          level: z.number(),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        })
      )
      .mutation(async ({ input }) => {
        await createPriority({
          name: input.name,
          displayName: input.displayName,
          level: input.level,
          color: input.color,
        });
        return { success: true };
      }),

    updatePriority: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          displayName: z.string().optional(),
          level: z.number().optional(),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updatePriority(id, data);
        return { success: true };
      }),

    deletePriority: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updatePriority(input.id, { isActive: false });
        return { success: true };
      }),

    // Gestión de Departamentos
    getAllDepartments: adminProcedure.query(async () => {
      return await getAllDepartments();
    }),

    createDepartment: adminProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        await createDepartment({ name: input.name });
        return { success: true };
      }),

    updateDepartment: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateDepartment(id, data);
        return { success: true };
      }),

    deleteDepartment: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteDepartment(input.id);
        return { success: true };
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
