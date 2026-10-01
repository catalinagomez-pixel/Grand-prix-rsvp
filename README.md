# RSVP · Private Executive Dinner · VTEX Grand Prix Medellín

Landing de confirmación de asistencia. Sin frameworks ni dependencias.

## Archivos

- `index.html`: la página (formulario y las dos pantallas finales).
- `styles.css`: estilos, mobile first.
- `app.js`: validación, estado de carga, envío y pantallas finales.
- `api/rsvp.js`: función serverless de Vercel que reenvía la respuesta al webhook de Make.
- `assets/`: logos de VTEX Grand Prix y VTEX, en blanco. Conviene reemplazarlos por los archivos originales de Brand manteniendo el mismo nombre.

## Datos que se envían a Make

```json
{
  "nombre": "…",
  "empresa": "…",
  "email": "…",
  "estadoRsvp": "CONFIRMADO | NO_ASISTIRA",
  "fuente": "GRAND_PRIX_SAVE_THE_DATE"
}
```

## Por qué hay una función en /api

El navegador no envía los datos directo a Make, sino a `/api/rsvp`, y esa función los reenvía al webhook:

1. La URL del webhook no queda visible en el código de la página, así que nadie puede copiarla y llenar el Google Sheet con datos falsos.
2. Se evitan bloqueos del navegador (CORS) al llamar a un dominio externo. Además, la página solo muestra la pantalla final cuando Make confirma que recibió los datos.
3. La función vuelve a validar los datos y fija `fuente` en `GRAND_PRIX_SAVE_THE_DATE`, venga lo que venga del navegador.

La URL del webhook NO está en el código. `api/rsvp.js` la lee únicamente de la variable de entorno `MAKE_WEBHOOK_URL`. Si esa variable no existe, la API responde con un error de configuración y no envía nada.

## Publicar en Vercel

Opción A, sin terminal:
1. Crea un repositorio en GitHub y sube esta carpeta tal como está.
2. En vercel.com, entra a Add New > Project e importa el repositorio.
3. Antes de pulsar Deploy, abre Environment Variables y agrega `MAKE_WEBHOOK_URL` con la URL del webhook de Make. Luego pulsa Deploy.
4. Si agregas o cambias la variable después de publicar, haz un Redeploy para que tome efecto.

Opción B, con terminal:
1. `npm i -g vercel`
2. Desde esta carpeta: `vercel` para una versión de prueba, y `vercel --prod` para publicar.

## Previsualizar en tu computador

- Solo para ver el diseño: abre `index.html` en el navegador. El envío no funciona así porque falta la función de `/api`.
- Con el envío funcionando: desde esta carpeta, `npx vercel dev`. Ojo: esto envía respuestas reales a Make.
