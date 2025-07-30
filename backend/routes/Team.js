import express from 'express';
import { createTeam, updateTeam, deleteTeam, getTeam } from '../controllers/TeamController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/getNames', getTeam);
router.post('/register', createTeam);
router.put('/update/:id', updateTeam);
router.delete('/:name', deleteTeam);

export default router;