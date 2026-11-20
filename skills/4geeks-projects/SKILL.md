---
name: 4geeks-projects
description: "Consulta en modo solo lectura los proyectos académicos asignados a Agos y sus estados/entregas desde 4Geeks/BreatheCode; no modifica ni entrega tareas."
---

# Consultar proyectos académicos asignados

Usa esta skill cuando Agos pida ver sus proyectos asignados, estado actual o estado de entrega. Sigue `../../docs/STUDENT_API_CALLS_REFERENCE.es.md` como contrato de referencia y `../4geeks-auth/SKILL.md` para autenticación segura.

## Procedimiento

1. **Confirmar token y base API sin revelar secretos.** Reutiliza la variable existente `TOKEN_4GEEKS`; no pidas que se comparta en el chat, no imprimas variables, cabeceras ni token. Usa `BREATHECODE_API_URL` si está configurada; si no, la URL de producción documentada `https://breathecode.herokuapp.com`. Si falta token, detente. **Listo cuando:** credencial disponible solo en memoria y base definida.
2. **Listar asignaciones de tipo proyecto.** Llama solo con GET a `/v1/assignment/user/me/task`, enviando `task_type=PROJECT`, y paginación `limit`/`offset`. No filtres por estado salvo que Agos lo pida, para incluir todos los estados. Recorre páginas hasta que una venga vacía o no queden resultados; no excedas un máximo de 10 páginas por ejecución. Envía `Authorization: Token <token>`. **Listo cuando:** se obtuvo la colección, o se informa error sin contenido sensible.
3. **Seleccionar campos útiles.** Extrae de forma defensiva campos presentes: identificador, título/nombre del proyecto, `task_status`, `task_type`, fechas y metadatos de entrega/revisión. La forma exacta depende de la respuesta del servidor. No inventes nombres ni traduzcas estados a datos distintos; si un campo no está presente, indícalo como no proporcionado. **Listo cuando:** cada registro representa una asignación tipo proyecto de la API y los campos ausentes quedan explícitos.
4. **Consultar detalle si hace falta.** Si el listado carece de información necesaria y contiene un ID de tarea, puedes hacer GET a `/v1/assignment/task/{task_id}` por cada proyecto hasta un máximo de 10 detalles por ejecución. No envíes parámetros sensibles innecesarios y no muestres cuerpos sin filtrar. **Listo cuando:** se agregaron solo campos pertinentes y la consulta fue de lectura.
5. **Explicar los resultados.** Muestra una lista breve con proyecto y estado. Usa los estados documentados literalmente: `PENDING` pendiente, `DONE` completada por estudiante, `APPROVED` aprobada, `REJECTED` rechazada; otros valores se citan tal cual y se marcan como no definidos por la guía. Diferencia claramente estado de tarea y estado de entrega; no afirmes que existe un enlace/entrega si el campo no vino en la respuesta. Si no hay registros, informa que la API devolvió cero asignaciones con `task_type=PROJECT`, no que no existan proyectos en absoluto. **Listo cuando:** resumen refleja la respuesta observada y sus límites.

## Seguridad y límites

- Solo `GET`. Prohibido usar `PUT /v1/assignment/task/{task_id}` o `POST /v1/assignment/task/{task_id}/deliver`, incluso si hay URLs o botones disponibles.
- Nunca exponer token, cabeceras Authorization, emails, datos ajenos al usuario o respuesta API completa.
- No consultar actividad de otros estudiantes ni endpoint agregado/de cohorte.
- No guardar en disco respuestas académicas ni usar logs de depuración.
- Si el endpoint de lista no devuelve tareas tipo proyecto o no incluye estados/entregas, dilo expresamente; no extrapoles desde el catálogo de assets.

## Helper

Ejecuta `node "<directorio de esta skill>/scripts/list-projects.mjs"` para una consulta real. El helper emite JSON normalizado a stdout con únicamente datos académicos del usuario necesarios para mostrar proyectos y estados, nunca token/cabeceras/cuerpo original. Trátalo como información privada: no copies a canales compartidos. **Listo cuando:** salida contiene proyectos normalizados y estado de la petición, o una categoría de fallo no sensible.
