# Despliegue del frontend

El flujo de ramas (`Developer/<nombre>` → `develop` → `produccion`) y la configuración completa de Railway están en `DESPLIEGUE.md` del repo del backend. Aquí solo va lo propio del frontend.

1. Crea la rama `produccion` **una sola vez**:

   ```bash
   git checkout develop && git pull
   git checkout -b produccion && git push -u origin produccion
   ```

2. En Railway, crea un servicio con este repo que despliegue desde la rama `produccion`. Se construye con el `Dockerfile`.
3. Agrega la variable de build:

   ```env
   VITE_API_URL=https://<backend>.up.railway.app
   ```

   Se fija **al compilar**. Si cambia la URL del backend, hay que volver a desplegar el frontend.
4. **Puerto:** nginx escucha en el `80`. Al generar el dominio público en Railway, indica el puerto 80.
5. Copia la URL pública del frontend en la variable `FRONTEND_URL` del backend, que también controla CORS.

Para publicar cambios: haz merge de `develop` en `produccion` y luego `git push`. Railway despliega solo.
