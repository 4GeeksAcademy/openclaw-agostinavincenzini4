---
name: 4geeks-feedback
description: "Consulta evaluaciones, calificaciones y feedback disponibles sobre las tareas propias; distingue completadas, evaluadas y pendientes de revisión sin asumir que DONE significa calificada."
---

# Consultar evaluaciones y feedback

Usa esta skill cuando Agos pregunte por calificaciones, evaluaciones o comentarios de sus tareas. Sigue `../../docs/STUDENT_API_CALLS_REFERENCE.es.md` y el manejo seguro de `TOKEN_4GEEKS` de `../4geeks-auth/SKILL.md`.

## Procedimiento

1. Consulta solo endpoints GET autenticados usando `TOKEN_4GEEKS` en memoria. No muestres token, cabeceras ni cuerpos crudos. **Listo cuando:** token presente y URL permitida.
2. Lista todas las tareas propias mediante `GET /v1/assignment/user/me/task` y pagina. Separa `PROJECT` y `EXERCISE`; conserva los estados tal como la API los entrega. `DONE` indica completada por el estudiante, no necesariamente calificada. En detalle, usa `revision_status` y `reviewed_at` si existen para determinar estado de revisión; no inventes una puntuación ni comentarios a partir del estado. **Listo cuando:** lista completa o error/paginación parcial indicados.
3. Para tareas relevantes completadas o con estado de revisión consulta `GET /v1/assignment/task/{task_id}`. No excedas 100 detalles por ejecución. Si detalle devuelve 403 u otro error, registra ese código por agregado y continúa. Extrae únicamente campos inequívocos de puntuación/calificación y feedback/comentarios; no conviertas valores ausentes en cero ni imprimas contenidos ajenos. **Listo cuando:** cada detalle intentado tiene resultado explícito.
4. Resume cantidad de detalles consultados y cuántos contenían puntuación y feedback. Separa completadas sin evidencia de evaluación, evaluadas con datos explícitos y pendientes de revisión cuando la API lo permita; explica cuándo el estado no es suficiente para clasificar. **Listo cuando:** no se atribuyen campos inexistentes.

## Seguridad

Solo GET. Nunca usar `PUT /v1/assignment/task/{task_id}` ni `POST /v1/assignment/task/{task_id}/deliver`. No persistir respuestas ni exponer datos personales.

## Helper

Ejecuta `node "<directorio de esta skill>/scripts/list-feedback.mjs"`. Devuelve agregados y detalles de evaluación disponibles; no emite registros completos de tareas ni cuerpos crudos.
