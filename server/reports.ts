import { getDb, getAllTickets } from "./db";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { tickets } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface ReportData {
  month: string;
  year: number;
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  averageResolutionTime: string;
  ticketsByCategory: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  topTechnicians: Array<{ name: string; ticketsResolved: number }>;
}

export async function generateMonthlyReport(
  month: number,
  year: number
): Promise<Buffer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Obtener todos los tickets del mes
  const allTickets = await getAllTickets();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const monthTickets = allTickets.filter(t => {
    const ticketDate = new Date(t.createdAt);
    return ticketDate >= startDate && ticketDate <= endDate;
  });

  // Calcular estadísticas
  const totalTickets = monthTickets.length;
  const resolvedTickets = monthTickets.filter(t => t.resolvedAt).length;
  const openTickets = monthTickets.filter(t => !t.resolvedAt).length;

  // Tiempo promedio de resolución
  const resolutionTimes = monthTickets
    .filter(t => t.resolvedAt && t.createdAt)
    .map(t => {
      const created = new Date(t.createdAt).getTime();
      const resolved = new Date(t.resolvedAt!).getTime();
      return (resolved - created) / (1000 * 60 * 60); // en horas
    });

  const averageResolutionTime =
    resolutionTimes.length > 0
      ? (
          resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        ).toFixed(2)
      : "N/A";

  // Agrupar por categoría
  const ticketsByCategory: Record<string, number> = {};
  monthTickets.forEach(t => {
    const cat = `Categoría ${t.categoryId}`;
    ticketsByCategory[cat] = (ticketsByCategory[cat] || 0) + 1;
  });

  // Agrupar por prioridad
  const ticketsByPriority: Record<string, number> = {
    Crítica: monthTickets.filter(t => t.priorityId === 1).length,
    Alta: monthTickets.filter(t => t.priorityId === 2).length,
    Media: monthTickets.filter(t => t.priorityId === 3).length,
    Baja: monthTickets.filter(t => t.priorityId === 4).length,
  };

  // Agrupar por estado
  const ticketsByStatus: Record<string, number> = {
    Abierto: monthTickets.filter(t => t.statusId === 1).length,
    "En Progreso": monthTickets.filter(t => t.statusId === 2).length,
    Resuelto: monthTickets.filter(t => t.statusId === 3).length,
    Cerrado: monthTickets.filter(t => t.statusId === 4).length,
  };

  // Crear documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Tamaño carta
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let yPosition = height - 50;
  const margin = 50;
  const lineHeight = 20;

  // Título
  page.drawText("Reporte Mensual de Tickets", {
    x: margin,
    y: yPosition,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;

  // Período
  const monthName = new Date(year, month - 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  page.drawText(`Período: ${monthName}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: helvetica,
    color: rgb(100, 100, 100),
  });

  yPosition -= 30;

  // Sección de Resumen
  page.drawText("Resumen Ejecutivo", {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;

  const summaryItems = [
    `Total de Tickets: ${totalTickets}`,
    `Tickets Resueltos: ${resolvedTickets}`,
    `Tickets Abiertos: ${openTickets}`,
    `Tiempo Promedio de Resolución: ${averageResolutionTime} horas`,
    `Tasa de Resolución: ${totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(2) : 0}%`,
  ];

  summaryItems.forEach(item => {
    page.drawText(item, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;
  });

  yPosition -= 20;

  // Sección de Distribución por Prioridad
  page.drawText("Distribución por Prioridad", {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;

  Object.entries(ticketsByPriority).forEach(([priority, count]) => {
    page.drawText(`${priority}: ${count}`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;
  });

  yPosition -= 20;

  // Sección de Distribución por Estado
  page.drawText("Distribución por Estado", {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;

  Object.entries(ticketsByStatus).forEach(([status, count]) => {
    page.drawText(`${status}: ${count}`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;
  });

  // Pie de página
  page.drawText(`Generado: ${new Date().toLocaleDateString("es-ES")}`, {
    x: margin,
    y: 30,
    size: 10,
    font: helvetica,
    color: rgb(150, 150, 150),
  });

  page.drawText("Servyre IT - Sistema de Gestión de Tickets", {
    x: width - margin - 200,
    y: 30,
    size: 10,
    font: helvetica,
    color: rgb(150, 150, 150),
  });

  // Guardar PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function getReportData(
  month: number,
  year: number
): Promise<ReportData> {
  const allTickets = await getAllTickets();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const monthTickets = allTickets.filter(t => {
    const ticketDate = new Date(t.createdAt);
    return ticketDate >= startDate && ticketDate <= endDate;
  });

  const totalTickets = monthTickets.length;
  const resolvedTickets = monthTickets.filter(t => t.resolvedAt).length;
  const openTickets = monthTickets.filter(t => !t.resolvedAt).length;

  const resolutionTimes = monthTickets
    .filter(t => t.resolvedAt && t.createdAt)
    .map(t => {
      const created = new Date(t.createdAt).getTime();
      const resolved = new Date(t.resolvedAt!).getTime();
      return (resolved - created) / (1000 * 60 * 60);
    });

  const averageResolutionTime =
    resolutionTimes.length > 0
      ? (
          resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        ).toFixed(2)
      : "N/A";

  const ticketsByCategory: Record<string, number> = {};
  monthTickets.forEach(t => {
    const cat = `Categoría ${t.categoryId}`;
    ticketsByCategory[cat] = (ticketsByCategory[cat] || 0) + 1;
  });

  const ticketsByPriority: Record<string, number> = {
    Crítica: monthTickets.filter(t => t.priorityId === 1).length,
    Alta: monthTickets.filter(t => t.priorityId === 2).length,
    Media: monthTickets.filter(t => t.priorityId === 3).length,
    Baja: monthTickets.filter(t => t.priorityId === 4).length,
  };

  const ticketsByStatus: Record<string, number> = {
    Abierto: monthTickets.filter(t => t.statusId === 1).length,
    "En Progreso": monthTickets.filter(t => t.statusId === 2).length,
    Resuelto: monthTickets.filter(t => t.statusId === 3).length,
    Cerrado: monthTickets.filter(t => t.statusId === 4).length,
  };

  return {
    month: new Date(year, month - 1).toLocaleDateString("es-ES", {
      month: "long",
    }),
    year,
    totalTickets,
    resolvedTickets,
    openTickets,
    averageResolutionTime,
    ticketsByCategory,
    ticketsByPriority,
    ticketsByStatus,
    topTechnicians: [],
  };
}
