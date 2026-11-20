---
name: 4geeks-auth
description: "Verifica de forma segura si TOKEN_4GEEKS está configurado y si el token autentica una consulta de solo lectura a la API de estudiantes de 4Geeks/BreatheCode; nunca muestra ni registra secretos ni datos personales."
---

# Verificar autenticación 4Geeks

Usa esta skill cuando Agos pida comprobar la configuración o validez del token de 4Geeks. Esta verificación no inicia sesión ni obtiene/reemplaza credenciales: usa únicamente `TOKEN_4GEEKS` ya configurada. No solicites que pegue el token en el chat.

## Procedimiento

1. **Comprobar configuración sin imprimir el valor.** Comprueba únicamente si `TOKEN_4GEEKS` está presente y no vacía. Nunca uses `echo`, `set`, `env`, depuración HTTP ni trazas que puedan revelar el valor. Si falta, informa que no se puede probar y detente. **Listo cuando:** solo se conoce el estado presente/ausente.
2. **Elegir la instancia.** Usa `BREATHECODE_API_URL` si está configurada; si no, usa `https://breathecode.herokuapp.com`, base de producción indicada por `docs/STUDENT_API_CALLS_REFERENCE.es.md`. No imprimas la URL si contiene credenciales o datos sensibles; una URL base pública normal sí puede indicarse. **Listo cuando:** la base URL está definida sin inferir una instancia privada.
3. **Validar con una lectura inocua.** Envía `GET /v1/admissions/user/me` con `Authorization: Token <valor de TOKEN_4GEEKS>`. No incluyas el token en argumentos de proceso, archivos, URL, logs o salida. No hagas `POST /v1/auth/login`: esta skill no gestiona credenciales. **Listo cuando:** la petición terminó o se registró una falla de transporte sin contenido sensible.
4. **Interpretar sin filtrar datos.** `2xx` indica que el servidor aceptó la autenticación para ese endpoint; `401` indica rechazo/no autenticación; `403` indica que el token fue reconocido pero no autorizado para esa operación (según el servidor); otros códigos no demuestran que el token sea inválido. DNS, TLS, timeout y errores de servidor son fallas de prueba, no pruebas de invalidez. No muestres cuerpo, cabeceras, identidad, email ni fragmento del token. **Listo cuando:** se informa el código/resultado sin datos de respuesta.
5. **Reportar alcance.** Aclara que una lectura exitosa verifica el acceso a ese endpoint en ese momento, no todos los permisos ni la vigencia futura. **Listo cuando:** el resultado distingue token aceptado, rechazado y prueba inconclusa.

## Herramienta de comprobación local

Ejecuta `node "<ruta de esta skill>/scripts/check-auth.mjs"` en un entorno donde `TOKEN_4GEEKS` esté disponible. El script realiza solo la petición GET indicada y emite un resultado mínimo; no escribe respuesta, cabeceras ni token en disco ni en stdout. No actives trazas de red/proceso. **Listo cuando:** la salida es únicamente estado de configuración, resultado/código HTTP y, si falla, una categoría de error no sensible.

## Límites

- Solo lectura. No actualices ni entregues tareas; no cambies configuración, no hagas login ni solicites tokens por chat.
- El token debe provenir de una variable/gestor de secretos seguro; nunca lo copies en el repositorio.
- No afirmes que la autenticación está verificada si no hubo respuesta HTTP concluyente.
