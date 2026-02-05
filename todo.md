# Servyre IT Ticket Management System - TODO

## Base de Datos

- [x] Diseñar esquema completo de base de datos
- [x] Crear tabla de usuarios con roles
- [x] Crear tabla de tickets con campos completos
- [x] Crear tabla de comentarios
- [x] Crear tabla de archivos adjuntos
- [x] Crear tabla de categorías
- [x] Crear tabla de estados
- [x] Crear tabla de logs de actividad
- [x] Crear tabla de notificaciones
- [x] Crear tabla de asignaciones de técnicos
- [x] Ejecutar migraciones de base de datos

## Autenticación y Autorización

- [x] Configurar autenticación con dominio @servyre.com
- [x] Implementar sistema de roles (usuario final, técnico, admin)
- [x] Crear procedimiento protegido para usuarios autenticados
- [x] Crear procedimiento para solo técnicos
- [x] Crear procedimiento para solo administradores
- [x] Implementar validación de dominio en login
- [x] Crear página de login personalizada

## Gestión de Tickets

- [x] Crear formulario de creación de tickets
- [ ] Implementar carga de archivos/fotografías
- [x] Crear procedimiento para crear tickets
- [x] Crear procedimiento para editar tickets
- [x] Crear procedimiento para cambiar estado de tickets
- [x] Crear procedimiento para asignar técnicos
- [x] Crear procedimiento para obtener detalles de ticket
- [x] Implementar historial de cambios en tickets
- [x] Crear sistema de comentarios en tickets

## Panel de Usuarios Finales

- [x] Crear página de mis tickets
- [x] Implementar vista de estado actual de ticket
- [x] Crear vista de detalles de ticket
- [x] Implementar seguimiento visual del progreso
- [x] Crear formulario para crear nuevo ticket
- [x] Implementar notificación de cambios en ticket

## Panel de Técnicos IT

- [x] Crear página de todos los tickets
- [x] Implementar tabla de tickets con filtros
- [x] Crear vista de detalles de ticket para técnicos
- [ ] Implementar formulario de edición de tickets
- [ ] Crear formulario para agregar informes técnicos
- [ ] Implementar asignación de tickets
- [ ] Crear sistema de cambio de estado
- [x] Implementar agregar comentarios técnicos

## Dashboard Administrativo

- [x] Crear página de dashboard
- [x] Implementar gráfico de tickets por estado
- [x] Implementar gráfico de tickets por categoría
- [x] Implementar gráfico de tendencias mensuales
- [x] Crear métrica de tiempo de resolución promedio
- [x] Crear métrica de tickets resueltos
- [x] Crear métrica de tickets pendientes
- [x] Implementar gráfico de carga de trabajo por técnico
- [x] Crear tabla de resumen de actividad reciente

## Reportería PDF

- [x] Crear procedimiento para generar reportes mensuales
- [x] Implementar generación de PDF con métricas
- [x] Crear resumen de tickets atendidos
- [x] Incluir estadísticas de rendimiento
- [ ] Incluir gráficos en PDF
- [x] Implementar descarga de reportes
- [ ] Crear programación de reportes mensuales automáticos

## Búsqueda y Filtros

- [x] Implementar búsqueda por título/descripción
- [x] Crear filtro por estado
- [x] Crear filtro por prioridad
- [ ] Crear filtro por categoría
- [ ] Crear filtro por fecha
- [ ] Crear filtro por asignado
- [ ] Crear filtro por usuario solicitante
- [x] Implementar búsqueda avanzada combinada

## Sistema de Notificaciones

- [x] Crear tabla de notificaciones
- [x] Implementar notificación al crear ticket
- [x] Implementar notificación al asignar ticket
- [x] Implementar notificación al cambiar estado
- [x] Implementar notificación al agregar comentario
- [x] Crear página de notificaciones
- [x] Implementar marcado de notificaciones como leídas

## Interfaz de Usuario

- [x] Diseñar e implementar layout principal
- [x] Crear navegación principal
- [x] Implementar sidebar para usuarios autenticados
- [x] Crear componentes reutilizables
- [x] Implementar tema visual consistente
- [x] Crear página de error 404
- [x] Implementar responsive design

## Pruebas

- [ ] Escribir pruebas unitarias para procedimientos
- [ ] Escribir pruebas de autenticación
- [ ] Escribir pruebas de autorización
- [ ] Escribir pruebas de creación de tickets
- [ ] Escribir pruebas de generación de PDF
- [ ] Realizar pruebas de integración
- [ ] Realizar pruebas de rendimiento

## Despliegue y Documentación

- [ ] Crear checkpoint inicial
- [ ] Exportar código a GitHub
- [ ] Crear documentación de uso
- [ ] Crear guía de administración
- [ ] Configurar CI/CD
- [ ] Realizar pruebas finales
- [ ] Entregar aplicación completa

## Documentación

- [x] Crear README.md con guía completa
- [x] Agregar instrucciones de instalación
- [x] Documentar configuración del proyecto
- [x] Crear guía de uso para usuarios finales
- [x] Crear guía de administración para técnicos
- [ ] Documentar API tRPC disponible
