import express from 'express';
import { createDepartment, updateDepartment, deleteDepartment, getDepartament } from '../controllers/DepartmentController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/getNames', getDepartament);
router.post('/register', createDepartment);
router.put('/update/:id', updateDepartment);
router.delete('/:name', deleteDepartment);

export default router;