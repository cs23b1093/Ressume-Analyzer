import { Router } from 'express';
import { chatWithResume } from '../controllers/chat.controller.js';

const router = Router();

router.post('/chat', chatWithResume);

export default router;
