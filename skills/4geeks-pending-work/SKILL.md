---
name: 4geeks-pending-work
description: "Consulta tareas asignadas pendientes o rechazadas que requieren correcciones, separadas por cohorte y tipo (proyecto, ejercicio, lección); solo lectura, sin modificar ni entregar trabajos."
---

# Identificar trabajo pendiente de 4Geeks

Usa esta skill cuando Agos quiera identificar tareas, ejercicios y proyectos aún por completar, incluyendo tareas rechazadas que requieren corrección. Sigue `../../docs/STUDENT_API_CALLS_REFERENCE.es.md` como contrato y reutiliza el manejo de credenciales de `../4geeks-auth/SKILL.md`.

## Procedimiento

1. **Preparar la consulta segura.** Usa `TOKEN_4GEEKS` solo en memoria, cabecera `Authorization: Token …`; no mostrar, imprimir, registrar ni pedir el secreto. Base: `BREATHECODE_API_URL` si está configurada, de otro modo `https://breathecode.herokuapp.com`. **Listo cuando:** token presente y URL válida, sin filtrar credenciales.
2. **Intentar identificar cohorte (opcional).** La referencia documenta `GET /v1/admissions/academy/cohort/me`, pero no debe ser requisito para consultar tareas. Intenta resolver una única cohorte propia cuyo nombre/slug identifique AI Engineering. Si falla, es ambiguo o no aparece, registra de forma segura que el filtro de cohorte no se aplicó y continúa con consultas autenticadas al endpoint de tareas, que la referencia indica que suele limitarse a cohortes del propio usuario. No afirmes que el resultado es exclusivo de AI Engineering si no se verificó. **Listo cuando:** se conoce si la cohorte se identificó o si las consultas serán sin ese filtro.
3. **Buscar PENDING y REJECTED por tipo.** Consulta `GET /v1/assignment/user/me/task` filtrando `task_status=PENDING` o `REJECTED`, y `task_type=PROJECT`, `EXERCISE` o `LESSON`; añade `cohort=<id>` solo si se verificó la cohorte. Pagina con `limit`/`offset`. Mantén los estados separados. `PENDING` significa pendiente; `REJECTED` significa rechazada y requiere correcciones. **Listo cuando:** resultado organizado en seis grupos (dos estados por tres tipos), con cada petición exitosa o error explícito.
4. **Mostrar únicamente campos presentes.** Para cada registro, presenta título/identificador y estado; añade fecha límite solo si la API devuelve un campo identificable de fecha límite. No inventes fecha, prioridad ni datos ausentes. Si no hay resultados en un grupo, informa cero registros devueltos por ese filtro. **Listo cuando:** conteos corresponden a respuestas observadas y los ausentes se marcan como no proporcionados.
5. **Verificar el resultado.** No considerar un error HTTP o respuesta inesperada como lista vacía; indicar el grupo cuya consulta falló. No mostrar cuerpos completos, datos personales de terceros ni credenciales. **Listo cuando:** resumen distingue éxito parcial/completo de falla.

## Límites de escritura y privacidad

- Solo GET. Nunca llamar a `PUT /v1/assignment/task/{task_id}` ni a `POST /v1/assignment/task/{task_id}/deliver`.
- No consultar actividad de otros estudiantes ni endpoints agregados del cohorte.
- No guardar las respuestas académicas en archivos ni registrar cabeceras/cuerpo bruto.

## Helper

Ejecuta `node "<directorio de esta skill>/scripts/list-pending.mjs"`. El helper intenta identificar la cohorte y, aunque ese endpoint falle, consulta las seis combinaciones de estado/tipo sin filtro de cohorte; informa claramente la limitación y no atribuye el resultado a AI Engineering sin verificación. **Listo cuando:** salida JSON indica estado, situación de cohorte, grupos y conteos; cada error queda separado de listas vacías.
