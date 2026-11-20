---
name: 4geeks-learning-path
description: "Busca recursos educativos de 4Geeks por tecnología, dificultad o palabras clave, y distingue catálogo general de contenido confirmado del programa propio."
---

# Explorar recursos de aprendizaje 4Geeks

Usa esta skill cuando Agos quiera descubrir lecciones, ejercicios, proyectos o tecnologías educativas. Sigue `../../docs/STUDENT_API_CALLS_REFERENCE.es.md`.

## Procedimiento

1. Busca assets en `GET /v1/registry/asset` con filtros documentados: `asset_type` (LESSON, EXERCISE, PROJECT), `technologies`, `difficulty`, `like` y `limit`. La consulta del catálogo requiere token según configuración del API; usa `TOKEN_4GEEKS` solo en memoria y nunca lo expongas. Listo cuando se reporta éxito o el error concreto.
2. Para información extendida de un recurso, consulta `GET /v1/registry/asset/{asset_slug}` solo con slug tomado de un resultado del catálogo. Lista tecnologías mediante `GET /v1/registry/technology` con búsqueda opcional `like` y `limit`.
3. Si sirve para contextualizar, consulta `GET /v1/admissions/public/syllabus`, sin autenticación. No afirmes que los recursos del catálogo pertenecen a AI Engineering salvo que una relación/campo o syllabus lo confirme explícitamente; los recursos sin esa evidencia se etiquetan como catálogo general.
4. Resume resultados con título/slug, tipo, dificultad y tecnologías solo si la respuesta los ofrece. No inventes campos, no imprimas cuerpos completos. Distingue endpoint fallido de búsqueda vacía.
5. Toda operación es solo GET. No hacer cambios en recursos ni tareas académicas.

## Helper

Usa `node "<directorio de esta skill>/scripts/search-learning.mjs" [palabras clave]`. Acepta filtros opcionales en variables `ASSET_TYPE`, `TECHNOLOGIES`, `DIFFICULTY`, `ASSET_LIMIT`, `TECHNOLOGY_QUERY`, `DETAIL_SLUG`. Incluye autenticación solo si `TOKEN_4GEEKS` existe; si falta y el endpoint protegido lo exige, informa el HTTP real sin revelar secretos. El syllabus público se consulta independientemente.
