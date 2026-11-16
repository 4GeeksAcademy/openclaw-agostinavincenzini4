# Diseño de skills personalizadas para Agos

## Criterios compartidos

- **Perfil:** Agos estudia en 4Geeks Academy y necesita explicaciones amigables, didácticas y aptas para principiantes.
- **Idioma y tono:** responder siempre en español, con términos técnicos definidos y ejemplos breves cuando ayuden.
- **Incertidumbre:** distinguir datos conocidos de inferencias y preguntar si falta un detalle importante.
- **Seguridad:** antes de cualquier acción externa o que cambie estado, mostrar la propuesta y esperar una aprobación explícita. No asumir que un servicio está conectado si no se verificó.
- **Herramientas actuales:** Gmail y Google Calendar están conectados a la cuenta `canitoy90@gmail.com`; Calendar reportó UTC, así que las horas se presentan y convierten usando `Europe/Madrid`. No agregar conexiones, OAuth ni servicios nuevos para este proyecto.

## Skill 1 — `plan-estudio-4geeks`

**Tarea recurrente objetivo:** organizar consignas y temas del curso en pasos de estudio concretos; opcionalmente reservar un bloque en Google Calendar tras aprobación.

### ¿Qué hace la skill?

Resume una tarea de 4Geeks, la descompone en pasos pequeños y ordenados, propone tiempos razonables y ayuda a Agos a iniciar por el primer paso. Puede consultar Calendar para contextualizar el plan. Si se solicita crear un evento, primero presenta el resumen exacto (título, fecha, hora, duración y `Europe/Madrid`) y no escribe nada hasta recibir aprobación explícita para esa propuesta.

### ¿Qué información necesita?

- La consigna, tema o entrega real que Agos quiere estudiar.
- Fecha límite, si existe.
- Tiempo disponible y, si se requiere un evento, disponibilidad/preferencia horaria.
- Si un dato importante falta o es ambiguo, hacer una pregunta concreta; no inventar el horario ni el alcance.

### ¿Qué resultado debe producir?

- Un plan en español claro con pasos ordenados, duración aproximada, objetivo de cada paso y una primera acción sencilla.
- Si se aprueba una escritura en Calendar: crear el evento en el calendario principal `canitoy90@gmail.com`, usar `Europe/Madrid`, consultar/verificar el resultado y confirmar qué hora quedó registrada. Sin aprobación, entregar solo el plan y la propuesta de evento.

### Personalización visible

Debe dirigirse a Agos, explicar conceptos como a una estudiante principiante de 4Geeks, declarar supuestos y pedir aprobación antes de escribir en Calendar.

## Skill 2 — `traductor-tutor-tecnico`

**Tarea recurrente objetivo:** traducir y comprender consignas, mensajes y vocabulario técnico entre español e inglés como apoyo al estudio.

### ¿Qué hace la skill?

Traduce un texto técnico entre español e inglés y explica su significado práctico para una persona principiante. Conserva literalmente código, comandos, rutas, identificadores y nombres propios cuando traducirlos los pudiera romper o volver ambiguos. No requiere ni configura una integración externa.

### ¿Qué información necesita?

- El texto o término auténtico que Agos quiere trabajar.
- Idioma de destino; si no es evidente, preguntar.
- Propósito (entender para estudiar o preparar una traducción formal) si afecta de manera importante el tono. No completar texto ausente ni inventar contexto.

### ¿Qué resultado debe producir?

- Traducción al idioma pedido.
- Explicación sencilla de la intención, especialmente si es una consigna académica.
- Glosario breve bilingüe o nota de ambigüedad cuando aporte valor; preservar sin cambios fragmentos de código.

### Personalización visible

Responder en español, explicar vocabulario para una estudiante principiante de 4Geeks y distinguir el sentido seguro de cualquier interpretación incierta.

## Pruebas personales previstas

- Para `plan-estudio-4geeks`, usar una consigna real de 4Geeks que Agos ya compartió sobre autenticar una sesión/token. Producir un plan y consultar el calendario real con la integración ya conectada; solicitar confirmación antes de crear evento alguno. Si se autoriza el evento de prueba más adelante, registrar y comprobar su resultado.
- Para `traductor-tutor-tecnico`, traducir y explicar una consigna real del mismo trabajo: “OpenClaw puede verificar que el token es válido y que la sesión está activa.” No usar texto de relleno.

## Estructura de implementación

Cada skill se implementará como una skill OpenClaw estándar en `skills/<nombre>/SKILL.md`, con metadatos `name` y `description`, pasos ejecutables, verificaciones y límites de seguridad. El documento de diseño se versiona primero, en un commit propio, antes de crear los archivos de implementación.

## Resultados de implementación y pruebas

- **Diseño versionado primero:** commit `8eb2a43` (`docs: design two personalized study skills`), anterior a la creación de cualquier `SKILL.md`.
- **Skills implementadas:** `skills/plan-estudio-4geeks/SKILL.md` y `skills/traductor-tutor-tecnico/SKILL.md`. Ambas pasan `quick_validate.py`; `openclaw skills info --agent main ...` las marca como **Ready**, visibles para el modelo y disponibles como comando.
- **Prueba real — plan de estudio:** se utilizó la consigna compartida por Agos sobre verificar un token y una sesión activa. La skill la convierte en pasos: aclarar criterios de validez del token, comprobar la sesión, cubrir casos válidos e inválidos con pruebas, e integrar/documentar según la consigna completa. La lectura de disponibilidad de Calendar verificó un compromiso el 17 de noviembre de 2026, 14:00–15:00 (`Europe/Madrid`), y ningún bloque ocupado el 18 de noviembre. También se buscaron eventos y no se hallaron el 18. No se creó evento alguno: todavía faltan una hora/duración elegidas por Agos y aprobación explícita de una propuesta concreta. Registro verificable de prueba: `.skill-validation/plan-estudio-calendar-test.json`.
- **Prueba real — traducción y tutoría:** texto: “OpenClaw puede verificar que el token es válido y que la sesión está activa.” Traducción: “OpenClaw can verify that the token is valid and that the session is active.” Explicación: OpenClaw puede comprobar dos condiciones: que el token sea aceptado como válido y que la sesión asociada siga activa. “Token” es una credencial digital; “sesión activa” indica que el acceso continúa vigente. Registro de prueba: `.skill-validation/traductor-test.md`.
