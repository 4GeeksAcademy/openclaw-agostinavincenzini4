---
name: plan-estudio-4geeks
description: "Ayuda a Agos a convertir una consigna, tema o entrega real de 4Geeks Academy en un plan de estudio paso a paso apto para principiantes; consulta Google Calendar cuando haga falta y solo crea un bloque de estudio después de mostrar la propuesta y recibir aprobación explícita."
---

# Planificar estudio para 4Geeks Academy

Usa este flujo cuando Agos quiera organizar una tarea, ejercicio, tema o entrega de su formación en 4Geeks. No pretende obtener proyectos, entregas o progreso desde el campus de 4Geeks: no hay acceso verificado a ese sistema. No configures OAuth ni otra conexión como parte de esta skill.

## 1. Entender la tarea

Identifica la consigna auténtica, el tema y el resultado que Agos necesita producir. Si no están en el mensaje o contexto inmediato, pídelos. Pregunta también por fecha límite y tiempo disponible cuando sean importantes para planificar. No inventes requisitos, duración, disponibilidad ni estado de entrega. **Listo cuando:** la tarea que se planifica está identificada y los datos esenciales conocidos están separados de las incógnitas.

## 2. Preparar un plan para principiante

En español, dirígete a Agos por su nombre y desglosa la tarea en pasos pequeños y ordenados. Define brevemente cualquier término técnico nuevo, da un ejemplo concreto si ayuda y haz que el primer paso sea fácil de iniciar. Estima duración solo cuando haya base para ello; presenta la estimación como tal. Si la tarea incluye programación, separa entender el enunciado, implementar, probar y revisar. **Listo cuando:** cada paso tiene un objetivo observable y el plan no presenta suposiciones como hechos.

## 3. Decidir si consultar Calendar

Si Agos pide encajar el plan en su agenda o solicita un evento, verifica primero que Google Calendar sigue habilitado y qué calendario conectado es el principal. Consulta eventos o disponibilidad con la acción de lectura pertinente de Zapier; inspecciona la acción y su esquema antes de usarla. La cuenta verificada es `canitoy90@gmail.com`; las horas para Agos son `Europe/Madrid`, aunque el calendario puede devolver UTC. No infieras disponibilidad si la lectura falla o devuelve datos insuficientes: explícalo y pregunta.

**Listo cuando:** cualquier conflicto/disponibilidad mencionado se basa en el resultado actual de Calendar, convertido a hora de Madrid; de otro modo se indica que no fue posible verificar.

## 4. Proponer el evento, sin escribir todavía

Antes de crear o editar, muestra en español el título, fecha, hora local, duración, zona `Europe/Madrid`, calendario y descripción propuesta. Solicita la aprobación explícita de Agos para esa propuesta concreta. Una aprobación general de la conversación no autoriza una escritura futura distinta. Si falta fecha, hora, duración u otro detalle que el conector requiera, pregunta primero. **Listo cuando:** o bien Agos aprobó expresamente el evento exacto, o la skill se detuvo sin efectuar una escritura.

## 5. Crear y verificar solo después de aprobar

Tras la aprobación específica, inspecciona otra vez la acción exacta de creación y sus parámetros mediante Zapier; no adivines nombres de acción o formato de fecha. Convierte el horario desde `Europe/Madrid` al formato/offset requerido por la acción. Ejecuta únicamente el evento aprobado. Después recupera o inspecciona la respuesta y verifica título, inicio, fin y zona/offset. **Listo cuando:** el evento devuelto coincide con la propuesta aprobada; si no coincide o falla, informa el problema con claridad y no afirmes éxito.

## Formato de salida

1. **Lo que entendí** — tarea y datos confirmados; marca incertidumbres.
2. **Plan de estudio** — pasos numerados, objetivo y duración estimada si es defendible.
3. **Primer paso** — acción pequeña para comenzar.
4. **Calendario** — solo si aplica: eventos/conflictos verificados o limitación de acceso.
5. **Acción pendiente de aprobación** — propuesta exacta de evento, si corresponde. Nunca decir “agendado” antes de verificar la escritura.
