# Dashboard La Tinta Fine Art Print

Dashboard de Analytics y Canvas de Estrategias para La Tinta Fine Art Print.

## Características

- **Métricas**: KPIs, gráficos de revenue, órdenes, categorías
- **Canvas de Estrategias**: Editor CRUD para estrategias de venta IA
- **API Endpoint**: `/api/system-prompt` para integración con n8n
- **Persistencia**: Upstash Redis para guardar estrategias

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Recharts
- Upstash Redis
- Sonner (toasts)

## Uso

```bash
npm install
npm run dev
```

## Variables de Entorno

Para persistencia de estrategias, configurar en Vercel:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Desarrollado por

[TRAID Agency](https://traidagency.com)
