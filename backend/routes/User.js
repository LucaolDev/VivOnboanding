import express from 'express';
import { createUser, loginUser, changePassworUser,getAllUsers, deleteUser} from '../controllers/UserController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.patch('/change-password', changePassworUser);
router.get('/allusers', getAllUsers);
router.delete('/:email', deleteUser);

export default router;