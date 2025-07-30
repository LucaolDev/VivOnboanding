import express from 'express';
import { createTrail, updateTrail, getTrails, deleteTrail } from '../controllers/TrailController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', createTrail);
router.put('/update/:id', updateTrail);
router.get('/allTrails', getTrails);
router.delete('/delete/:id', deleteTrail);

export default router;

