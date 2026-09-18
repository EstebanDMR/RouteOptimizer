import { Request, Response } from 'express';
import { scenarioService } from '../services/scenarioService';
import { ScenarioPreset } from '@shared/types/graph';

export class ScenarioController {
  public getAll(_req: Request, res: Response): void {
    const scenarios = scenarioService.getAllScenarios();
    res.status(200).json({
      success: true,
      data: scenarios,
    });
  }

  public getById(req: Request, res: Response): void {
    const { id } = req.params;
    const scenario = scenarioService.getScenarioById(id);

    if (!scenario) {
      res.status(404).json({
        success: false,
        error: `Escenario con id "${id}" no encontrado.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: scenario,
    });
  }

  public generateRandom(req: Request, res: Response): void {
    const options = req.body || {};
    const scenario = scenarioService.generateRandom(options);

    res.status(201).json({
      success: true,
      data: scenario,
    });
  }

  public createCustom(req: Request, res: Response): void {
    const scenario = req.body as ScenarioPreset;

    if (!scenario || !scenario.name || !scenario.graph) {
      res.status(400).json({
        success: false,
        error: 'El escenario debe incluir al menos "name" y un objeto "graph" válido.',
      });
      return;
    }

    const saved = scenarioService.saveCustomScenario({
      ...scenario,
      id: scenario.id || `custom-${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      data: saved,
    });
  }
}

export const scenarioController = new ScenarioController();
