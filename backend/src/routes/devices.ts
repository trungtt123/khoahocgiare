import { Router } from 'express';
import { checkDevice, getDevices, deleteDevice, getDevicesByUser } from '../controllers/deviceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware); // All device routes require auth

router.post('/check', checkDevice);
router.get('/', getDevices);
router.get('/user/:userId', getDevicesByUser);
router.delete('/:id', deleteDevice);

export default router;
