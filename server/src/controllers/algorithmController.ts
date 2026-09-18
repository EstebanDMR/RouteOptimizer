import { Request, Response } from 'express';
import { validateAlgorithmRequest } from '../utils/validation';
import { algorithmService } from '../services/algorithmService';
import { AlgorithmRequest } from '@shared/types/graph';

export class AlgorithmController {
  public executeDijkstra(req: Request, res: Response): void {
    const validation = validateAlgorithmRequest(req.body);
    if (!validation.isValid) {
      res.status(validation.statusCode || 400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    try {
      const result = algorithmService.runDijkstra(req.body as AlgorithmRequest);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error interno al ejecutar Dijkstra';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  public executeAStar(req: Request, res: Response): void {
    const validation = validateAlgorithmRequest(req.body);
    if (!validation.isValid) {
      res.status(validation.statusCode || 400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    try {
      const result = algorithmService.runAStar(req.body as AlgorithmRequest);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error interno al ejecutar A*';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  public executeCompare(req: Request, res: Response): void {
    const validation = validateAlgorithmRequest(req.body);
    if (!validation.isValid) {
      res.status(validation.statusCode || 400).json({
        success: false,
        error: validation.error,
      });
      return;
    }

    try {
      const result = algorithmService.runComparison(req.body as AlgorithmRequest);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error interno al comparar algoritmos';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
}

export const algorithmController = new AlgorithmController();
