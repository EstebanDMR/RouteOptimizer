import { Router } from 'express';
import { algorithmController } from '../controllers/algorithmController';

const router = Router();

router.post('/dijkstra', (req, res) => algorithmController.executeDijkstra(req, res));
router.post('/astar', (req, res) => algorithmController.executeAStar(req, res));
router.post('/compare', (req, res) => algorithmController.executeCompare(req, res));

export default router;
