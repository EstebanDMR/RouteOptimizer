import express, { Request, Response } from 'express';
import cors from 'cors';
import algorithmRoutes from './routes/algorithmRoutes';
import scenarioRoutes from './routes/scenarioRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'RouteOptimizer API',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/scenarios', scenarioRoutes);

// Manejador de rutas no encontradas (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Recurso API no encontrado.',
  });
});

// Manejador global de errores (500)
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor.',
  });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[RouteOptimizer API] Servidor activo en http://localhost:${PORT}`);
  });
}
