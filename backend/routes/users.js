import express from 'express';
import {
  registerUser,
  loginUser,
  getUsers,
  getLoginLogs,
  updateUser,
  deleteUser,
  getFrequentUsers,
  checkFrequentUser
} from '../controllers/userController.js';

import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/list', verifyToken, requireRole(['admin']), getUsers);
router.get('/logs', verifyToken, requireRole(['admin']), getLoginLogs);
router.put('/:id', verifyToken, requireRole(['admin']), updateUser);
router.delete('/:id', verifyToken, requireRole(['admin']), deleteUser);
router.get('/frequent', verifyToken, requireRole(['admin']), getFrequentUsers);
router.post('/check-frequent', checkFrequentUser);

export default router;

