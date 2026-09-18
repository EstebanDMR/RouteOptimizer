import { Router } from 'express';
import { scenarioController } from '../controllers/scenarioController';

const router = Router();

router.get('/', (req, res) => scenarioController.getAll(req, res));
router.get('/:id', (req, res) => scenarioController.getById(req, res));
router.post('/generate', (req, res) => scenarioController.generateRandom(req, res));
router.post('/', (req, res) => scenarioController.createCustom(req, res));

export default router;
