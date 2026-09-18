import { ScenarioPreset } from '@shared/types/graph';
import { defaultScenarios } from '../data/scenarios';
import { generateRandomConnectedGraph, GeneratorOptions } from '../data/generator';

export class ScenarioService {
  private customScenarios: Map<string, ScenarioPreset> = new Map();

  public getAllScenarios(): ScenarioPreset[] {
    const list = [...defaultScenarios];
    for (const custom of this.customScenarios.values()) {
      list.push(custom);
    }
    return list;
  }

  public getScenarioById(id: string): ScenarioPreset | undefined {
    const foundDefault = defaultScenarios.find((s) => s.id === id);
    if (foundDefault) return foundDefault;
    return this.customScenarios.get(id);
  }

  public generateRandom(options?: GeneratorOptions): ScenarioPreset {
    const scenario = generateRandomConnectedGraph(options);
    this.customScenarios.set(scenario.id, scenario);
    return scenario;
  }

  public saveCustomScenario(scenario: ScenarioPreset): ScenarioPreset {
    this.customScenarios.set(scenario.id, scenario);
    return scenario;
  }
}

export const scenarioService = new ScenarioService();
