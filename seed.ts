import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema";
import "dotenv/config";

async function seed() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        return;
    }

    const db = drizzle(process.env.DATABASE_URL);
    console.log("Seeding database...");

    // Seed Statuses
    const statuses = [
        { name: "open", displayName: "Abierto", color: "#3B82F6", order: 1 },
        { name: "in_progress", displayName: "En Progreso", color: "#F59E0B", order: 2 },
        { name: "pending", displayName: "Pendiente", color: "#6B7280", order: 3 },
        { name: "resolved", displayName: "Resuelto", color: "#10B981", order: 4 },
        { name: "closed", displayName: "Cerrado", color: "#000000", order: 5 },
    ];

    for (const status of statuses) {
        try {
            await db.insert(schema.ticketStatuses).values(status);
            console.log(`Seeded status: ${status.name}`);
        } catch (e) {
            console.log(`Status ${status.name} already exists or error:`, e.message);
        }
    }

    // Seed Priorities
    const priorities = [
        { name: "low", displayName: "Baja", level: 10, color: "#9CA3AF" },
        { name: "medium", displayName: "Media", level: 50, color: "#3B82F6" },
        { name: "high", displayName: "Alta", level: 80, color: "#F59E0B" },
        { name: "urgent", displayName: "¡Urgente!", level: 100, color: "#EF4444" },
    ];

    for (const prio of priorities) {
        try {
            await db.insert(schema.priorities).values(prio);
            console.log(`Seeded priority: ${prio.name}`);
        } catch (e) {
            console.log(`Priority ${prio.name} already exists or error:`, e.message);
        }
    }

    // Seed Departments
    const departments = [
        { name: "IT" },
        { name: "Licitaciones" },
        { name: "Compras" },
        { name: "Recursos Humanos" },
        { name: "Dirección" },
    ];

    for (const dept of departments) {
        try {
            await db.insert(schema.departments).values(dept);
            console.log(`Seeded department: ${dept.name}`);
        } catch (e) {
            console.log(`Department ${dept.name} already exists or error:`, e.message);
        }
    }

    console.log("Seeding completed!");
    process.exit(0);
}

seed();
