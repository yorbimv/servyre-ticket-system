# Guía de Administración - Servyre IT Ticket System

Documentación completa para técnicos IT y administradores del sistema de gestión de tickets.

## 📑 Tabla de Contenidos

1. [Panel de Técnicos IT](#panel-de-técnicos-it)
2. [Panel de Administración](#panel-de-administración)
3. [Gestión de Tickets](#gestión-de-tickets)
4. [Dashboard y Reportes](#dashboard-y-reportes)
5. [Configuración del Sistema](#configuración-del-sistema)
6. [Mejores Prácticas](#mejores-prácticas)

---

## Panel de Técnicos IT

### Acceso al Sistema

Los técnicos acceden al sistema con sus credenciales @servyre.com. Al iniciar sesión, verán un menú lateral con acceso a:

- **Mis Tickets**: Tickets asignados al técnico actual
- **Todos los Tickets**: Vista completa de todos los tickets del sistema
- **Dashboard**: Métricas y estadísticas en tiempo real
- **Administración**: Herramientas administrativas (solo para admins)

### Vista de Todos los Tickets

La página "Todos los Tickets" es el centro de operaciones para técnicos. Aquí pueden:

**Buscar Tickets**
- Usa la barra de búsqueda para encontrar por título o número de ticket
- La búsqueda es en tiempo real y filtra mientras escribes

**Filtrar por Estado**
- **Abierto**: Tickets nuevos sin asignar
- **En Progreso**: Tickets en los que se está trabajando
- **Resuelto**: Tickets completados
- **Cerrado**: Tickets archivados

**Filtrar por Prioridad**
- **Crítica**: Requiere atención inmediata
- **Alta**: Importante, resolver pronto
- **Media**: Urgencia normal
- **Baja**: Puede esperar

### Gestionar un Ticket

**Abrir Detalles del Ticket**

Haz clic en cualquier ticket para ver:
- Información completa del problema
- Historial de cambios
- Comentarios del usuario y del equipo
- Archivos adjuntos
- Estado actual y asignación

**Cambiar Estado del Ticket**

1. Abre el ticket
2. En la sección de detalles, selecciona el nuevo estado
3. El usuario será notificado automáticamente

Flujo típico de estados:
```
Abierto → En Progreso → Resuelto → Cerrado
```

**Asignar Ticket**

1. Abre el ticket
2. Haz clic en "Asignar"
3. Selecciona el técnico responsable
4. El técnico recibirá una notificación

**Agregar Reporte Técnico**

Los reportes técnicos documentan la solución implementada:

1. Abre el ticket
2. Ve a la sección "Reporte Técnico"
3. Describe:
   - Problema identificado
   - Pasos realizados
   - Solución implementada
   - Resultados de la prueba

Ejemplo de reporte:
```
Problema: Usuario no puede acceder a la red WiFi corporativa

Pasos realizados:
1. Verificar configuración de red en dispositivo
2. Reiniciar router WiFi
3. Actualizar drivers de red
4. Reconfigurarse a la red corporativa

Solución: El problema era causado por drivers desactualizados. 
Se actualizaron los drivers y se reconectó a la red.

Resultado: Usuario puede acceder correctamente a la red.
```

**Agregar Comentarios**

Hay dos tipos de comentarios:

- **Comentarios Públicos**: Visibles para el usuario que creó el ticket
- **Comentarios Internos**: Solo visibles para técnicos

Usa comentarios públicos para:
- Pedir más información al usuario
- Informar sobre el progreso
- Solicitar confirmación de la solución

Usa comentarios internos para:
- Notas técnicas
- Coordinación con otros técnicos
- Problemas identificados

### Priorización de Trabajo

**Orden de Atención Recomendado**

1. Tickets Críticos abiertos
2. Tickets de Alta prioridad en progreso
3. Tickets de Media prioridad
4. Tickets de Baja prioridad

**Tiempo de Respuesta Objetivo**

| Prioridad | Respuesta Inicial | Resolución |
|-----------|------------------|-----------|
| Crítica | 15 minutos | 2 horas |
| Alta | 1 hora | 8 horas |
| Media | 4 horas | 24 horas |
| Baja | 24 horas | 72 horas |

---

## Panel de Administración

### Acceso Administrativo

Solo usuarios con rol "admin" pueden acceder a:
- Dashboard administrativo
- Generación de reportes
- Configuración del sistema
- Gestión de usuarios

### Dashboard Administrativo

El dashboard proporciona una visión general del sistema:

**Métricas Clave**

- **Total de Tickets**: Todos los tickets en el sistema
- **Tickets Abiertos**: Tickets sin resolver
- **Tickets Resueltos**: Tickets completados
- **Tasa de Resolución**: Porcentaje de tickets resueltos

**Gráficos**

- **Tickets por Estado**: Distribución visual de estados
- **Tickets por Prioridad**: Distribución por urgencia
- **Tendencias Mensuales**: Evolución de tickets en el tiempo

**Tickets Recientes**

Muestra los 5 últimos tickets creados con su estado actual.

### Generación de Reportes

Los reportes PDF mensuales son herramientas clave para análisis:

**Crear un Reporte**

1. Ve a "Administración"
2. En "Generar Reportes Mensuales":
   - Selecciona el mes
   - Selecciona el año
3. Haz clic en "Generar Reporte"
4. Se descargará un archivo PDF

**Contenido del Reporte**

El reporte incluye:

- **Resumen Ejecutivo**
  - Total de tickets del período
  - Tickets resueltos vs abiertos
  - Tasa de resolución
  - Tiempo promedio de resolución

- **Distribución por Prioridad**
  - Cantidad de tickets por nivel
  - Porcentaje de cada prioridad

- **Distribución por Estado**
  - Tickets abiertos
  - Tickets en progreso
  - Tickets resueltos
  - Tickets cerrados

- **Estadísticas de Rendimiento**
  - Tickets procesados
  - Velocidad de resolución
  - Tendencias

**Usar Reportes para Análisis**

Los reportes ayudan a:
- Identificar tendencias
- Evaluar rendimiento del equipo
- Planificar recursos
- Comunicar métricas a la gerencia

Ejemplo de análisis:
- Si la tasa de resolución es baja, puede haber falta de personal
- Si hay muchos tickets críticos sin resolver, necesitas priorizar
- Si el tiempo promedio de resolución aumenta, investiga causas

---

## Gestión de Tickets

### Ciclo de Vida del Ticket

```
1. CREACIÓN
   └─ Usuario crea ticket
   └─ Sistema asigna número único
   └─ Se notifica a administradores

2. ASIGNACIÓN
   └─ Técnico revisa ticket
   └─ Se asigna a técnico responsable
   └─ Técnico recibe notificación

3. INVESTIGACIÓN
   └─ Técnico analiza el problema
   └─ Agrega comentarios con hallazgos
   └─ Cambia estado a "En Progreso"

4. RESOLUCIÓN
   └─ Técnico implementa solución
   └─ Agrega reporte técnico
   └─ Realiza pruebas

5. CIERRE
   └─ Cambia estado a "Resuelto"
   └─ Usuario recibe notificación
   └─ Usuario confirma resolución
   └─ Ticket se cierra automáticamente
```

### Escalación de Tickets

Algunos tickets pueden requerir escalación:

**Cuándo Escalar**

- Problema requiere acceso a sistemas especializados
- Problema está fuera del alcance del técnico
- Problema requiere coordinación con otro departamento
- Problema es crítico y necesita atención inmediata

**Cómo Escalar**

1. Abre el ticket
2. Agrega un comentario interno explicando la razón
3. Asigna el ticket a un técnico senior o administrador
4. Cambia la prioridad si es necesario
5. El nuevo responsable recibirá notificación

### Gestión de Archivos Adjuntos

Los usuarios pueden adjuntar archivos (fotos, documentos, etc.):

**Tipos de Archivo Soportados**
- Imágenes: JPG, PNG, GIF, WebP
- Documentos: PDF, DOC, DOCX, XLS, XLSX
- Archivos: ZIP, RAR, 7Z
- Otros: TXT, CSV, JSON

**Tamaño Máximo**: 50 MB por archivo

**Descargar Archivos**

En la página de detalles del ticket, puedes descargar cualquier archivo adjunto haciendo clic en el nombre del archivo.

---

## Dashboard y Reportes

### Interpretación del Dashboard

**Tickets por Estado**

El gráfico circular muestra la distribución:
- **Abierto (Azul)**: Nuevos tickets sin asignar
- **En Progreso (Púrpura)**: Tickets siendo resueltos
- **Resuelto (Verde)**: Tickets completados
- **Cerrado (Rojo)**: Tickets archivados

Un alto número de tickets "Abiertos" indica necesidad de más personal.

**Tickets por Prioridad**

El gráfico de barras muestra:
- **Crítica (Rojo)**: Requiere atención inmediata
- **Alta (Naranja)**: Importante
- **Media (Amarillo)**: Urgencia normal
- **Baja (Verde)**: Puede esperar

Un alto número de tickets críticos indica problemas sistémicos.

### Análisis de Tendencias

**Preguntas Clave a Responder**

1. ¿Está aumentando o disminuyendo el volumen de tickets?
2. ¿Cuál es la distribución de prioridades?
3. ¿Cuál es el tiempo promedio de resolución?
4. ¿Hay técnicos sobrecargados?
5. ¿Qué categorías generan más tickets?

**Acciones Basadas en Análisis**

| Observación | Acción |
|-------------|--------|
| Aumento de tickets | Aumentar personal o automatizar |
| Muchos críticos | Investigar causa raíz |
| Tiempo de resolución alto | Capacitar equipo o mejorar procesos |
| Un técnico sobrecargado | Redistribuir carga de trabajo |
| Categoría con muchos tickets | Crear documentación o automatizar |

---

## Configuración del Sistema

### Información General del Sistema

**Nombre de la Aplicación**: Servyre IT Ticket System

**Versión**: 1.0.0

**Descripción**: Sistema de gestión de tickets de soporte IT para Servyre

### Categorías de Tickets

Las categorías ayudan a organizar tickets:

**Categorías Predefinidas**
- Hardware: Problemas con computadoras, periféricos
- Software: Problemas con aplicaciones
- Red: Problemas de conectividad
- Acceso: Problemas de permisos y autenticación
- Otro: Problemas no clasificados

**Crear Nueva Categoría** (requiere acceso de base de datos)

Contacta con el administrador del sistema para agregar nuevas categorías.

### Estados de Tickets

Los estados predefinidos son:

1. **Abierto**: Ticket nuevo, sin asignar
2. **En Progreso**: Técnico está trabajando
3. **Resuelto**: Problema solucionado
4. **Cerrado**: Ticket archivado

### Niveles de Prioridad

1. **Crítica**: Afecta a múltiples usuarios o servicios críticos
2. **Alta**: Afecta a usuarios o servicios importantes
3. **Media**: Afecta a funcionalidad normal
4. **Baja**: Mejoras o problemas menores

---

## Mejores Prácticas

### Para Técnicos

**Comunicación Efectiva**

- Responde rápidamente a los usuarios
- Sé claro y específico en comentarios
- Evita jerga técnica en comentarios públicos
- Mantén al usuario informado del progreso

**Documentación**

- Siempre agrega un reporte técnico antes de cerrar
- Documenta pasos realizados
- Explica la solución implementada
- Incluye cualquier recomendación para el futuro

**Priorización**

- Atiende tickets críticos primero
- No dejes tickets en progreso sin actualizar
- Cierra tickets resueltos prontamente
- Escala cuando sea necesario

**Calidad**

- Verifica que la solución funciona antes de cerrar
- Pide confirmación al usuario cuando sea posible
- Aprende de cada ticket
- Comparte conocimiento con el equipo

### Para Administradores

**Monitoreo Regular**

- Revisa el dashboard diariamente
- Genera reportes mensuales
- Identifica tendencias y problemas
- Toma decisiones basadas en datos

**Gestión de Recursos**

- Distribuye carga de trabajo equitativamente
- Identifica técnicos sobrecargados
- Planifica capacitación
- Optimiza procesos

**Mejora Continua**

- Analiza reportes para identificar mejoras
- Implementa cambios basados en datos
- Recopila feedback del equipo
- Actualiza procedimientos regularmente

**Seguridad**

- Mantén credenciales seguras
- Revisa accesos regularmente
- Capacita al equipo en seguridad
- Realiza auditorías periódicas

### Checklist Diario

- [ ] Revisar tickets críticos abiertos
- [ ] Verificar notificaciones nuevas
- [ ] Asignar tickets sin asignar
- [ ] Actualizar estado de tickets en progreso
- [ ] Responder comentarios de usuarios
- [ ] Cerrar tickets resueltos

### Checklist Mensual

- [ ] Generar reporte mensual
- [ ] Analizar tendencias
- [ ] Revisar rendimiento del equipo
- [ ] Actualizar documentación
- [ ] Planificar mejoras
- [ ] Comunicar métricas a gerencia

---

## Troubleshooting para Administradores

**Problema: Tickets no se asignan correctamente**
- Verifica que los técnicos tienen rol "technician"
- Comprueba que los técnicos están activos en el sistema
- Reinicia el servidor si es necesario

**Problema: Notificaciones no se envían**
- Verifica configuración de notificaciones
- Comprueba que los usuarios tienen email válido
- Revisa logs del sistema

**Problema: Reportes PDF no se generan**
- Verifica que hay datos en la base de datos
- Comprueba permisos de archivo
- Reinicia el servidor

**Problema: Dashboard muestra datos incorrectos**
- Limpia caché del navegador
- Recarga la página
- Verifica integridad de datos en base de datos

---

**Última actualización**: Febrero 2026  
**Para soporte**: Contacta al equipo de desarrollo
