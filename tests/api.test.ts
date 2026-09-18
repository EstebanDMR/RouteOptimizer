import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/src/app';
import { smallCityScenario } from '../server/src/data/scenarios';

describe('Express Backend API Endpoints', () => {
  it('GET /api/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/scenarios returns the 3 default city presets', async () => {
    const res = await request(app).get('/api/scenarios');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);

    const ids = res.body.data.map((s: { id: string }) => s.id);
    expect(ids).toContain('small-city');
    expect(ids).toContain('medium-city');
    expect(ids).toContain('large-city');
  });

  it('GET /api/scenarios/:id returns specific scenario or 404', async () => {
    const res = await request(app).get('/api/scenarios/small-city');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('small-city');
    expect(res.body.data.nodeCount).toBe(10);

    const notFound = await request(app).get('/api/scenarios/non-existent-id');
    expect(notFound.status).toBe(404);
  });

  it('POST /api/algorithms/dijkstra calculates shortest path and returns steps', async () => {
    const payload = {
      graph: smallCityScenario.graph,
      startNodeId: 'A',
      targetNodeId: 'J',
    };

    const res = await request(app)
      .post('/api/algorithms/dijkstra')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const result = res.body.data;

    expect(result.algorithm).toBe('dijkstra');
    expect(result.path[0]).toBe('A');
    expect(result.path[result.path.length - 1]).toBe('J');
    expect(result.totalDistance).toBeGreaterThan(0);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.unreachable).toBe(false);
  });

  it('POST /api/algorithms/astar calculates path and returns steps', async () => {
    const payload = {
      graph: smallCityScenario.graph,
      startNodeId: 'A',
      targetNodeId: 'J',
    };

    const res = await request(app)
      .post('/api/algorithms/astar')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const result = res.body.data;

    expect(result.algorithm).toBe('astar');
    expect(result.path[0]).toBe('A');
    expect(result.path[result.path.length - 1]).toBe('J');
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.unreachable).toBe(false);
  });

  it('POST /api/algorithms/astar rejects metric "time" with HTTP 400', async () => {
    const payload = {
      graph: smallCityScenario.graph,
      startNodeId: 'A',
      targetNodeId: 'J',
      metric: 'time',
    };

    const res = await request(app)
      .post('/api/algorithms/astar')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('A* solo admite la optimización por "distance"');
  });

  it('POST /api/algorithms/compare compares Dijkstra and A* on identical graph', async () => {
    const payload = {
      graph: smallCityScenario.graph,
      startNodeId: 'A',
      targetNodeId: 'J',
    };

    const res = await request(app)
      .post('/api/algorithms/compare')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const comparison = res.body.data;

    expect(comparison.sameOptimalDistance).toBe(true);
    expect(comparison.dijkstra.totalDistance).toBe(comparison.astar.totalDistance);
    expect(typeof comparison.visitedNodesDelta).toBe('number');
  });

  it('POST /api/algorithms/dijkstra rejects negative edge weights with HTTP 400', async () => {
    const invalidPayload = {
      graph: {
        nodes: [
          { id: 'A', label: 'A', x: 0, y: 0 },
          { id: 'B', label: 'B', x: 10, y: 0 },
        ],
        edges: [
          { id: 'neg', from: 'A', to: 'B', weight: -10 },
        ],
      },
      startNodeId: 'A',
      targetNodeId: 'B',
    };

    const res = await request(app)
      .post('/api/algorithms/dijkstra')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('pesos negativos');
  });

  it('POST /api/algorithms/dijkstra rejects nonexistent nodes with HTTP 400', async () => {
    const invalidPayload = {
      graph: smallCityScenario.graph,
      startNodeId: 'UNKNOWN_NODE',
      targetNodeId: 'J',
    };

    const res = await request(app)
      .post('/api/algorithms/dijkstra')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('no existe en el grafo');
  });

  it('POST /api/scenarios/generate generates a connected graph with HTTP 201', async () => {
    const res = await request(app)
      .post('/api/scenarios/generate')
      .send({ nodeCount: 15 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.graph.nodes.length).toBe(15);
    expect(res.body.data.graph.edges.length).toBeGreaterThan(14);
  });
});
