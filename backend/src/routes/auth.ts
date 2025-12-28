import { Router } from 'express';
import { login, getMe, getAllUsers, createUser, updateUserRole, deleteUser, updateUserMaxDevices, updateUserExpiresAt } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, getMe);

// Admin only routes
router.get('/users', authMiddleware, getAllUsers);
router.post('/users', authMiddleware, createUser);
router.put('/users/:userId/role', authMiddleware, updateUserRole);
router.put('/users/:userId/maxDevices', authMiddleware, updateUserMaxDevices);
router.put('/users/:userId/expiresAt', authMiddleware, updateUserExpiresAt);
router.delete('/users/:userId', authMiddleware, deleteUser);

export default router;
