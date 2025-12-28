import { Router } from 'express';
import { uploadVideo, getVideos, getVideo, updateVideo, deleteVideo } from '../controllers/videoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware); // All video routes require auth

router.post('/', uploadVideo);
router.get('/', getVideos);
router.get('/:id', getVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

export default router;
