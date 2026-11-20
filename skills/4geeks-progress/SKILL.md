---
name: 4geeks-progress
description: "Obtiene un resumen de progreso académico propio usando tareas asignadas y actividad personal; separa indicadores calculados de métricas oficiales y no convierte errores en ceros."
---

# Resumen de progreso académico

Usa esta skill cuando Agos pida un resumen de progreso general. Sigue `../../docs/STUDENT_API_CALLS_REFERENCE.es.md` y el manejo seguro de `TOKEN_4GEEKS` establecido en `../4geeks-auth/SKILL.md`.

## Procedimiento

1. Usa el token existente solo en memoria y la base `BREATHECODE_API_URL` o `https://breathecode.herokuapp.com`; nunca muestres token, cabeceras ni respuestas crudas. Listo cuando token y URL sean válidos.
2. Consulta con GET y paginación `/v1/assignment/user/me/task` sin restringir tipos o estados. Agrega cantidades por estado/tipo solo con respuestas completas. Calcula el porcentaje de tareas completadas como `(DONE + APPROVED) / tareas devueltas con estados reconocidos * 100`; expón numerador, denominador y fórmula. No llames a esta medida progreso oficial del programa.
3. Intenta `GET /v1/activity/me` independientemente de la consulta de cohortes. Si responde correctamente, incluye solo indicadores agregados cuyo nombre y significado sean claros; si 403/error, dilo y conserva los resultados válidos de tareas. No uses endpoint de actividad del cohorte ni datos de otras personas.
4. No llames al resultado de tareas «progreso oficial del programa» salvo que exista y se consulte una métrica oficial documentada. Si se consulta un endpoint que falla, informa error y no lo conviertas en cero. Distingue respuesta vacía exitosa de error HTTP.
5. Verifica que la paginación terminó antes de presentar un porcentaje general. Si hay estados no reconocidos o una página límite, declara métrica parcial/no calculable. No incluir títulos, información personal o cuerpos de respuesta en el resumen por defecto.

## Seguridad

Todas las consultas son GET. Nunca uses `PUT /v1/assignment/task/{task_id}` ni `POST /v1/assignment/task/{task_id}/deliver`. No guardes respuestas académicas ni registres secretos.

## Helper

Ejecuta `node "<directorio de esta skill>/scripts/summarize-progress.mjs"`. Emite únicamente agregados, disponibilidad de endpoints y limitaciones; no imprime registros de tareas ni respuesta cruda de actividad.
