import express from 'express';
import { registerStep, updateStep,deleteStep } from '../controllers/StepController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerStep);
router.put('/register/:id', registerStep);
router.put('/updateStep/:id', updateStep);
router.delete('/delete/:id', deleteStep);

export default router;
